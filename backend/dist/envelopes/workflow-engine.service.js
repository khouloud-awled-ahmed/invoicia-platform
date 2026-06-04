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
var WorkflowEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const common_1 = require("@nestjs/common");
const envelope_schema_1 = require("./schemas/envelope.schema");
const email_service_1 = require("./email.service");
let WorkflowEngine = WorkflowEngine_1 = class WorkflowEngine {
    constructor(emailService) {
        this.emailService = emailService;
        this.logger = new common_1.Logger(WorkflowEngine_1.name);
    }
    async processEnvelopeSent(envelope) {
        const firstRecipient = envelope.recipients.find((r) => r.routingOrder === envelope.currentRoutingOrder && r.role === envelope_schema_1.RecipientRole.SIGNER);
        if (!firstRecipient) {
            this.logger.warn(`Aucun signataire trouvé pour l'ordre ${envelope.currentRoutingOrder} dans l'enveloppe ${envelope._id}`);
            return;
        }
        firstRecipient.status = envelope_schema_1.RecipientStatus.SENT;
        envelope.status = envelope_schema_1.EnvelopeStatus.IN_PROGRESS;
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'RECIPIENT_NOTIFIED',
            actorEmail: firstRecipient.email,
            actorName: firstRecipient.name,
            metadata: { routingOrder: firstRecipient.routingOrder },
        });
        await envelope.save();
        await this.emailService.sendSignatureRequestEmail(envelope, firstRecipient);
        this.logger.log(`Email envoyé au premier signataire: ${firstRecipient.email} (ordre ${firstRecipient.routingOrder})`);
    }
    async processNextSigner(envelope, signedRecipient) {
        const nextOrder = signedRecipient.routingOrder + 1;
        const nextRecipient = envelope.recipients.find((r) => r.routingOrder === nextOrder && r.role === envelope_schema_1.RecipientRole.SIGNER);
        if (nextRecipient) {
            nextRecipient.status = envelope_schema_1.RecipientStatus.SENT;
            envelope.currentRoutingOrder = nextOrder;
            envelope.auditTrail.push({
                timestamp: new Date(),
                action: 'ROUTING_ADVANCED',
                actorEmail: signedRecipient.email,
                actorName: signedRecipient.name,
                metadata: {
                    fromOrder: signedRecipient.routingOrder,
                    toOrder: nextOrder,
                    nextRecipientEmail: nextRecipient.email,
                },
            });
            await envelope.save();
            await this.emailService.sendSignatureRequestEmail(envelope, nextRecipient);
            this.logger.log(`Email envoyé au signataire suivant: ${nextRecipient.email} (ordre ${nextOrder})`);
        }
        else {
            const allSigners = envelope.recipients.filter((r) => r.role === envelope_schema_1.RecipientRole.SIGNER);
            const allSigned = allSigners.every((r) => r.status === envelope_schema_1.RecipientStatus.SIGNED);
            if (allSigned) {
                await this.processEnvelopeCompleted(envelope);
            }
            else {
                this.logger.warn(`Pas de signataire suivant pour l'ordre ${nextOrder}, mais tous n'ont pas signé`);
            }
        }
    }
    async processEnvelopeCompleted(envelope) {
        const allParticipants = envelope.recipients;
        for (const participant of allParticipants) {
            await this.emailService.sendEnvelopeCompletedEmail(envelope, participant);
        }
        this.logger.log(`Enveloppe ${envelope._id} complétée, emails envoyés à ${allParticipants.length} participants`);
    }
    async processEnvelopeRefused(envelope, refusingRecipient) {
        envelope.status = envelope_schema_1.EnvelopeStatus.VOIDED;
        envelope.auditTrail.push({
            timestamp: new Date(),
            action: 'ENVELOPE_REFUSED',
            actorEmail: refusingRecipient.email,
            actorName: refusingRecipient.name,
            ipAddress: refusingRecipient.ipAddress,
            metadata: {
                reason: refusingRecipient.refusalReason,
                routingOrder: refusingRecipient.routingOrder,
            },
        });
        await envelope.save();
        const allParticipants = envelope.recipients.filter((r) => r.id !== refusingRecipient.id);
        for (const participant of allParticipants) {
            await this.emailService.sendEnvelopeRefusedEmail(envelope, participant, refusingRecipient);
        }
        await this.emailService.sendEnvelopeRefusedNotificationToCreator(envelope, refusingRecipient);
        this.logger.log(`Enveloppe ${envelope._id} refusée par ${refusingRecipient.email} (ordre ${refusingRecipient.routingOrder})`);
    }
};
exports.WorkflowEngine = WorkflowEngine;
exports.WorkflowEngine = WorkflowEngine = WorkflowEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], WorkflowEngine);
//# sourceMappingURL=workflow-engine.service.js.map