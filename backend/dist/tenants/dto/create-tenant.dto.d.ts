declare class AddressDto {
    line1?: string;
    line2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
}
declare class DefaultBankAccountDto {
    bankName?: string;
    bankAddress?: string;
    iban?: string;
    bic?: string;
}
declare class DefaultTermsDto {
    penaltyRate?: number;
    penaltyDescription?: string;
    recoveryFee?: number;
    discountPolicy?: string;
    paymentTermsDefault?: number;
}
declare class InvoiceSettingsDto {
    prefix?: string;
    nextNumber?: string;
    footerText?: string;
}
declare class PasswordPolicyDto {
    minLength?: number;
    requireSpecialChar?: boolean;
}
declare class SecuritySettingsDto {
    mfaRequired?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: PasswordPolicyDto;
}
export declare class CreateTenantDto {
    name: string;
    businessName: string;
    logo?: string;
    primaryColor?: string;
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
    address?: AddressDto;
    defaultBankAccount?: DefaultBankAccountDto;
    defaultTerms?: DefaultTermsDto;
    invoiceSettings?: InvoiceSettingsDto;
    notificationPreferences?: {
        [key: string]: {
            inApp: boolean;
            email: boolean;
            sms: boolean;
        };
    };
    securitySettings?: SecuritySettingsDto;
    pack: string;
    modules?: string[];
    maxUsers?: number;
    features?: string[];
}
export {};
