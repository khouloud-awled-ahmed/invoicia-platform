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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const subscription_plan_schema_1 = require("../../platform/schemas/subscription-plan.schema");
const promo_code_schema_1 = require("../schemas/promo-code.schema");
const platform_settings_schema_1 = require("../../platform/schemas/platform-settings.schema");
const platform_invoices_service_1 = require("../../platform/platform-invoices/platform-invoices.service");
const platform_invoice_schema_1 = require("../../platform/schemas/platform-invoice.schema");
let SubscriptionService = class SubscriptionService {
    constructor(tenantModel, planModel, promoCodeModel, settingsModel, platformInvoicesService) {
        this.tenantModel = tenantModel;
        this.planModel = planModel;
        this.promoCodeModel = promoCodeModel;
        this.settingsModel = settingsModel;
        this.platformInvoicesService = platformInvoicesService;
    }
    async subscribe(tenantId, subscribeDto) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant non trouvé');
        }
        const plan = await this.planModel.findById(subscribeDto.planId).exec();
        if (!plan) {
            throw new common_1.NotFoundException('Plan non trouvé');
        }
        if (!plan.isActive) {
            throw new common_1.BadRequestException('Ce plan n\'est plus actif');
        }
        let finalPrice = plan.price;
        let promoCode = null;
        if (subscribeDto.promoCode) {
            promoCode = await this.promoCodeModel.findOne({
                code: subscribeDto.promoCode.toUpperCase(),
                isActive: true,
            }).exec();
            if (promoCode) {
                if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
                    throw new common_1.BadRequestException('Code promo expiré');
                }
                if (promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage) {
                    throw new common_1.BadRequestException('Code promo épuisé');
                }
                if (promoCode.applicablePlans && promoCode.applicablePlans.length > 0) {
                    if (!promoCode.applicablePlans.includes(plan._id.toString())) {
                        throw new common_1.BadRequestException('Code promo non applicable à ce plan');
                    }
                }
                if (promoCode.discountType === 'PERCENT') {
                    finalPrice = plan.price * (1 - promoCode.value / 100);
                }
                else if (promoCode.discountType === 'AMOUNT') {
                    finalPrice = Math.max(0, plan.price - promoCode.value);
                }
                promoCode.usageCount++;
                await promoCode.save();
            }
            else {
                throw new common_1.BadRequestException('Code promo invalide');
            }
        }
        if (subscribeDto.billingDetails) {
            if (subscribeDto.billingDetails.address) {
                tenant.settings = tenant.settings || {};
                tenant.settings.companyAddress = subscribeDto.billingDetails.address;
            }
            if (subscribeDto.billingDetails.vatNumber) {
                tenant.settings = tenant.settings || {};
                tenant.settings.vatNumber = subscribeDto.billingDetails.vatNumber;
            }
            if (subscribeDto.billingDetails.matriculeFiscal) {
                tenant.matriculeFiscal = subscribeDto.billingDetails.matriculeFiscal;
            }
        }
        if (subscribeDto.paymentMethod === 'CARD') {
            console.log(`[STRIPE MOCK] Paiement de ${finalPrice}€ pour le plan ${plan.name}`);
            tenant.subscriptionStatus = 'ACTIVE';
            tenant.status = 'active';
            tenant.planId = plan._id.toString();
            tenant.modules = plan.features;
            tenant.maxUsers = plan.maxUsers;
            const subscriptionEndsAt = new Date();
            subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
            tenant.subscriptionEndsAt = subscriptionEndsAt;
            try {
                await this.platformInvoicesService.createInvoice(tenant._id.toString(), plan._id.toString(), finalPrice, platform_invoice_schema_1.PlatformInvoicePaymentMethod.CARD, subscribeDto.promoCode, promoCode ? (plan.price - finalPrice) : 0, plan.price);
                console.log(`[INVOICE] Facture générée pour le tenant ${tenant._id}`);
            }
            catch (error) {
                console.error(`[INVOICE] Erreur lors de la génération de la facture:`, error);
            }
        }
        else if (subscribeDto.paymentMethod === 'TRANSFER') {
            const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
            const trialDays = settings?.defaultTrialDaysForTransfer || 7;
            tenant.subscriptionStatus = 'TRIAL';
            tenant.status = 'trial';
            tenant.planId = plan._id.toString();
            tenant.modules = plan.features;
            tenant.maxUsers = plan.maxUsers;
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
            tenant.trialEndsAt = trialEndsAt;
            try {
                await this.platformInvoicesService.createInvoice(tenant._id.toString(), plan._id.toString(), finalPrice, platform_invoice_schema_1.PlatformInvoicePaymentMethod.TRANSFER, subscribeDto.promoCode, promoCode ? (plan.price - finalPrice) : 0, plan.price);
                console.log(`[INVOICE] Facture pro-forma créée pour le tenant ${tenant._id} (en attente de virement)`);
            }
            catch (error) {
                console.error(`[INVOICE] Erreur lors de la création de la facture pro-forma:`, error);
            }
        }
        await tenant.save();
        return {
            success: true,
            subscriptionStatus: tenant.subscriptionStatus,
            trialEndsAt: tenant.trialEndsAt,
            subscriptionEndsAt: tenant.subscriptionEndsAt,
            finalPrice,
            promoCodeApplied: promoCode ? promoCode.code : null,
        };
    }
    async validatePromoCode(code, planId) {
        const promoCode = await this.promoCodeModel.findOne({
            code: code.toUpperCase(),
            isActive: true,
        }).exec();
        if (!promoCode) {
            return { valid: false, message: 'Code promo invalide' };
        }
        if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
            return { valid: false, message: 'Code promo expiré' };
        }
        if (promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage) {
            return { valid: false, message: 'Code promo épuisé' };
        }
        if (promoCode.applicablePlans && promoCode.applicablePlans.length > 0) {
            if (!promoCode.applicablePlans.includes(planId)) {
                return { valid: false, message: 'Code promo non applicable à ce plan' };
            }
        }
        const plan = await this.planModel.findById(planId).exec();
        if (!plan) {
            return { valid: false, message: 'Plan non trouvé' };
        }
        let discount = 0;
        if (promoCode.discountType === 'PERCENT') {
            discount = plan.price * (promoCode.value / 100);
        }
        else {
            discount = promoCode.value;
        }
        return {
            valid: true,
            discount,
            discountType: promoCode.discountType,
            value: promoCode.value,
            finalPrice: promoCode.discountType === 'PERCENT'
                ? plan.price * (1 - promoCode.value / 100)
                : Math.max(0, plan.price - promoCode.value),
        };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(subscription_plan_schema_1.SubscriptionPlan.name)),
    __param(2, (0, mongoose_1.InjectModel)(promo_code_schema_1.PromoCode.name)),
    __param(3, (0, mongoose_1.InjectModel)(platform_settings_schema_1.PlatformSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        platform_invoices_service_1.PlatformInvoicesService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map