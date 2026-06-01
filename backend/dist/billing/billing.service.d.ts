import { Model } from 'mongoose';
import { TenantDocument } from '../tenants/schemas/tenant.schema';
export declare class BillingService {
    private tenantModel;
    constructor(tenantModel: Model<TenantDocument>);
    getBillingStatus(tenantId: string): Promise<{
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
    getSummary(tenantId: string, filters: any): Promise<{
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
