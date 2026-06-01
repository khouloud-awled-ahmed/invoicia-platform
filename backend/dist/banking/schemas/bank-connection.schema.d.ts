import { Document } from 'mongoose';
export type BankConnectionDocument = BankConnection & Document;
export declare enum BankingProvider {
    GOCARDLESS = "GOCARDLESS",
    BRIDGE = "BRIDGE"
}
export declare class BankConnection {
    tenantId: string;
    provider: BankingProvider;
    institutionId: string;
    institutionName?: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    isActive: boolean;
    lastSyncAt?: Date;
    metadata?: Record<string, any>;
}
export declare const BankConnectionSchema: import("mongoose").Schema<BankConnection, import("mongoose").Model<BankConnection, any, any, any, Document<unknown, any, BankConnection, any, {}> & BankConnection & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BankConnection, Document<unknown, {}, import("mongoose").FlatRecord<BankConnection>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BankConnection> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
