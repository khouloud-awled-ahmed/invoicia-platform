import { InvoiceDocument } from '../../sales/schemas/invoice.schema';
import { TenantDocument } from '../../../tenants/schemas/tenant.schema';
export declare class CIIGeneratorService {
    generate(invoice: InvoiceDocument, tenant: TenantDocument): any;
    private toXML;
    private objectToXML;
}
