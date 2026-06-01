export declare class CreateSubscriptionPlanDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    features: string[];
    maxUsers?: number;
    isActive?: boolean;
}
