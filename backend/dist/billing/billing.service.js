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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
let BillingService = class BillingService {
    constructor(tenantModel) {
        this.tenantModel = tenantModel;
    }
    async getBillingStatus(tenantId) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        const billingEnabled = tenant.billingSettings?.enabled || tenant.features?.includes('billing') || false;
        const structuredFormatsEnabled = tenant.billingSettings?.structuredFormatsEnabled || tenant.features?.includes('structured-formats') || false;
        const platformAgreementEnabled = tenant.billingSettings?.platformAgreementEnabled || tenant.features?.includes('platform-agreement') || false;
        return {
            enabled: billingEnabled,
            structuredFormats: {
                enabled: structuredFormatsEnabled,
                formats: structuredFormatsEnabled ? ['UBL', 'CII', 'Factur-X'] : [],
            },
            platformAgreement: {
                enabled: platformAgreementEnabled,
                configured: !!(tenant.metadata?.platformAgreementConfig),
                platform: tenant.metadata?.platformAgreementConfig?.platform || null,
            },
        };
    }
    async getSummary(tenantId, filters) {
        const status = await this.getBillingStatus(tenantId);
        if (!status.enabled) {
            throw new common_1.ForbiddenException('Billing module is not enabled for this tenant');
        }
        return {
            invoices: { total: 0, pending: 0, paid: 0 },
            creditNotes: { total: 0 },
            suppliers: { total: 0 },
            clients: { total: 0 },
        };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BillingService);
//# sourceMappingURL=billing.service.js.map