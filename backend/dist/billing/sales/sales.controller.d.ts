import { Response } from 'express';
import { SalesService } from './sales.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UniversalDocumentParserService } from '../../document-parser/services/universal-document-parser.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { Model } from 'mongoose';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ClientDocument } from '../../clients/schemas/client.schema';
export declare class SalesController {
    private readonly salesService;
    private readonly documentParser;
    private readonly invoicePdfService;
    private tenantModel;
    private clientModel;
    constructor(salesService: SalesService, documentParser: UniversalDocumentParserService, invoicePdfService: InvoicePdfService, tenantModel: Model<TenantDocument>, clientModel: Model<ClientDocument>);
    create(createInvoiceDto: CreateInvoiceDto, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    findAll(filters: any, user: any): Promise<import("./schemas/invoice.schema").Invoice[]>;
    findOne(id: string, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    downloadPdf(id: string, user: any, res: Response): Promise<void>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    remove(id: string, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    validateInvoice(id: string, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    markAsPaid(id: string, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    cancelInvoice(id: string, body: {
        reason?: string;
    }, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    archiveInvoice(id: string, user: any): Promise<import("./schemas/invoice.schema").Invoice>;
    getNextNumber(user: any): Promise<{
        number: string;
    }>;
    getDashboard(user: any): Promise<{
        totalCA: number;
        totalInvoices: number;
        thisMonth: number;
        thisMonthCount: number;
        pending: number;
        validated: number;
        top5Clients: {
            client: string;
            total: number;
            percentage: number;
        }[];
        statusDistribution: {
            status: string;
            count: number;
            total: number;
        }[];
    }>;
    parseInvoice(file: any, user: any): Promise<import("../../document-parser/services/universal-document-parser.service").AnalyzeFileResult>;
}
