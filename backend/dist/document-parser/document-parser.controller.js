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
exports.DocumentParserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const universal_document_parser_service_1 = require("./services/universal-document-parser.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DocumentParserController = class DocumentParserController {
    constructor(parserService) {
        this.parserService = parserService;
    }
    async analyze(file, type, user) {
        if (!file)
            throw new common_1.BadRequestException('Aucun fichier fourni');
        if (!type || !['BANK', 'INVOICE', 'CV'].includes(type))
            throw new common_1.BadRequestException('Type invalide');
        return await this.parserService.analyze(file, type, user.tenantId);
    }
    async aiScan(file, user) {
        if (!file)
            throw new common_1.BadRequestException('Aucun fichier fourni');
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey)
            throw new common_1.BadRequestException('ANTHROPIC_API_KEY manquant');
        const base64 = file.buffer.toString('base64');
        const mimeType = file.mimetype || 'application/pdf';
        const isImage = mimeType.startsWith('image/');
        const content = [
            isImage
                ? { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } }
                : {
                    type: 'document',
                    source: { type: 'base64', media_type: 'application/pdf', data: base64 },
                },
            {
                type: 'text',
                text: 'Analyse cette facture et retourne UNIQUEMENT un JSON: {"invoiceNumber":"","date":"YYYY-MM-DD","dueDate":"YYYY-MM-DD","clientName":"","clientAddress":"","clientEmail":"","totalHT":0,"totalTVA":0,"totalTTC":0,"currency":"TND","items":[{"description":"","quantity":1,"unitPrice":0,"vatRate":19}]}. JSON uniquement sans markdown.',
            },
        ];
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 2000,
                messages: [{ role: 'user', content }],
            }),
        });
        if (!res.ok)
            throw new common_1.BadRequestException('Erreur API Claude');
        const data = await res.json();
        const text = data.content[0].text;
        try {
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        }
        catch {
            return { rawText: text };
        }
    }
    async learnFormat(templateName, user) {
        return { message: 'ok' };
    }
    async getTemplates(type, user) {
        return await this.parserService.getTemplates(user.tenantId, type);
    }
    async deleteTemplate(id, user) {
        return await this.parserService.deleteTemplate(id, user.tenantId);
    }
};
exports.DocumentParserController = DocumentParserController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentParserController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('ai-scan'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentParserController.prototype, "aiScan", null);
__decorate([
    (0, common_1.Post)('learn'),
    __param(0, (0, common_1.Query)('templateName')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentParserController.prototype, "learnFormat", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentParserController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentParserController.prototype, "deleteTemplate", null);
exports.DocumentParserController = DocumentParserController = __decorate([
    (0, common_1.Controller)('document-parser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [universal_document_parser_service_1.UniversalDocumentParserService])
], DocumentParserController);
//# sourceMappingURL=document-parser.controller.js.map