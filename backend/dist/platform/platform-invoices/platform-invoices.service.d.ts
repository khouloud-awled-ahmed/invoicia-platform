import { Model } from 'mongoose';
import { PlatformInvoiceDocument, PlatformInvoicePaymentMethod } from '../schemas/platform-invoice.schema';
import { PlatformSettingsDocument } from '../schemas/platform-settings.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { SubscriptionPlanDocument } from '../schemas/subscription-plan.schema';
import { InvoiceGeneratorService } from '../invoice-generator/invoice-generator.service';
import { InvoiceEmailService } from '../invoice-generator/invoice-email.service';
export declare class PlatformInvoicesService {
    private invoiceModel;
    private settingsModel;
    private tenantModel;
    private planModel;
    private invoiceGenerator;
    private invoiceEmailService;
    private readonly logger;
    constructor(invoiceModel: Model<PlatformInvoiceDocument>, settingsModel: Model<PlatformSettingsDocument>, tenantModel: Model<TenantDocument>, planModel: Model<SubscriptionPlanDocument>, invoiceGenerator: InvoiceGeneratorService, invoiceEmailService: InvoiceEmailService);
    private generateInvoiceNumber;
    createInvoice(tenantId: string, planId: string, amount: number, paymentMethod: PlatformInvoicePaymentMethod, promoCode?: string, discountAmount?: number, subtotal?: number): Promise<PlatformInvoiceDocument>;
    generateAndSavePDF(invoiceId: string): Promise<string>;
    findByTenant(tenantId: string): Promise<PlatformInvoiceDocument[]>;
    findOne(id: string, tenantId?: string): Promise<PlatformInvoiceDocument>;
    markAsPaid(invoiceId: string): Promise<PlatformInvoiceDocument>;
    generateFinalInvoiceForTransfer(tenantId: string): Promise<PlatformInvoiceDocument>;
}
