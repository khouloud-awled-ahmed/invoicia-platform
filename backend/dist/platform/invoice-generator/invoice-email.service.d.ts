import { PlatformInvoiceDocument } from '../schemas/platform-invoice.schema';
import { PlatformSettingsDocument } from '../schemas/platform-settings.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
export declare class InvoiceEmailService {
    private readonly logger;
    sendInvoiceEmail(invoice: PlatformInvoiceDocument, tenant: TenantDocument, platformSettings: PlatformSettingsDocument, pdfPath: string): Promise<void>;
}
