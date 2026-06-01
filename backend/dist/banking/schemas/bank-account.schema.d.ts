import { Document } from 'mongoose';
export type BankAccountDocument = BankAccount & Document;
export declare enum BankAccountProvider {
    MANUAL = "MANUAL",
    GOCARDLESS = "GOCARDLESS",
    BRIDGE = "BRIDGE"
}
export declare class BankAccount {
    name: string;
    iban?: string;
    bic?: string;
    bankName?: string;
    accountNumber?: string;
    provider: BankAccountProvider;
    externalId?: string;
    balance: number;
    currency: string;
    lastSyncAt?: Date;
    connectionId?: string;
    tenantId: string;
    isActive: boolean;
}
export declare const BankAccountSchema: import("mongoose").Schema<BankAccount, import("mongoose").Model<BankAccount, any, any, any, Document<unknown, any, BankAccount, any, {}> & BankAccount & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BankAccount, Document<unknown, {}, import("mongoose").FlatRecord<BankAccount>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BankAccount> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
