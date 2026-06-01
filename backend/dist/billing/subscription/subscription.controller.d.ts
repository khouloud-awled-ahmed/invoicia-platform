import { SubscriptionService } from './subscription.service';
import { SubscribeDto } from './dto/subscribe.dto';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    subscribe(subscribeDto: SubscribeDto, user: any): Promise<{
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
