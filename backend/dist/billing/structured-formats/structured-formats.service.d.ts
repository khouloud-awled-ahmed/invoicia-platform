import { Model } from 'mongoose';
import { InvoiceDocument } from '../sales/schemas/invoice.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { UBLGeneratorService } from './generators/ubl-generator.service';
import { CIIGeneratorService } from './generators/cii-generator.service';
import { FacturXGeneratorService } from './generators/factur-x-generator.service';
export declare class StructuredFormatsService {
    private invoiceModel;
    private tenantModel;
    private ublGenerator;
    private ciiGenerator;
    private facturXGenerator;
    constructor(invoiceModel: Model<InvoiceDocument>, tenantModel: Model<TenantDocument>, ublGenerator: UBLGeneratorService, ciiGenerator: CIIGeneratorService, facturXGenerator: FacturXGeneratorService);
    isEnabled(tenantId: string): Promise<boolean>;
    generateInvoice(invoiceId: string, format: 'UBL' | 'CII' | 'Factur-X', tenantId: string): Promise<any>;
    validateInvoice(invoiceId: string, tenantId: string): Promise<any>;
}
