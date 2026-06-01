import { Model } from 'mongoose';
import { InvoiceDocument } from '../sales/schemas/invoice.schema';
import { ProjectDocument } from '../../projects/schemas/project.schema';
export declare class AutomationService {
    private invoiceModel;
    private projectModel;
    constructor(invoiceModel: Model<InvoiceDocument>, projectModel: Model<ProjectDocument>);
    getInvoiceableEntries(tenantId: string, filters?: any): Promise<{
        entries: any[];
        total: number;
    }>;
    generateInvoices(tenantId: string, options: any): Promise<{
        message: string;
        invoices: any[];
    }>;
    generateFromCRA(tenantId: string, options: any): Promise<{
        message: string;
        invoices: any[];
    }>;
}
