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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_admin_guard_1 = require("../auth/guards/platform-admin.guard");
const tenant_admin_guard_1 = require("../auth/guards/tenant-admin.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    create(createTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }
    findAll() {
        return this.tenantsService.findAll();
    }
    findOne(id, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            const userTenantId = user.tenantId?.toString();
            if (!userTenantId || userTenantId !== id) {
                throw new common_1.UnauthorizedException('You can only access your own tenant');
            }
        }
        return this.tenantsService.findOne(id);
    }
    update(id, updateTenantDto, user) {
        if (user.role !== 'PLATFORM_ADMIN' && user.tenantId !== id) {
            throw new common_1.UnauthorizedException('You can only update your own tenant');
        }
        return this.tenantsService.update(id, updateTenantDto);
    }
    getModuleFlags(id, user) {
        if (user.role !== 'PLATFORM_ADMIN' && user.tenantId !== id) {
            throw new common_1.UnauthorizedException('You can only access your own tenant');
        }
        return this.tenantsService.getModuleFlags(id);
    }
    updateModuleFlags(id, body, user) {
        if (user.tenantId !== id && user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.UnauthorizedException('You can only update your own tenant modules');
        }
        return this.tenantsService.updateModuleFlags(id, body.moduleFlags || {});
    }
    remove(id) {
        return this.tenantsService.remove(id);
    }
    getSettings(id) {
        return this.tenantsService.getSettings(id);
    }
    updateCompanyInfo(id, data) {
        return this.tenantsService.updateCompanyInfo(id, data);
    }
    updateBankAccount(id, data) {
        return this.tenantsService.updateBankAccount(id, data);
    }
    updateInvoiceSettings(id, data) {
        return this.tenantsService.updateInvoiceSettings(id, data);
    }
    updateNotificationPreferences(id, data) {
        return this.tenantsService.updateNotificationPreferences(id, data);
    }
    updateSecuritySettings(id, data) {
        return this.tenantsService.updateSecuritySettings(id, data);
    }
    updateBillingSettings(id, data) {
        return this.tenantsService.updateBillingSettings(id, data);
    }
    getBillingSettings(id) {
        return this.tenantsService.getBillingSettings(id);
    }
    updatePaymentMethods(id, paymentMethods, user) {
        if (user.tenantId !== id && user.role !== 'PLATFORM_ADMIN') {
            throw new Error('You can only update your own tenant payment methods');
        }
        return this.tenantsService.updatePaymentMethods(id, paymentMethods);
    }
    getPaymentMethods(id, user) {
        if (user.tenantId !== id && user.role !== 'PLATFORM_ADMIN') {
            throw new Error('You can only access your own tenant payment methods');
        }
        return this.tenantsService.getPaymentMethods(id);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, platform_admin_guard_1.PlatformAdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, platform_admin_guard_1.PlatformAdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_dto_1.UpdateTenantDto, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/modules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getModuleFlags", null);
__decorate([
    (0, common_1.Patch)(':id/modules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_admin_guard_1.TenantAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateModuleFlags", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/settings'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)(':id/company-info'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateCompanyInfo", null);
__decorate([
    (0, common_1.Patch)(':id/bank-account'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateBankAccount", null);
__decorate([
    (0, common_1.Patch)(':id/invoice-settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateInvoiceSettings", null);
__decorate([
    (0, common_1.Patch)(':id/notification-preferences'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Patch)(':id/security-settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateSecuritySettings", null);
__decorate([
    (0, common_1.Patch)(':id/billing-settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateBillingSettings", null);
__decorate([
    (0, common_1.Get)(':id/billing-settings'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getBillingSettings", null);
__decorate([
    (0, common_1.Patch)(':id/payment-methods'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_admin_guard_1.TenantAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updatePaymentMethods", null);
__decorate([
    (0, common_1.Get)(':id/payment-methods'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_admin_guard_1.TenantAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getPaymentMethods", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map