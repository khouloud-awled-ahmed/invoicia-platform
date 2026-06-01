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
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const attachments_service_1 = require("./attachments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let AttachmentsController = class AttachmentsController {
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    async upload(file, entityType, entityId, user) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        if (!entityId)
            throw new common_1.BadRequestException('entityId is required');
        if (!file.buffer)
            throw new common_1.BadRequestException('File buffer is missing');
        const attachment = await this.attachmentsService.upload(file, entityType, entityId, user.tenantId, user.email || user.userId);
        return {
            success: true,
            data: {
                id: attachment._id?.toString(),
                entityType: attachment.entityType,
                entityId: attachment.entityId,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                fileType: attachment.fileType,
                uploadedAt: attachment.createdAt || new Date(),
                uploadedBy: attachment.uploadedBy,
            },
        };
    }
    async download(id, res) {
        const { stream, attachment } = await this.attachmentsService.getFileStream(id, null);
        res.setHeader('Content-Type', attachment.fileType);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
        stream.pipe(res);
    }
    async findAll(entityType, entityId, user) {
        const attachments = await this.attachmentsService.findAll(entityType, entityId, user.tenantId);
        const attachmentsWithUrls = attachments.map((att) => ({
            id: att._id?.toString(),
            entityType: att.entityType,
            entityId: att.entityId,
            fileName: att.fileName,
            fileSize: att.fileSize,
            fileType: att.fileType,
            fileUrl: `/api/attachments/download/${att._id?.toString()}`,
            uploadedAt: att.createdAt || new Date(),
            uploadedBy: att.uploadedBy,
        }));
        return { success: true, data: attachmentsWithUrls };
    }
    async delete(id, user) {
        await this.attachmentsService.delete(id, user.tenantId);
        return { success: true, message: 'Attachment deleted successfully' };
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('entityType', new common_1.ParseEnumPipe(['invoice', 'purchase_invoice', 'credit_note', 'tenant_logo']))),
    __param(2, (0, common_1.Query)('entityId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "download", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':entityType/:entityId'),
    __param(0, (0, common_1.Param)('entityType', new common_1.ParseEnumPipe(['invoice', 'purchase_invoice', 'credit_note']))),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "delete", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, common_1.Controller)('attachments'),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map