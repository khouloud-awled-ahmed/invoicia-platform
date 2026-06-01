import { Document } from 'mongoose';
export type AccountingEntryDocument = AccountingEntry & Document;
export declare class AccountingEntry {
    date: Date;
    account: string;
    label: string;
    debit: number;
    credit: number;
    journal: string;
    reference?: string;
    validated: boolean;
    locked: boolean;
    tenantId: string;
}
export declare const AccountingEntrySchema: import("mongoose").Schema<AccountingEntry, import("mongoose").Model<AccountingEntry, any, any, any, Document<unknown, any, AccountingEntry, any, {}> & AccountingEntry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AccountingEntry, Document<unknown, {}, import("mongoose").FlatRecord<AccountingEntry>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AccountingEntry> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
