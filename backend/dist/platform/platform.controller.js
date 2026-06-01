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
exports.PlatformController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const platform_service_1 = require("./platform.service");
const subscription_plans_service_1 = require("./subscription-plans.service");
const platform_settings_service_1 = require("./platform-settings.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_modules_dto_1 = require("./dto/update-tenant-modules.dto");
const create_subscription_plan_dto_1 = require("./dto/create-subscription-plan.dto");
const update_subscription_plan_dto_1 = require("./dto/update-subscription-plan.dto");
const update_platform_settings_dto_1 = require("./dto/update-platform-settings.dto");
const platform_invoices_service_1 = require("./platform-invoices/platform-invoices.service");
let PlatformController = class PlatformController {
    constructor(platformService, subscriptionPlansService, platformSettingsService, platformInvoicesService) {
        this.platformService = platformService;
        this.subscriptionPlansService = subscriptionPlansService;
        this.platformSettingsService = platformSettingsService;
        this.platformInvoicesService = platformInvoicesService;
    }
    async findAll(user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformService.findAllTenants();
    }
    async findOne(id, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformService.findOneTenant(id);
    }
    async create(createTenantDto, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformService.createTenant(createTenantDto);
    }
    async updateModules(id, updateModulesDto, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformService.updateTenantModules(id, updateModulesDto.modules);
    }
    async updateStatus(id, body, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformService.updateTenantStatus(id, body.subscriptionStatus);
    }
    async updateTenant(id, body, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformService.updateTenant(id, body);
    }
    async getPlans(user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.subscriptionPlansService.findAll();
    }
    async getPlan(id, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.subscriptionPlansService.findOne(id);
    }
    async createPlan(createPlanDto, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.subscriptionPlansService.create(createPlanDto);
    }
    async updatePlan(id, updatePlanDto, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.subscriptionPlansService.update(id, updatePlanDto);
    }
    async deletePlan(id, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.subscriptionPlansService.remove(id);
    }
    async getSettings(user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformSettingsService.getSettings();
    }
    async updateSettings(updateDto, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        return this.platformSettingsService.updateSettings(updateDto);
    }
    async approveTransfer(id, user) {
        if (user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs de la plateforme');
        }
        const tenant = await this.platformService.updateTenantStatus(id, 'ACTIVE');
        const invoice = await this.platformInvoicesService.generateFinalInvoiceForTransfer(id);
        return {
            success: true,
            tenant,
            invoice: {
                id: invoice._id.toString(),
                invoiceNumber: invoice.invoiceNumber,
                pdfUrl: invoice.pdfUrl,
                status: invoice.status,
                emailSent: invoice.emailSent,
            },
            message: 'Virement approuvé et facture générée',
        };
    }
};
exports.PlatformController = PlatformController;
__decorate([
    (0, common_1.Get)('tenants'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tenants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('tenants'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('tenants/:id/modules'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_modules_dto_1.UpdateTenantModulesDto, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updateModules", null);
__decorate([
    (0, common_1.Patch)('tenants/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('tenants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_plan_dto_1.CreateSubscriptionPlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_plan_dto_1.UpdateSubscriptionPlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_platform_settings_dto_1.UpdatePlatformSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('tenants/:id/approve-transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "approveTransfer", null);
exports.PlatformController = PlatformController = __decorate([
    (0, common_1.Controller)('platform'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [platform_service_1.PlatformService,
        subscription_plans_service_1.SubscriptionPlansService,
        platform_settings_service_1.PlatformSettingsService,
        platform_invoices_service_1.PlatformInvoicesService])
], PlatformController);
//# sourceMappingURL=platform.controller.js.map