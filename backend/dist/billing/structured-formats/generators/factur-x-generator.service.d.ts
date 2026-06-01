import { InvoiceDocument } from '../../sales/schemas/invoice.schema';
import { TenantDocument } from '../../../tenants/schemas/tenant.schema';
export declare class FacturXGeneratorService {
    generate(invoice: InvoiceDocument, tenant: TenantDocument): any;
    private toXML;
    private objectToXML;
}
