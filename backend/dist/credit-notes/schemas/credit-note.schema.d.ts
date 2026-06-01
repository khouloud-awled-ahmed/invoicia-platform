import { Document } from 'mongoose';
import { InvoiceItem } from '../../billing/sales/schemas/invoice-item.schema';
export type CreditNoteDocument = CreditNote & Document;
export declare class CreditNote {
    number: string;
    date: Date;
    relatedInvoiceId?: string;
    relatedInvoiceNumber?: string;
    clientId: string;
    client: string;
    tenantId: string;
    items: InvoiceItem[];
    amountHT: number;
    amountTVA: number;
    amountTTC: number;
    tvaRate: number;
    reason?: string;
    status: string;
}
export declare const CreditNoteSchema: import("mongoose").Schema<CreditNote, import("mongoose").Model<CreditNote, any, any, any, Document<unknown, any, CreditNote, any, {}> & CreditNote & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CreditNote, Document<unknown, {}, import("mongoose").FlatRecord<CreditNote>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<CreditNote> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
