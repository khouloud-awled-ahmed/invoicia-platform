import { Model } from 'mongoose';
import { InvoiceDocument } from '../sales/schemas/invoice.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { StructuredFormatsService } from '../structured-formats/structured-formats.service';
export declare class PlatformAgreementService {
    private invoiceModel;
    private tenantModel;
    private structuredFormatsService;
    constructor(invoiceModel: Model<InvoiceDocument>, tenantModel: Model<TenantDocument>, structuredFormatsService: StructuredFormatsService);
    isEnabled(tenantId: string): Promise<boolean>;
    getStatus(tenantId: string): Promise<any>;
    getAvailablePlatforms(): Promise<any[]>;
    transmitInvoice(invoiceId: string, tenantId: string, format: 'UBL' | 'CII' | 'Factur-X', platformId?: string): Promise<any>;
    private transmitToPlatform;
    getTransmissionStatus(invoiceId: string, tenantId: string): Promise<any>;
}
