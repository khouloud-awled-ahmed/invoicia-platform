"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EnvelopesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvelopesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const envelope_schema_1 = require("./schemas/envelope.schema");
const workflow_engine_service_1 = require("./workflow-engine.service");
const certificate_service_1 = require("./certificate.service");
let EnvelopesService = EnvelopesService_1 = class EnvelopesService {
    constructor(envelopeModel, workflowEngine, certificateService) {
        this.envelopeModel = envelopeModel;
        this.workflowEngine = workflowEngine;
        this.certificateService = certificateService;
        this.logger = new common_1.Logger(EnvelopesService_1.name);
    }
    async create(createEnvelopeDto, userId, tenantId) {
        const recipients = createEnvelopeDto.recipients.map((rec, index) => ({
            ...rec,
            id: `recipient-${Date.now()}-${index}`,
            routingOrder: index + 1,
            status: envelope_schema_1.RecipientStatus.WAITING,
            color: this.getRecipientColor(index),
        }));
        const documents = createEnvelopeDto.documents.map((doc, index) => ({
            id: doc.id || `doc-${Date.now()}-${index}`,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType || 'application/pdf',
            order: doc.order || index + 1,
        }));
        const envelope = new this.envelopeModel({
            title: createEnvelopeDto.title,
            message: createEnvelopeDto.message,
            expiresAt: createEnvelopeDto.expiresAt ? new Date(createEnvelopeDto.expiresAt) : undefined,
            documents,
            recipients,
            status: envelope_schema_1.EnvelopeStatus.DRAFT,
            currentRoutingOrder: 1,
            createdBy: userId,
            tenantId,
            auditTrail: [{
                    timestamp: new Date(),
                    action: 'ENVELOPE_CREATED',
                    actorEmail: userId,
                    metadata: { title: createEnvelopeDto.title },
                }],
        });
        return envelope.save();
    }
    async findAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status) {
            query.status = filters.status;
        }
        return this.envelopeModel.find(query).sort({ createdAt: -1 }).exec();
    }
    async findOne(id, tenantId) {
        const envelope = await this.envelopeModel.findOne({ _id: id, tenantId }).exec();
        if (!envelope) {
            throw new common_1.NotFoundException(`Enveloppe avec l'ID ${id} non trouvée`);
        }
        return envelope;
    }
    async findByRecipientEmail(email) {
        return this.envelopeModel.find({
            'recipients.email': email,
            status: { $in: [envelope_schema_1.EnvelopeStatus.SENT, envelope_schema_1.EnvelopeStatus.IN_PROGRESS] },
        }).sort({ createdAt: -1 }).exec();
    }
    async update(id, updateEnvelopeDto, tenantId) {
        const envelope = await this.findOne(id, tenantId);
        Object.assign(envelope, updateEnvelopeDto);
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'ENVELOPE_UPDATED',
            metadata: updateEnvelopeDto,
        });
        return envelope.save();
    }
    async addFields(id, fields, tenantId) {
        const envelope = await this.findOne(id, tenantId);
        if (envelope.status !== envelope_schema_1.EnvelopeStatus.DRAFT) {
            throw new common_1.BadRequestException('Impossible d\'ajouter des champs à une enveloppe non brouillon');
        }
        const newFields = fields.map((field) => ({
            ...field,
            id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            required: field.defaultValue !== undefined ? field.defaultValue : true,
        }));
        envelope.fields = [...envelope.fields, ...newFields];
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'FIELDS_ADDED',
            metadata: { fieldsCount: newFields.length },
        });
        return envelope.save();
    }
    async send(id, tenantId, ipAddress) {
        const envelope = await this.findOne(id, tenantId);
        if (envelope.status !== envelope_schema_1.EnvelopeStatus.DRAFT) {
            throw new common_1.BadRequestException('Seules les enveloppes en brouillon peuvent être envoyées');
        }
        if (envelope.fields.length === 0) {
            throw new common_1.BadRequestException('Impossible d\'envoyer une enveloppe sans champs de signature');
        }
        if (envelope.recipients.length === 0) {
            throw new common_1.BadRequestException('Impossible d\'envoyer une enveloppe sans signataires');
        }
        envelope.status = envelope_schema_1.EnvelopeStatus.SENT;
        envelope.currentRoutingOrder = 1;
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'ENVELOPE_SENT',
            ipAddress,
            metadata: { recipientCount: envelope.recipients.length },
        });
        await envelope.save();
        await this.workflowEngine.processEnvelopeSent(envelope);
        return envelope;
    }
    async sign(id, signDto, recipientEmail, ipAddress, userAgent) {
        const envelope = await this.envelopeModel.findOne({
            _id: id,
            'recipients.email': recipientEmail,
        }).exec();
        if (!envelope) {
            throw new common_1.NotFoundException(`Enveloppe avec l'ID ${id} non trouvée ou vous n'êtes pas autorisé`);
        }
        const recipient = envelope.recipients.find((r) => r.email === recipientEmail);
        if (!recipient) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à signer cette enveloppe maintenant');
        }
        if (recipient.status === envelope_schema_1.RecipientStatus.SIGNED) {
            throw new common_1.BadRequestException('Cette enveloppe a déjà été signée par vous');
        }
        if (recipient.securityCode && signDto.securityCode !== recipient.securityCode) {
            throw new common_1.ForbiddenException('Code de sécurité invalide');
        }
        const recipientFields = envelope.fields.filter(f => f.assignedRecipientId === recipient.id);
        const requiredFields = recipientFields.filter(f => f.required);
        const filledFields = signDto.fieldValues.map(fv => fv.fieldId);
        const missingRequiredFields = requiredFields.filter(f => !filledFields.includes(f.id));
        signDto.fieldValues.forEach((fieldValue) => {
            const field = envelope.fields.find((f) => f.id === fieldValue.fieldId && f.assignedRecipientId === recipient.id);
            if (field) {
                if (field.type === envelope_schema_1.FieldType.SIGNATURE && fieldValue.signatureData) {
                    field.signatureData = fieldValue.signatureData;
                    field.value = '[Signature]';
                }
                else {
                    field.value = fieldValue.value || fieldValue.signatureData || field.defaultValue?.toString();
                }
                field.signedAt = new Date();
                field.signedBy = recipientEmail;
            }
        });
        recipient.status = envelope_schema_1.RecipientStatus.SIGNED;
        recipient.signedAt = new Date();
        recipient.ipAddress = ipAddress;
        recipient.userAgent = userAgent;
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'ENVELOPE_SIGNED',
            actorEmail: recipientEmail,
            actorName: recipient.name,
            ipAddress,
            metadata: { recipientId: recipient.id, routingOrder: recipient.routingOrder },
        });
        const nextRecipient = envelope.recipients.find((r) => r.routingOrder === envelope.currentRoutingOrder + 1 && r.role === envelope_schema_1.RecipientRole.SIGNER);
        if (!nextRecipient) {
            envelope.status = envelope_schema_1.EnvelopeStatus.COMPLETED;
            envelope.completedAt = new Date();
            envelope.certificateUrl = await this.certificateService.generateCertificate(envelope);
            try {
                const signedDocumentUrl = await this.certificateService.mergeSignaturesToDocument(envelope);
                if (envelope.documents && envelope.documents.length > 0) {
                    envelope.documents[0].signedFileUrl = signedDocumentUrl;
                }
            }
            catch (error) {
                this.logger.error(`Erreur lors de la génération du document signé : ${error.message}`);
            }
            envelope.auditTrail.push({
                timestamp: new Date(),
                action: 'ENVELOPE_COMPLETED',
                metadata: { completedAt: envelope.completedAt },
            });
            await this.workflowEngine.processEnvelopeCompleted(envelope);
        }
        else {
            envelope.status = envelope_schema_1.EnvelopeStatus.IN_PROGRESS;
            await this.workflowEngine.processNextSigner(envelope, recipient);
        }
        return envelope.save();
    }
    async refuse(id, refuseDto, recipientEmail, ipAddress, userAgent) {
        const envelope = await this.envelopeModel.findOne({
            _id: id,
            'recipients.email': recipientEmail,
        }).exec();
        if (!envelope) {
            throw new common_1.NotFoundException(`Enveloppe avec l'ID ${id} non trouvée ou vous n'êtes pas autorisé`);
        }
        const recipient = envelope.recipients.find((r) => r.email === recipientEmail);
        if (!recipient) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à refuser cette enveloppe maintenant');
        }
        if (recipient.securityCode && refuseDto.securityCode !== recipient.securityCode) {
            throw new common_1.ForbiddenException('Code de sécurité invalide');
        }
        recipient.status = envelope_schema_1.RecipientStatus.REFUSED;
        recipient.refusedAt = new Date();
        recipient.refusalReason = refuseDto.reason;
        recipient.ipAddress = ipAddress;
        recipient.userAgent = userAgent;
        envelope.status = envelope_schema_1.EnvelopeStatus.VOIDED;
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'ENVELOPE_REFUSED',
            actorEmail: recipientEmail,
            actorName: recipient.name,
            ipAddress,
            metadata: { reason: refuseDto.reason, recipientId: recipient.id },
        });
        await envelope.save();
        await this.workflowEngine.processEnvelopeRefused(envelope, recipient);
        return envelope;
    }
    getRecipientColor(index) {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
        return colors[index % colors.length];
    }
    async remove(id, tenantId) {
        const result = await this.envelopeModel.deleteOne({ _id: id, tenantId }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Enveloppe avec l'ID ${id} non trouvée`);
        }
    }
    async getSignedDocumentPath(id, tenantId) {
        const envelope = await this.envelopeModel.findOne({ _id: id, tenantId }).exec();
        if (!envelope) {
            throw new common_1.NotFoundException(`Enveloppe avec l'ID ${id} non trouvée`);
        }
        if (envelope.status !== envelope_schema_1.EnvelopeStatus.COMPLETED) {
            throw new common_1.BadRequestException('Le document n\'est pas encore signé');
        }
        const signedFileUrl = envelope.documents?.[0]?.signedFileUrl;
        if (!signedFileUrl) {
            this.logger.warn(`Document signé non trouvé pour l'enveloppe ${id}`);
            return null;
        }
        const path = require('path');
        const fs = require('fs').promises;
        const cleanUrl = signedFileUrl.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
        const filePath = path.join(process.cwd(), 'uploads', cleanUrl);
        try {
            await fs.access(filePath);
            return filePath;
        }
        catch (error) {
            this.logger.error(`Fichier signé non trouvé à ${filePath}`);
            return null;
        }
    }
    async getCertificatePath(id, tenantId) {
        const envelope = await this.envelopeModel.findOne({ _id: id, tenantId }).exec();
        if (!envelope) {
            throw new common_1.NotFoundException(`Enveloppe avec l'ID ${id} non trouvée`);
        }
        if (envelope.status !== envelope_schema_1.EnvelopeStatus.COMPLETED) {
            throw new common_1.BadRequestException('Le document n\'est pas encore signé');
        }
        const certificateUrl = envelope.certificateUrl;
        if (!certificateUrl) {
            this.logger.warn(`Certificat non trouvé pour l'enveloppe ${id}`);
            return null;
        }
        const path = require('path');
        const fs = require('fs').promises;
        const cleanUrl = certificateUrl.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
        const filePath = path.join(process.cwd(), 'uploads', cleanUrl);
        try {
            await fs.access(filePath);
            return filePath;
        }
        catch (error) {
            this.logger.error(`Certificat non trouvé à ${filePath}`);
            return null;
        }
    }
};
exports.EnvelopesService = EnvelopesService;
exports.EnvelopesService = EnvelopesService = EnvelopesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(envelope_schema_1.Envelope.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        workflow_engine_service_1.WorkflowEngine,
        certificate_service_1.CertificateService])
], EnvelopesService);
//# sourceMappingURL=envelopes.service.js.map