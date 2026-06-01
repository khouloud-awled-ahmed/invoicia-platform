import { Document } from 'mongoose';
export type BankTransactionDocument = BankTransaction & Document;
export declare enum BankTransactionStatus {
    UNRECONCILED = "UNRECONCILED",
    RECONCILED = "RECONCILED"
}
export declare class BankTransaction {
    tenantId: string;
    bankAccountId: string;
    date: Date;
    label: string;
    amount: number;
    currency: string;
    type: 'debit' | 'credit';
    status: BankTransactionStatus;
    reconciledAt?: Date;
    targetType?: 'INVOICE' | 'EXPENSE' | 'PAYROLL' | 'TAX';
    targetId?: string;
    rawLine?: string;
    category?: string;
}
export declare const BankTransactionSchema: import("mongoose").Schema<BankTransaction, import("mongoose").Model<BankTransaction, any, any, any, Document<unknown, any, BankTransaction, any, {}> & BankTransaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BankTransaction, Document<unknown, {}, import("mongoose").FlatRecord<BankTransaction>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BankTransaction> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
