export declare class SubscribeDto {
    planId: string;
    paymentMethod: 'CARD' | 'TRANSFER';
    promoCode?: string;
    billingDetails?: {
        address?: {
            line1: string;
            line2?: string;
            postalCode: string;
            city: string;
            country: string;
        };
        vatNumber?: string;
        matriculeFiscal?: string;
    };
}
