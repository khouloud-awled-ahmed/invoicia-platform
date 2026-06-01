import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getBillingStatus(user: any): Promise<{
        enabled: boolean;
        structuredFormats: {
            enabled: boolean;
            formats: string[];
        };
        platformAgreement: {
            enabled: boolean;
            configured: boolean;
            platform: any;
        };
    }>;
    getSummary(user: any, filters: any): Promise<{
        invoices: {
            total: number;
            pending: number;
            paid: number;
        };
        creditNotes: {
            total: number;
        };
        suppliers: {
            total: number;
        };
        clients: {
            total: number;
        };
    }>;
}
