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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary(user, months) {
        if (!user.tenantId)
            return { employees: 0, totalRevenue: 0, pendingInvoices: 0, treasuryBalance: 0, expenses: 0 };
        return this.dashboardService.getSummary(user.tenantId, months ? parseInt(months) : 0);
    }
    async getRevenueByMonth(user, months) {
        if (!user.tenantId)
            return [];
        return this.dashboardService.getRevenueByMonth(user.tenantId, months ? parseInt(months) : 12);
    }
    async getTopClients(user, months) {
        if (!user.tenantId)
            return [];
        return this.dashboardService.getTopClients(user.tenantId, months ? parseInt(months) : 0);
    }
    async getInvoiceStats(user, months) {
        if (!user.tenantId)
            return {};
        return this.dashboardService.getInvoiceStats(user.tenantId, months ? parseInt(months) : 0);
    }
    async getExpensesByCategory(user, months) {
        if (!user.tenantId)
            return [];
        return this.dashboardService.getExpensesByCategory(user.tenantId, months ? parseInt(months) : 0);
    }
    async getCashFlow(user, months) {
        if (!user.tenantId)
            return [];
        return this.dashboardService.getCashFlow(user.tenantId, months ? parseInt(months) : 6);
    }
    async getAIInsights(user, months) {
        if (!user.tenantId)
            return [];
        return this.dashboardService.getAIInsights(user.tenantId, months ? parseInt(months) : 0);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('revenue-by-month'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenueByMonth", null);
__decorate([
    (0, common_1.Get)('top-clients'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopClients", null);
__decorate([
    (0, common_1.Get)('invoice-stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getInvoiceStats", null);
__decorate([
    (0, common_1.Get)('expenses-by-category'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getExpensesByCategory", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCashFlow", null);
__decorate([
    (0, common_1.Get)('ai-insights'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAIInsights", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map