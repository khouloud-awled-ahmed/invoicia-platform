import { Document } from 'mongoose';
export type PlatformSettingsDocument = PlatformSettings & Document;
export declare class PlatformSettings {
    id: string;
    paymentMethods?: {
        iban?: {
            iban: string;
            bic: string;
            bankName: string;
            accountHolder: string;
        };
        stripe?: {
            publicKey: string;
            secretKey?: string;
            webhookSecret?: string;
        };
        paypal?: {
            clientId: string;
            clientSecret?: string;
        };
    };
    supportEmail?: string;
    supportPhone?: string;
    companyName?: string;
    address?: {
        line1: string;
        line2?: string;
        postalCode: string;
        city: string;
        country: string;
    };
    metadata?: Record<string, any>;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    defaultTrialDaysForTransfer: number;
    invoiceLogoUrl?: string;
    invoiceCompanyName?: string;
    invoiceCompanyAddress?: {
        line1: string;
        line2?: string;
        postalCode: string;
        city: string;
        country: string;
    };
    invoiceCompanyVat?: string;
    invoiceFooterText?: string;
    nextInvoiceNumber: number;
    invoiceColor: string;
    invoicePrefix?: string;
}
export declare const PlatformSettingsSchema: import("mongoose").Schema<PlatformSettings, import("mongoose").Model<PlatformSettings, any, any, any, Document<unknown, any, PlatformSettings, any, {}> & PlatformSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PlatformSettings, Document<unknown, {}, import("mongoose").FlatRecord<PlatformSettings>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PlatformSettings> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
