import { Document } from 'mongoose';
export type SubscriptionPlanDocument = SubscriptionPlan & Document;
export declare class SubscriptionPlan {
    name: string;
    description?: string;
    price: number;
    currency: string;
    features: string[];
    maxUsers: number;
    isActive: boolean;
    metadata?: {
        billingPeriod?: 'monthly' | 'yearly';
        trialDays?: number;
        [key: string]: any;
    };
}
export declare const SubscriptionPlanSchema: import("mongoose").Schema<SubscriptionPlan, import("mongoose").Model<SubscriptionPlan, any, any, any, Document<unknown, any, SubscriptionPlan, any, {}> & SubscriptionPlan & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SubscriptionPlan, Document<unknown, {}, import("mongoose").FlatRecord<SubscriptionPlan>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SubscriptionPlan> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
