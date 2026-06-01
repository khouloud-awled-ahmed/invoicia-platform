import { Document } from 'mongoose';
export type TenantDocument = Tenant & Document;
export declare class Tenant {
    name: string;
    businessName: string;
    logo?: string;
    primaryColor: string;
    matriculeFiscal: string;
    registreCommerce?: string;
    codeDouane?: string;
    affiliationCNSS?: string;
    email: string;
    phone?: string;
    tvaNumber?: string;
    isVatSubject?: boolean;
    legalForm?: string;
    capital?: number;
    address?: {
        line1: string;
        line2?: string;
        postalCode: string;
        city: string;
        country: string;
    };
    defaultBankAccount?: {
        bankName: string;
        bankAddress: string;
        iban: string;
        bic: string;
    };
    defaultTerms?: {
        penaltyRate: number;
        penaltyDescription: string;
        recoveryFee: number;
        discountPolicy: string;
        paymentTermsDefault: number;
    };
    isConfigured?: boolean;
    invoiceSettings?: {
        prefix?: string;
        nextNumber?: string;
        footerText?: string;
        template?: string;
        facturXGeneration?: boolean;
        eInvoicingTransmission?: boolean;
        currency?: string;
        timbreFiscalAmount?: number;
    };
    billingSettings?: {
        enabled: boolean;
        structuredFormatsEnabled: boolean;
        platformAgreementEnabled: boolean;
        platformAgreementConfig?: {
            platform: string;
            apiKey?: string;
            apiSecret?: string;
            endpoint?: string;
        };
    };
    notificationPreferences?: {
        [key: string]: {
            inApp: boolean;
            email: boolean;
            sms: boolean;
        };
    };
    securitySettings?: {
        mfaRequired: boolean;
        sessionTimeout: number;
        passwordPolicy: {
            minLength: number;
            requireSpecialChar: boolean;
        };
    };
    pack: string;
    modules: string[];
    moduleFlags?: {
        module_clients?: boolean;
        module_crm?: boolean;
        module_invoicing?: boolean;
        module_suppliers?: boolean;
        module_projects?: boolean;
        module_staffing?: boolean;
        module_cra?: boolean;
        module_accounting?: boolean;
        module_payments?: boolean;
        module_banking?: boolean;
        module_hr?: boolean;
        module_cvtech?: boolean;
        module_ged?: boolean;
        module_signature?: boolean;
    };
    subscriptionStatus: string;
    planType: string;
    planId?: string;
    maxUsers: number;
    currentUsers: number;
    status: string;
    features: string[];
    trialEndsAt?: Date;
    subscriptionEndsAt?: Date;
    metadata?: {
        notes?: string;
        lastLogin?: Date;
        [key: string]: any;
    };
    settings?: {
        companyAddress?: {
            line1: string;
            line2?: string;
            postalCode: string;
            city: string;
            country: string;
        };
        matriculeFiscal?: string;
        vatNumber?: string;
        logoUrl?: string;
        paymentMethods?: Array<{
            type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
            enabled: boolean;
            details: Record<string, any>;
        }>;
    };
    adminEmail: string;
    subscriptionPlan: string;
    payrollSettings?: {
        matriculeFiscal?: string;
        affiliationCNSS?: string;
        codeDouane?: string;
    };
    bankingConfig?: {
        provider?: 'GOCARDLESS' | 'BRIDGE';
        clientId?: string;
        clientSecret?: string;
        isActive?: boolean;
        redirectUri?: string;
        baseUrl?: string;
    };
}
export declare const TenantSchema: import("mongoose").Schema<Tenant, import("mongoose").Model<Tenant, any, any, any, Document<unknown, any, Tenant, any, {}> & Tenant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tenant, Document<unknown, {}, import("mongoose").FlatRecord<Tenant>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Tenant> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
