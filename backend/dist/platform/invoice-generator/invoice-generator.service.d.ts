import { PlatformSettingsDocument } from '../schemas/platform-settings.schema';
import { PlatformInvoice } from '../schemas/platform-invoice.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
export declare class InvoiceGeneratorService {
    private readonly logger;
    generateInvoicePDF(invoice: PlatformInvoice, platformSettings: PlatformSettingsDocument, tenant: TenantDocument): Promise<Buffer>;
    private hexToRgb;
}
