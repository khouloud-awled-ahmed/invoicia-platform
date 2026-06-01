import { Response } from 'express';
import { PlatformInvoicesService } from './platform-invoices.service';
export declare class PlatformInvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: PlatformInvoicesService);
    getMyInvoices(user: any): Promise<import("../schemas/platform-invoice.schema").PlatformInvoiceDocument[]>;
    getInvoice(id: string, user: any): Promise<import("../schemas/platform-invoice.schema").PlatformInvoiceDocument>;
    downloadInvoice(id: string, res: Response, user: any): Promise<void>;
    getAllInvoices(tenantId: string | undefined, user: any): Promise<import("../schemas/platform-invoice.schema").PlatformInvoiceDocument[]>;
}
