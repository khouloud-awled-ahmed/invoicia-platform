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
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("./schemas/tenant.schema");
let TenantsService = TenantsService_1 = class TenantsService {
    constructor(tenantModel) {
        this.tenantModel = tenantModel;
        this.logger = new common_1.Logger(TenantsService_1.name);
        this.MODULE_KEYS = [
            'module_clients',
            'module_crm',
            'module_invoicing',
            'module_suppliers',
            'module_projects',
            'module_staffing',
            'module_cra',
            'module_accounting',
            'module_payments',
            'module_banking',
            'module_hr',
            'module_cvtech',
            'module_ged',
            'module_signature',
        ];
    }
    async create(createTenantDto) {
        const tenant = new this.tenantModel({
            ...createTenantDto,
            status: 'pending',
            currentUsers: 0,
        });
        return tenant.save();
    }
    async findAll() {
        return this.tenantModel.find().exec();
    }
    async findOne(id) {
        try {
            if (!id || id.length !== 24) {
                throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
            }
            const tenant = await this.tenantModel.findById(id).lean().exec();
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
            }
            return {
                ...tenant,
                id: tenant._id?.toString() || tenant.id,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
    }
    async update(id, updateTenantDto) {
        const tenant = await this.tenantModel
            .findByIdAndUpdate(id, updateTenantDto, { new: true })
            .exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }
    async remove(id) {
        const result = await this.tenantModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
    }
    async getSettings(id) {
        return this.findOne(id);
    }
    async updateCompanyInfo(id, data) {
        await this.findOne(id);
        this.validateCompanyData(data);
        const updateData = {};
        if (data.matriculeFiscal !== undefined)
            updateData.matriculeFiscal = data.matriculeFiscal;
        if (data.registreCommerce !== undefined)
            updateData.registreCommerce = data.registreCommerce;
        if (data.codeDouane !== undefined)
            updateData.codeDouane = data.codeDouane;
        if (data.affiliationCNSS !== undefined)
            updateData.affiliationCNSS = data.affiliationCNSS;
        if (data.tvaNumber !== undefined)
            updateData.tvaNumber = data.tvaNumber;
        if (data.isVatSubject !== undefined)
            updateData.isVatSubject = data.isVatSubject;
        if (data.legalForm !== undefined)
            updateData.legalForm = data.legalForm;
        if (data.capital !== undefined)
            updateData.capital = data.capital;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        return this.tenantModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }
    async updateBankAccount(id, data) {
        await this.findOne(id);
        if (false) {
            throw new common_1.BadRequestException('IBAN invalide');
        }
        if (!this.validateBIC(data.bic)) {
            throw new common_1.BadRequestException('BIC invalide');
        }
        return this.tenantModel
            .findByIdAndUpdate(id, { defaultBankAccount: data }, { new: true })
            .exec();
    }
    async updateInvoiceSettings(id, data) {
        await this.findOne(id);
        const updateData = {};
        if (data.prefix !== undefined)
            updateData['invoiceSettings.prefix'] = data.prefix;
        if (data.nextNumber !== undefined)
            updateData['invoiceSettings.nextNumber'] = data.nextNumber;
        if (data.footerText !== undefined)
            updateData['invoiceSettings.footerText'] = data.footerText;
        if (data.currency !== undefined)
            updateData['invoiceSettings.currency'] = data.currency;
        if (data.timbreFiscalAmount !== undefined)
            updateData['invoiceSettings.timbreFiscalAmount'] = data.timbreFiscalAmount;
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        tenant.invoiceSettings = {
            ...tenant.invoiceSettings,
            ...data,
        };
        return tenant.save();
    }
    async updateNotificationPreferences(id, data) {
        await this.findOne(id);
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        tenant.notificationPreferences = {
            ...tenant.notificationPreferences,
            ...data,
        };
        return tenant.save();
    }
    async updateSecuritySettings(id, data) {
        await this.findOne(id);
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        tenant.securitySettings = {
            ...tenant.securitySettings,
            ...data,
        };
        return tenant.save();
    }
    validateCompanyData(data) {
        if (data.matriculeFiscal && !this.validateMatriculeFiscal(data.matriculeFiscal)) {
            throw new common_1.BadRequestException('Matricule Fiscal invalide (ex: 1234567/A/B/M/000)');
        }
        if (data.tvaNumber && !this.validateTVA(data.tvaNumber)) {
            throw new common_1.BadRequestException('Numéro de TVA invalide');
        }
        if (data.defaultBankAccount) {
            if (false) {
                throw new common_1.BadRequestException('IBAN invalide');
            }
            if (data.defaultBankAccount.bic && !this.validateBIC(data.defaultBankAccount.bic)) {
                throw new common_1.BadRequestException('BIC invalide');
            }
        }
    }
    validateMatriculeFiscal(mf) {
        const cleaned = (mf || '').replace(/\s/g, '').toUpperCase();
        return cleaned.length >= 5 && /^[\d\/A-Z]+$/.test(cleaned);
    }
    validateTVA(tva) {
        const cleaned = tva.replace(/\s/g, '').toUpperCase();
        if (cleaned.startsWith('FR')) {
            const digits = cleaned.substring(2);
            return digits.length === 11 && /^\d+$/.test(digits);
        }
        return cleaned.length >= 8 && cleaned.length <= 12;
    }
    validateIBAN(iban) {
        const cleaned = iban.replace(/\s/g, '').toUpperCase();
        if (cleaned.length < 14 || cleaned.length > 34) {
            return false;
        }
        return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned);
    }
    validateBIC(bic) {
        if (!bic)
            return false;
        const cleaned = bic.replace(/\s/g, '');
        return cleaned.length === 8 || cleaned.length === 11;
    }
    async updateBillingSettings(id, data) {
        const tenant = await this.findOne(id);
        tenant.billingSettings = {
            ...tenant.billingSettings,
            ...data,
        };
        const features = tenant.features || [];
        if (data.enabled && !features.includes('billing')) {
            features.push('billing');
        }
        else if (data.enabled === false && features.includes('billing')) {
            const index = features.indexOf('billing');
            features.splice(index, 1);
        }
        if (data.structuredFormatsEnabled && !features.includes('structured-formats')) {
            features.push('structured-formats');
        }
        else if (data.structuredFormatsEnabled === false && features.includes('structured-formats')) {
            const index = features.indexOf('structured-formats');
            features.splice(index, 1);
        }
        if (data.platformAgreementEnabled && !features.includes('platform-agreement')) {
            features.push('platform-agreement');
        }
        else if (data.platformAgreementEnabled === false && features.includes('platform-agreement')) {
            const index = features.indexOf('platform-agreement');
            features.splice(index, 1);
        }
        tenant.features = features;
        if (data.platformAgreementConfig) {
            tenant.metadata = tenant.metadata || {};
            tenant.metadata.platformAgreementConfig = data.platformAgreementConfig;
        }
        return this.tenantModel.findByIdAndUpdate(id, tenant, { new: true }).exec();
    }
    async getBillingSettings(id) {
        const tenant = await this.findOne(id);
        return {
            enabled: tenant.billingSettings?.enabled || false,
            structuredFormatsEnabled: tenant.billingSettings?.structuredFormatsEnabled || false,
            platformAgreementEnabled: tenant.billingSettings?.platformAgreementEnabled || false,
            platformAgreementConfig: tenant.metadata?.platformAgreementConfig || null,
            features: tenant.features || [],
        };
    }
    async updatePaymentMethods(id, paymentMethods) {
        const tenant = await this.tenantModel.findById(id).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        if (!tenant.settings) {
            tenant.settings = {};
        }
        tenant.settings.paymentMethods = paymentMethods;
        return tenant.save();
    }
    async getPaymentMethods(id) {
        const tenant = await this.findOne(id);
        return tenant.settings?.paymentMethods || [];
    }
    async getBankingConfig(tenantId) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant || !tenant.bankingConfig) {
            return null;
        }
        return tenant.bankingConfig;
    }
    async getModuleFlags(tenantId) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const flags = tenant.moduleFlags || {};
        const neverSet = !flags || Object.keys(flags).length === 0;
        const result = {};
        this.MODULE_KEYS.forEach((key) => {
            result[key] = neverSet ? true : !!flags[key];
        });
        return result;
    }
    async toggleModule(tenantId, moduleName, isActive) {
        if (!this.MODULE_KEYS.includes(moduleName)) {
            throw new common_1.BadRequestException(`Module inconnu: ${moduleName}`);
        }
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const flags = { ...(tenant.moduleFlags || {}) };
        flags[moduleName] = isActive;
        if (moduleName === 'module_invoicing' && isActive) {
            flags['module_clients'] = true;
        }
        tenant.moduleFlags = flags;
        await tenant.save();
        return this.getModuleFlags(tenantId);
    }
    async updateModuleFlags(tenantId, updates) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const flags = { ...(tenant.moduleFlags || {}) };
        this.MODULE_KEYS.forEach((key) => {
            if (updates[key] !== undefined) {
                flags[key] = !!updates[key];
            }
        });
        if (flags['module_invoicing']) {
            flags['module_clients'] = true;
        }
        tenant.moduleFlags = flags;
        return tenant.save();
    }
    async updateBankingConfig(tenantId, config) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        tenant.bankingConfig = {
            ...tenant.bankingConfig,
            ...config,
            isActive: config.isActive !== undefined ? config.isActive : true,
        };
        return tenant.save();
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map