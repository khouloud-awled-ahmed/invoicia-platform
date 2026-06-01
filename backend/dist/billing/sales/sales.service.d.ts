import { Model } from 'mongoose';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { ClientDocument } from '../../clients/schemas/client.schema';
import { ProjectDocument } from '../../projects/schemas/project.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
export declare class SalesService {
    private invoiceModel;
    private clientModel;
    private projectModel;
    private tenantModel;
    constructor(invoiceModel: Model<InvoiceDocument>, clientModel: Model<ClientDocument>, projectModel: Model<ProjectDocument>, tenantModel: Model<TenantDocument>);
    private calculateInvoiceAmounts;
    getDashboard(tenantId: string): Promise<{
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
    getNextInvoiceNumber(tenantId: string): Promise<{
        number: string;
    }>;
    createInvoice(createInvoiceDto: CreateInvoiceDto, tenantId: string): Promise<Invoice>;
    findAllInvoices(tenantId: string, filters?: any): Promise<Invoice[]>;
    findOneInvoice(id: string, tenantId: string): Promise<Invoice>;
    updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string): Promise<Invoice>;
    removeInvoice(id: string, tenantId: string): Promise<Invoice>;
    changeInvoiceStatus(id: string, status: string, tenantId: string): Promise<Invoice>;
    cancelInvoice(id: string, reason: string | undefined, tenantId: string): Promise<Invoice>;
}
