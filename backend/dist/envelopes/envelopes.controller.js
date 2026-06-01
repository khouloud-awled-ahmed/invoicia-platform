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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvelopesController = void 0;
const common_1 = require("@nestjs/common");
const envelopes_service_1 = require("./envelopes.service");
const create_envelope_dto_1 = require("./dto/create-envelope.dto");
const update_envelope_dto_1 = require("./dto/update-envelope.dto");
const sign_envelope_dto_1 = require("./dto/sign-envelope.dto");
const refuse_envelope_dto_1 = require("./dto/refuse-envelope.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let EnvelopesController = class EnvelopesController {
    constructor(envelopesService) {
        this.envelopesService = envelopesService;
    }
    async create(createEnvelopeDto, user, req) {
        return this.envelopesService.create(createEnvelopeDto, user.id || user._id, user.tenantId || req.user?.tenantId);
    }
    async findAll(user, req, status) {
        const tenantId = user.tenantId || req.user?.tenantId;
        return this.envelopesService.findAll(tenantId, status ? { status: status } : undefined);
    }
    async findMySignatures(email) {
        if (!email) {
            throw new common_1.BadRequestException('Email query parameter is required');
        }
        return this.envelopesService.findByRecipientEmail(email);
    }
    async findOne(id, user, req) {
        const tenantId = user.tenantId || req.user?.tenantId;
        return this.envelopesService.findOne(id, tenantId);
    }
    async update(id, updateEnvelopeDto, user, req) {
        const tenantId = user.tenantId || req.user?.tenantId;
        return this.envelopesService.update(id, updateEnvelopeDto, tenantId);
    }
    async addFields(id, body, user, req) {
        const tenantId = user.tenantId || req.user?.tenantId;
        const fields = Array.isArray(body) ? body : (body.fields || []);
        return this.envelopesService.addFields(id, fields, tenantId);
    }
    async send(id, user, req) {
        const tenantId = user.tenantId || req.user?.tenantId;
        const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        return this.envelopesService.send(id, tenantId, ipAddress);
    }
    async sign(id, signDto, email, req) {
        if (!email) {
            throw new common_1.BadRequestException('Email query parameter is required');
        }
        const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        return this.envelopesService.sign(id, signDto, email, ipAddress, userAgent);
    }
    async refuse(id, refuseDto, email, req) {
        if (!email) {
            throw new common_1.BadRequestException('Email query parameter is required');
        }
        const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        return this.envelopesService.refuse(id, refuseDto, email, ipAddress, userAgent);
    }
    async downloadSignedDocument(id, user, req, res) {
        const tenantId = user.tenantId || req.user?.tenantId;
        const filePath = await this.envelopesService.getSignedDocumentPath(id, tenantId);
        if (!filePath) {
            throw new common_1.NotFoundException('Document signé non trouvé');
        }
        const path = require('path');
        const fileName = path.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);
    }
    async downloadCertificate(id, user, req, res) {
        const tenantId = user.tenantId || req.user?.tenantId;
        const filePath = await this.envelopesService.getCertificatePath(id, tenantId);
        if (!filePath) {
            throw new common_1.NotFoundException('Certificat non trouvé');
        }
        const path = require('path');
        const fileName = path.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="certificat-${id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);
    }
    async remove(id, user, req) {
        const tenantId = user.tenantId || req.user?.tenantId;
        await this.envelopesService.remove(id, tenantId);
    }
};
exports.EnvelopesController = EnvelopesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_envelope_dto_1.CreateEnvelopeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-signatures'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "findMySignatures", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_envelope_dto_1.UpdateEnvelopeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/fields'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "addFields", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/sign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('email')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sign_envelope_dto_1.SignEnvelopeDto, String, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "sign", null);
__decorate([
    (0, common_1.Post)(':id/refuse'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('email')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, refuse_envelope_dto_1.RefuseEnvelopeDto, String, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "refuse", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "downloadSignedDocument", null);
__decorate([
    (0, common_1.Get)(':id/download-certificate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "downloadCertificate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EnvelopesController.prototype, "remove", null);
exports.EnvelopesController = EnvelopesController = __decorate([
    (0, common_1.Controller)('envelopes'),
    __metadata("design:paramtypes", [envelopes_service_1.EnvelopesService])
], EnvelopesController);
//# sourceMappingURL=envelopes.controller.js.map