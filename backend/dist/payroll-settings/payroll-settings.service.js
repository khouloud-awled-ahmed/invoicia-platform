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
var PayrollSettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollSettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const social_org_schema_1 = require("./schemas/social-org.schema");
let PayrollSettingsService = PayrollSettingsService_1 = class PayrollSettingsService {
    constructor(tenantModel, socialOrgModel) {
        this.tenantModel = tenantModel;
        this.socialOrgModel = socialOrgModel;
        this.logger = new common_1.Logger(PayrollSettingsService_1.name);
    }
    async getSettings(tenantId) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        return tenant.payrollSettings || {};
    }
    async updateSettings(tenantId, updateDto) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        tenant.payrollSettings = {
            ...tenant.payrollSettings,
            ...updateDto,
        };
        await tenant.save();
        return tenant.payrollSettings;
    }
    async createSocialOrg(tenantId, createDto) {
        const socialOrg = new this.socialOrgModel({
            ...createDto,
            tenantId,
        });
        return socialOrg.save();
    }
    async findAllSocialOrgs(tenantId) {
        return this.socialOrgModel.find({ tenantId }).exec();
    }
    async findOneSocialOrg(id, tenantId) {
        const socialOrg = await this.socialOrgModel.findOne({ _id: id, tenantId }).exec();
        if (!socialOrg) {
            throw new common_1.NotFoundException(`SocialOrg with ID ${id} not found`);
        }
        return socialOrg;
    }
    async deleteSocialOrg(id, tenantId) {
        const result = await this.socialOrgModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`SocialOrg with ID ${id} not found`);
        }
    }
};
exports.PayrollSettingsService = PayrollSettingsService;
exports.PayrollSettingsService = PayrollSettingsService = PayrollSettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(social_org_schema_1.SocialOrg.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PayrollSettingsService);
//# sourceMappingURL=payroll-settings.service.js.map