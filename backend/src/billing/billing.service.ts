import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';

@Injectable()
export class BillingService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  async getBillingStatus(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    const billingEnabled =
      tenant.billingSettings?.enabled || tenant.features?.includes('billing') || false;
    const structuredFormatsEnabled =
      tenant.billingSettings?.structuredFormatsEnabled ||
      tenant.features?.includes('structured-formats') ||
      false;
    const platformAgreementEnabled =
      tenant.billingSettings?.platformAgreementEnabled ||
      tenant.features?.includes('platform-agreement') ||
      false;

    return {
      enabled: billingEnabled,
      structuredFormats: {
        enabled: structuredFormatsEnabled,
        formats: structuredFormatsEnabled ? ['UBL', 'CII', 'Factur-X'] : [],
      },
      platformAgreement: {
        enabled: platformAgreementEnabled,
        configured: !!tenant.metadata?.platformAgreementConfig,
        platform: tenant.metadata?.platformAgreementConfig?.platform || null,
      },
    };
  }

  async getSummary(tenantId: string, filters: any) {
    const status = await this.getBillingStatus(tenantId);
    if (!status.enabled) {
      throw new ForbiddenException('Billing module is not enabled for this tenant');
    }

    // TODO: Implémenter la logique de résumé
    return {
      invoices: { total: 0, pending: 0, paid: 0 },
      creditNotes: { total: 0 },
      suppliers: { total: 0 },
      clients: { total: 0 },
    };
  }
}
