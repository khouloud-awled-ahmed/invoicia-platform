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
exports.PlatformInvoicesController = void 0;
const common_1 = require("@nestjs/common");
const platform_invoices_service_1 = require("./platform-invoices.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const fs = require("fs");
let PlatformInvoicesController = class PlatformInvoicesController {
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async getMyInvoices(user) {
        if (!user.tenantId) {
            throw new Error('Tenant ID requis');
        }
        return this.invoicesService.findByTenant(user.tenantId);
    }
    async getInvoice(id, user) {
        const tenantId = user.role === 'PLATFORM_ADMIN' ? undefined : user.tenantId;
        return this.invoicesService.findOne(id, tenantId);
    }
    async downloadInvoice(id, res, user) {
        const tenantId = user.role === 'PLATFORM_ADMIN' ? undefined : user.tenantId;
        const invoice = await this.invoicesService.findOne(id, tenantId);
        if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
            throw new Error('PDF not found');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
        const fileStream = fs.createReadStream(invoice.pdfPath);
        fileStream.pipe(res);
    }
    async getAllInvoices(tenantId, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        if (tenantId) {
            return this.invoicesService.findByTenant(tenantId);
        }
        return [];
    }
};
exports.PlatformInvoicesController = PlatformInvoicesController;
__decorate([
    (0, common_1.Get)('my-invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformInvoicesController.prototype, "getMyInvoices", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformInvoicesController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlatformInvoicesController.prototype, "downloadInvoice", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformInvoicesController.prototype, "getAllInvoices", null);
exports.PlatformInvoicesController = PlatformInvoicesController = __decorate([
    (0, common_1.Controller)('platform/invoices'),
    __metadata("design:paramtypes", [platform_invoices_service_1.PlatformInvoicesService])
], PlatformInvoicesController);
//# sourceMappingURL=platform-invoices.controller.js.map