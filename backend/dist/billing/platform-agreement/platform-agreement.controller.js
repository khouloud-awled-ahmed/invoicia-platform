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
exports.PlatformAgreementController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const platform_agreement_service_1 = require("./platform-agreement.service");
let PlatformAgreementController = class PlatformAgreementController {
    constructor(platformAgreementService) {
        this.platformAgreementService = platformAgreementService;
    }
    async getStatus(user) {
        return this.platformAgreementService.getStatus(user.tenantId);
    }
    async transmitInvoice(invoiceId, options, user) {
        const isEnabled = await this.platformAgreementService.isEnabled(user.tenantId);
        if (!isEnabled) {
            throw new common_1.ForbiddenException('Platform Agreement is not enabled for this tenant');
        }
        return this.platformAgreementService.transmitInvoice(invoiceId, user.tenantId, options.format || 'Factur-X', options.platform);
    }
    async getInvoiceTransmissionStatus(invoiceId, user) {
        return this.platformAgreementService.getTransmissionStatus(invoiceId, user.tenantId);
    }
    async getAvailablePlatforms(user) {
        return this.platformAgreementService.getAvailablePlatforms();
    }
};
exports.PlatformAgreementController = PlatformAgreementController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAgreementController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('invoice/:id/transmit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlatformAgreementController.prototype, "transmitInvoice", null);
__decorate([
    (0, common_1.Get)('invoice/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformAgreementController.prototype, "getInvoiceTransmissionStatus", null);
__decorate([
    (0, common_1.Get)('platforms'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAgreementController.prototype, "getAvailablePlatforms", null);
exports.PlatformAgreementController = PlatformAgreementController = __decorate([
    (0, common_1.Controller)('billing/platform-agreement'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [platform_agreement_service_1.PlatformAgreementService])
], PlatformAgreementController);
//# sourceMappingURL=platform-agreement.controller.js.map