import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../sales/schemas/invoice.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { UBLGeneratorService } from './generators/ubl-generator.service';
import { CIIGeneratorService } from './generators/cii-generator.service';
import { FacturXGeneratorService } from './generators/factur-x-generator.service';

@Injectable()
export class StructuredFormatsService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private ublGenerator: UBLGeneratorService,
    private ciiGenerator: CIIGeneratorService,
    private facturXGenerator: FacturXGeneratorService,
  ) {}

  async isEnabled(tenantId: string): Promise<boolean> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    return tenant?.features?.includes('structured-formats') || false;
  }

  async generateInvoice(
    invoiceId: string,
    format: 'UBL' | 'CII' | 'Factur-X',
    tenantId: string,
  ): Promise<any> {
    const isEnabled = await this.isEnabled(tenantId);
    if (!isEnabled) {
      throw new ForbiddenException('Structured formats are not enabled for this tenant');
    }

    const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    switch (format) {
      case 'UBL':
        return this.ublGenerator.generate(invoice, tenant);
      case 'CII':
        return this.ciiGenerator.generate(invoice, tenant);
      case 'Factur-X':
        return this.facturXGenerator.generate(invoice, tenant);
      default:
        throw new NotFoundException(`Format ${format} is not supported`);
    }
  }

  async validateInvoice(invoiceId: string, tenantId: string): Promise<any> {
    const isEnabled = await this.isEnabled(tenantId);
    if (!isEnabled) {
      throw new ForbiddenException('Structured formats are not enabled for this tenant');
    }

    const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // Validation basique
    const errors: string[] = [];
    if (!invoice.number) errors.push('Invoice number is required');
    if (!invoice.date) errors.push('Invoice date is required');
    if (!invoice.clientId) errors.push('Client is required');
    if (!invoice.items || invoice.items.length === 0) {
      errors.push('At least one item is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
