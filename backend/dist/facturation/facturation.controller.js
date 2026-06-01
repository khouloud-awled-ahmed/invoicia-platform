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
exports.FacturationController = void 0;
const common_1 = require("@nestjs/common");
const facturation_service_1 = require("./facturation.service");
const generate_invoices_dto_1 = require("./dto/generate-invoices.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let FacturationController = class FacturationController {
    constructor(facturationService) {
        this.facturationService = facturationService;
    }
    getPendingLines(user) {
        return this.facturationService.getPendingLines(user.tenantId);
    }
    getStats(user) {
        return this.facturationService.getStats(user.tenantId);
    }
    generateInvoices(dto, user) {
        return this.facturationService.generateInvoices(dto.craLineIds, user.tenantId);
    }
};
exports.FacturationController = FacturationController;
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "getPendingLines", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_invoices_dto_1.GenerateInvoicesDto, Object]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "generateInvoices", null);
exports.FacturationController = FacturationController = __decorate([
    (0, common_1.Controller)('facturation'),
    __metadata("design:paramtypes", [facturation_service_1.FacturationService])
], FacturationController);
//# sourceMappingURL=facturation.controller.js.map