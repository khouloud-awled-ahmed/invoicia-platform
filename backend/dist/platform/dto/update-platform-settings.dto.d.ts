export declare class UpdatePlatformSettingsDto {
    paymentMethods?: {
        iban?: {
            iban: string;
            bic: string;
            bankName: string;
            accountHolder: string;
        };
        stripe?: {
            publicKey: string;
        };
        paypal?: {
            clientId: string;
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
    invoiceColor?: string;
    invoicePrefix?: string;
}
