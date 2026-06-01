import { Model } from 'mongoose';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { SubscriptionPlanDocument } from '../../platform/schemas/subscription-plan.schema';
import { PromoCodeDocument } from '../schemas/promo-code.schema';
import { PlatformSettingsDocument } from '../../platform/schemas/platform-settings.schema';
import { SubscribeDto } from './dto/subscribe.dto';
import { PlatformInvoicesService } from '../../platform/platform-invoices/platform-invoices.service';
export declare class SubscriptionService {
    private tenantModel;
    private planModel;
    private promoCodeModel;
    private settingsModel;
    private platformInvoicesService;
    constructor(tenantModel: Model<TenantDocument>, planModel: Model<SubscriptionPlanDocument>, promoCodeModel: Model<PromoCodeDocument>, settingsModel: Model<PlatformSettingsDocument>, platformInvoicesService: PlatformInvoicesService);
    subscribe(tenantId: string, subscribeDto: SubscribeDto): Promise<{
        success: boolean;
        subscriptionStatus: string;
        trialEndsAt: Date;
        subscriptionEndsAt: Date;
        finalPrice: number;
        promoCodeApplied: any;
    }>;
    validatePromoCode(code: string, planId: string): Promise<{
        valid: boolean;
        message: string;
        discount?: undefined;
        discountType?: undefined;
        value?: undefined;
        finalPrice?: undefined;
    } | {
        valid: boolean;
        discount: number;
        discountType: string;
        value: number;
        finalPrice: number;
        message?: undefined;
    }>;
}
