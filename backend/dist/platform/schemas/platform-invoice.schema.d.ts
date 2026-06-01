import { Document } from 'mongoose';
export type PlatformInvoiceDocument = PlatformInvoice & Document;
export declare enum PlatformInvoiceStatus {
    DRAFT = "DRAFT",
    ISSUED = "ISSUED",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare enum PlatformInvoicePaymentMethod {
    CARD = "CARD",
    TRANSFER = "TRANSFER",
    PAYPAL = "PAYPAL"
}
export declare class PlatformInvoice {
    invoiceNumber: string;
    tenantId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    status: PlatformInvoiceStatus;
    paymentMethod: PlatformInvoicePaymentMethod;
    pdfUrl?: string;
    pdfPath?: string;
    issuedAt: Date;
    paidAt?: Date;
    dueDate?: Date;
    tenantSnapshot?: {
        name: string;
        businessName?: string;
        email: string;
        adminEmail: string;
        address?: {
            line1: string;
            line2?: string;
            postalCode: string;
            city: string;
            country: string;
        };
        matriculeFiscal?: string;
        vatNumber?: string;
    };
    planSnapshot?: {
        name: string;
        price: number;
        currency: string;
        features: string[];
        maxUsers?: number;
    };
    promoCode?: string;
    discountAmount?: number;
    subtotal?: number;
    taxAmount?: number;
    totalAmount: number;
    notes?: string;
    emailSent: boolean;
    emailSentAt?: Date;
}
export declare const PlatformInvoiceSchema: import("mongoose").Schema<PlatformInvoice, import("mongoose").Model<PlatformInvoice, any, any, any, Document<unknown, any, PlatformInvoice, any, {}> & PlatformInvoice & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PlatformInvoice, Document<unknown, {}, import("mongoose").FlatRecord<PlatformInvoice>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PlatformInvoice> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
