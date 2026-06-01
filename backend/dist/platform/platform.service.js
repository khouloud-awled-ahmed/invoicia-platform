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
exports.PlatformService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const bcrypt = require("bcrypt");
let PlatformService = class PlatformService {
    constructor(tenantModel, userModel) {
        this.tenantModel = tenantModel;
        this.userModel = userModel;
    }
    async findAllTenants() {
        const tenants = await this.tenantModel.find().lean().exec();
        return tenants.map((tenant) => ({
            id: tenant._id?.toString(),
            name: tenant.name,
            businessName: tenant.businessName,
            email: tenant.email,
            adminEmail: tenant.adminEmail,
            modules: tenant.modules || [],
            subscriptionStatus: tenant.subscriptionStatus || 'PENDING_PAYMENT',
            planType: tenant.planType || 'CUSTOM',
            status: tenant.status,
            currentUsers: tenant.currentUsers,
            maxUsers: tenant.maxUsers,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
        }));
    }
    async findOneTenant(id) {
        const tenant = await this.tenantModel.findById(id).lean().exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return {
            id: tenant._id?.toString(),
            ...tenant,
        };
    }
    async createTenant(createTenantDto) {
        const existingUser = await this.userModel.findOne({ email: createTenantDto.adminEmail.toLowerCase() }).exec();
        if (existingUser) {
            throw new common_1.BadRequestException(`Un utilisateur avec l'email ${createTenantDto.adminEmail} existe déjà`);
        }
        const existingTenant = await this.tenantModel.findOne({ matriculeFiscal: createTenantDto.matriculeFiscal }).exec();
        if (existingTenant) {
            throw new common_1.BadRequestException(`Un tenant avec le Matricule Fiscal ${createTenantDto.matriculeFiscal} existe déjà`);
        }
        const tenant = new this.tenantModel({
            name: createTenantDto.name,
            businessName: createTenantDto.businessName || createTenantDto.name,
            matriculeFiscal: createTenantDto.matriculeFiscal,
            email: createTenantDto.adminEmail.toLowerCase(),
            adminEmail: createTenantDto.adminEmail.toLowerCase(),
            modules: createTenantDto.modules || [],
            subscriptionStatus: createTenantDto.subscriptionStatus || 'PENDING_PAYMENT',
            planType: createTenantDto.planType || 'CUSTOM',
            planId: createTenantDto.planId,
            status: 'pending',
            currentUsers: 0,
            maxUsers: createTenantDto.maxUsers || 10,
            subscriptionPlan: 'essential',
            pack: 'essential',
            settings: {
                paymentMethods: [],
            },
        });
        const savedTenant = await tenant.save();
        const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword || 'TempPassword123!', 10);
        const adminUser = new this.userModel({
            name: createTenantDto.adminName || 'Administrateur',
            email: createTenantDto.adminEmail.toLowerCase(),
            password: hashedPassword,
            role: 'TENANT_ADMIN',
            tenantId: savedTenant._id.toString(),
            isActive: true,
        });
        await adminUser.save();
        await this.tenantModel.updateOne({ _id: savedTenant._id }, { $inc: { currentUsers: 1 } }).exec();
        return {
            id: savedTenant._id.toString(),
            name: savedTenant.name,
            businessName: savedTenant.businessName,
            email: savedTenant.email,
            adminEmail: savedTenant.adminEmail,
            modules: savedTenant.modules,
            subscriptionStatus: savedTenant.subscriptionStatus,
            planType: savedTenant.planType,
            adminUser: {
                id: adminUser._id.toString(),
                email: adminUser.email,
                name: adminUser.name,
            },
        };
    }
    async updateTenantModules(id, modules) {
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        tenant.modules = modules;
        await tenant.save();
        return {
            id: tenant._id.toString(),
            modules: tenant.modules,
        };
    }
    async updateTenantStatus(id, subscriptionStatus) {
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        tenant.subscriptionStatus = subscriptionStatus;
        if (subscriptionStatus === 'ACTIVE') {
            tenant.status = 'active';
        }
        else if (subscriptionStatus === 'SUSPENDED') {
            tenant.status = 'suspended';
        }
        await tenant.save();
        return {
            id: tenant._id.toString(),
            subscriptionStatus: tenant.subscriptionStatus,
            status: tenant.status,
        };
    }
    async updateTenant(id, updateData) {
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        if (updateData.name)
            tenant.name = updateData.name;
        if (updateData.email)
            tenant.email = updateData.email;
        if (updateData.adminEmail)
            tenant.adminEmail = updateData.adminEmail;
        if (updateData.planId !== undefined)
            tenant.planId = updateData.planId;
        if (updateData.subscriptionStatus) {
            tenant.subscriptionStatus = updateData.subscriptionStatus;
            if (updateData.subscriptionStatus === 'ACTIVE') {
                tenant.status = 'active';
            }
            else if (updateData.subscriptionStatus === 'SUSPENDED') {
                tenant.status = 'suspended';
            }
        }
        await tenant.save();
        return {
            id: tenant._id.toString(),
            name: tenant.name,
            email: tenant.email,
            adminEmail: tenant.adminEmail,
            planId: tenant.planId,
            subscriptionStatus: tenant.subscriptionStatus,
            status: tenant.status,
        };
    }
};
exports.PlatformService = PlatformService;
exports.PlatformService = PlatformService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PlatformService);
//# sourceMappingURL=platform.service.js.map