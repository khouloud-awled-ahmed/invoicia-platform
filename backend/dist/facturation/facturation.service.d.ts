import { Model } from 'mongoose';
import { CraDocument } from './schemas/cra.schema';
import { InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
export declare class FacturationService {
    private craModel;
    private invoiceModel;
    constructor(craModel: Model<CraDocument>, invoiceModel: Model<InvoiceDocument>);
    getPendingLines(tenantId: string): Promise<{
        id: string;
        projectName: string;
        consultant: string;
        date: string;
        hours: number;
        rate: number;
        amount: number;
    }[]>;
    getStats(tenantId: string): Promise<{
        totalMonth: any;
        alreadyInvoiced: any;
        month: string;
    }>;
    generateInvoices(craLineIds: string[], tenantId: string): Promise<{
        invoiceCount: number;
    }>;
}
