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
exports.PayrollSettingsController = void 0;
const common_1 = require("@nestjs/common");
const payroll_settings_service_1 = require("./payroll-settings.service");
const dsn_generator_service_1 = require("./dsn-generator.service");
const update_payroll_settings_dto_1 = require("./dto/update-payroll-settings.dto");
const create_social_org_dto_1 = require("./dto/create-social-org.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PayrollSettingsController = class PayrollSettingsController {
    constructor(payrollSettingsService, dsnGeneratorService) {
        this.payrollSettingsService = payrollSettingsService;
        this.dsnGeneratorService = dsnGeneratorService;
    }
    async getSettings(user) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.payrollSettingsService.getSettings(user.tenantId);
    }
    async updateSettings(user, updateDto) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.payrollSettingsService.updateSettings(user.tenantId, updateDto);
    }
    async createSocialOrg(user, createDto) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.payrollSettingsService.createSocialOrg(user.tenantId, createDto);
    }
    async findAllSocialOrgs(user) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.payrollSettingsService.findAllSocialOrgs(user.tenantId);
    }
    async deleteSocialOrg(user, id) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.payrollSettingsService.deleteSocialOrg(id, user.tenantId);
    }
    async downloadDSNTest(user, res, month, year) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        const now = new Date();
        const targetMonth = month || String(now.getMonth() + 1).padStart(2, '0');
        const targetYear = year || String(now.getFullYear());
        try {
            const dsnContent = await this.dsnGeneratorService.generateMonthlyDSN(user.tenantId, targetMonth, targetYear);
            const filename = `DSN_${targetYear}${targetMonth}_${user.tenantId.substring(0, 8)}.dsn`;
            res.setHeader('Content-Type', 'text/plain; charset=iso-8859-1');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', Buffer.byteLength(dsnContent, 'utf8'));
            res.send(dsnContent);
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message || 'Erreur lors de la génération du fichier DSN');
        }
    }
};
exports.PayrollSettingsController = PayrollSettingsController;
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_payroll_settings_dto_1.UpdatePayrollSettingsDto]),
    __metadata("design:returntype", Promise)
], PayrollSettingsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('social-orgs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_social_org_dto_1.CreateSocialOrgDto]),
    __metadata("design:returntype", Promise)
], PayrollSettingsController.prototype, "createSocialOrg", null);
__decorate([
    (0, common_1.Get)('social-orgs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollSettingsController.prototype, "findAllSocialOrgs", null);
__decorate([
    (0, common_1.Delete)('social-orgs/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollSettingsController.prototype, "deleteSocialOrg", null);
__decorate([
    (0, common_1.Get)('download-dsn-test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollSettingsController.prototype, "downloadDSNTest", null);
exports.PayrollSettingsController = PayrollSettingsController = __decorate([
    (0, common_1.Controller)('payroll-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payroll_settings_service_1.PayrollSettingsService,
        dsn_generator_service_1.DSNGeneratorService])
], PayrollSettingsController);
//# sourceMappingURL=payroll-settings.controller.js.map