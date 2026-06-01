import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsService {
    private tenantModel;
    private readonly logger;
    constructor(tenantModel: Model<TenantDocument>);
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<void>;
    getSettings(id: string): Promise<Tenant>;
    updateCompanyInfo(id: string, data: {
        matriculeFiscal?: string;
        registreCommerce?: string;
        codeDouane?: string;
        affiliationCNSS?: string;
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
        email?: string;
        phone?: string;
    }): Promise<Tenant>;
    updateBankAccount(id: string, data: {
        bankName: string;
        bankAddress: string;
        iban: string;
        bic: string;
    }): Promise<Tenant>;
    updateInvoiceSettings(id: string, data: {
        prefix?: string;
        nextNumber?: string;
        footerText?: string;
        currency?: string;
        timbreFiscalAmount?: number;
    }): Promise<Tenant>;
    updateNotificationPreferences(id: string, data: {
        [key: string]: {
            inApp: boolean;
            email: boolean;
            sms: boolean;
        };
    }): Promise<Tenant>;
    updateSecuritySettings(id: string, data: {
        mfaRequired?: boolean;
        sessionTimeout?: number;
        passwordPolicy?: {
            minLength: number;
            requireSpecialChar: boolean;
        };
    }): Promise<Tenant>;
    validateCompanyData(data: any): void;
    private validateMatriculeFiscal;
    private validateTVA;
    private validateIBAN;
    private validateBIC;
    updateBillingSettings(id: string, data: {
        enabled?: boolean;
        structuredFormatsEnabled?: boolean;
        platformAgreementEnabled?: boolean;
        platformAgreementConfig?: {
            platform: string;
            apiKey?: string;
            apiSecret?: string;
            endpoint?: string;
        };
    }): Promise<Tenant>;
    getBillingSettings(id: string): Promise<any>;
    updatePaymentMethods(id: string, paymentMethods: Array<{
        type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
        enabled: boolean;
        details: Record<string, any>;
    }>): Promise<Tenant>;
    getPaymentMethods(id: string): Promise<Array<{
        type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
        enabled: boolean;
        details: Record<string, any>;
    }>>;
    getBankingConfig(tenantId: string): Promise<{
        provider: 'GOCARDLESS' | 'BRIDGE';
        clientId: string;
        clientSecret: string;
        isActive: boolean;
        redirectUri?: string;
        baseUrl?: string;
    } | null>;
    private readonly MODULE_KEYS;
    getModuleFlags(tenantId: string): Promise<Record<string, boolean>>;
    toggleModule(tenantId: string, moduleName: string, isActive: boolean): Promise<Record<string, boolean>>;
    updateModuleFlags(tenantId: string, updates: Partial<Record<string, boolean>>): Promise<Tenant>;
    updateBankingConfig(tenantId: string, config: {
        provider: 'GOCARDLESS' | 'BRIDGE';
        clientId: string;
        clientSecret: string;
        isActive?: boolean;
        redirectUri?: string;
        baseUrl?: string;
    }): Promise<Tenant>;
}
