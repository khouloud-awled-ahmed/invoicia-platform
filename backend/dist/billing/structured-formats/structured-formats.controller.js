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
exports.StructuredFormatsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const structured_formats_service_1 = require("./structured-formats.service");
let StructuredFormatsController = class StructuredFormatsController {
    constructor(structuredFormatsService) {
        this.structuredFormatsService = structuredFormatsService;
    }
    async generateInvoice(invoiceId, format, user) {
        const isEnabled = await this.structuredFormatsService.isEnabled(user.tenantId);
        if (!isEnabled) {
            throw new common_1.ForbiddenException('Structured formats are not enabled for this tenant');
        }
        return this.structuredFormatsService.generateInvoice(invoiceId, format, user.tenantId);
    }
    async validateInvoice(invoiceId, user) {
        const isEnabled = await this.structuredFormatsService.isEnabled(user.tenantId);
        if (!isEnabled) {
            throw new common_1.ForbiddenException('Structured formats are not enabled for this tenant');
        }
        return this.structuredFormatsService.validateInvoice(invoiceId, user.tenantId);
    }
};
exports.StructuredFormatsController = StructuredFormatsController;
__decorate([
    (0, common_1.Get)('invoice/:id/:format'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('format')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StructuredFormatsController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Post)('invoice/:id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StructuredFormatsController.prototype, "validateInvoice", null);
exports.StructuredFormatsController = StructuredFormatsController = __decorate([
    (0, common_1.Controller)('billing/structured-formats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [structured_formats_service_1.StructuredFormatsService])
], StructuredFormatsController);
//# sourceMappingURL=structured-formats.controller.js.map