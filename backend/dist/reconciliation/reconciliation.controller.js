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
exports.ReconciliationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const reconciliation_service_1 = require("./reconciliation.service");
const match_reconciliation_dto_1 = require("./dto/match-reconciliation.dto");
let ReconciliationController = class ReconciliationController {
    constructor(reconciliationService) {
        this.reconciliationService = reconciliationService;
    }
    async getOpenItems(user) {
        if (!user.tenantId) {
            return { invoices: [], expenses: [], payrolls: [] };
        }
        return this.reconciliationService.getOpenItems(user.tenantId);
    }
    async match(user, dto) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.reconciliationService.match(user.tenantId, dto.bankTransactionId, dto.targetId, dto.targetType);
    }
};
exports.ReconciliationController = ReconciliationController;
__decorate([
    (0, common_1.Get)('open-items'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "getOpenItems", null);
__decorate([
    (0, common_1.Post)('match'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, match_reconciliation_dto_1.MatchReconciliationDto]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "match", null);
exports.ReconciliationController = ReconciliationController = __decorate([
    (0, common_1.Controller)('reconciliation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reconciliation_service_1.ReconciliationService])
], ReconciliationController);
//# sourceMappingURL=reconciliation.controller.js.map