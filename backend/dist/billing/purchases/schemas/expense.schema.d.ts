import { Document } from 'mongoose';
export type ExpenseDocument = Expense & Document;
export declare class Expense {
    date: Date;
    supplier: string;
    category: string;
    amountHT: number;
    amountTVA: number;
    amountTTC: number;
    currency: string;
    status: string;
    documentUrl?: string;
    documentType?: string;
    extractionConfidence?: number;
    tags?: string[];
    notes?: string;
    paymentMethod?: string;
    isDuplicate: boolean;
    approvedBy?: string;
    tenantId: string;
}
export declare const ExpenseSchema: import("mongoose").Schema<Expense, import("mongoose").Model<Expense, any, any, any, Document<unknown, any, Expense, any, {}> & Expense & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Expense, Document<unknown, {}, import("mongoose").FlatRecord<Expense>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Expense> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
