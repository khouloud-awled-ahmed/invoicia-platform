import { Document } from 'mongoose';
import { InvoiceItem } from './invoice-item.schema';
export type InvoiceDocument = Invoice & Document;
export declare class Invoice {
    number: string;
    date: Date;
    dueDate: Date;
    clientId: string;
    client: string;
    clientAddress?: string;
    clientEmail?: string;
    tenantId: string;
    orderNumber?: string;
    engagementId?: string;
    items: InvoiceItem[];
    amountHT: number;
    amountTVA: number;
    amountTTC: number;
    timbreFiscal: number;
    withholdingAmount: number;
    netAPayer: number;
    totalAvoirAmount: number;
    remainingBalance: number;
    hasAvoirs: boolean;
    currency: string;
    deposit: number;
    paymentTerms?: string;
    notes?: string;
    status: string;
    tags?: string[];
    extractionConfidence?: number;
    linkedCreditNoteId?: string;
    linkedCreditNoteNumber?: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    projectIds: string[];
    metadata?: Record<string, any>;
}
export declare const InvoiceSchema: import("mongoose").Schema<Invoice, import("mongoose").Model<Invoice, any, any, any, Document<unknown, any, Invoice, any, {}> & Invoice & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invoice, Document<unknown, {}, import("mongoose").FlatRecord<Invoice>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Invoice> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
