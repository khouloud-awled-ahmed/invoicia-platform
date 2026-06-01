import { Document } from 'mongoose';
export type SupplierDocument = Supplier & Document;
export declare class Supplier {
    name: string;
    businessName?: string;
    email?: string;
    phone?: string;
    address?: string;
    matriculeFiscal?: string;
    vatNumber?: string;
    tenantId: string;
    status: string;
    intervenantIds: string[];
    invoiceEmail?: string;
    canSendInvoiceByEmail: boolean;
    emailInvoiceToken?: string;
    metadata?: Record<string, any>;
}
export declare const SupplierSchema: import("mongoose").Schema<Supplier, import("mongoose").Model<Supplier, any, any, any, Document<unknown, any, Supplier, any, {}> & Supplier & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Supplier, Document<unknown, {}, import("mongoose").FlatRecord<Supplier>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Supplier> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
