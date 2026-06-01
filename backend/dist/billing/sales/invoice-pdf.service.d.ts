import { InvoiceDocument } from './schemas/invoice.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ClientDocument } from '../../clients/schemas/client.schema';
export declare class InvoicePdfService {
    private readonly logger;
    generateSalesInvoicePdf(invoice: InvoiceDocument, tenant: TenantDocument, client: ClientDocument | null): Promise<Buffer>;
}
