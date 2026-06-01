import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformInvoicesController } from './platform-invoices.controller';
import { PlatformInvoicesService } from './platform-invoices.service';
import { PlatformInvoice, PlatformInvoiceSchema } from '../schemas/platform-invoice.schema';
import { PlatformSettings, PlatformSettingsSchema } from '../schemas/platform-settings.schema';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from '../schemas/subscription-plan.schema';
import { InvoiceGeneratorService } from '../invoice-generator/invoice-generator.service';
import { InvoiceEmailService } from '../invoice-generator/invoice-email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformInvoice.name, schema: PlatformInvoiceSchema },
      { name: PlatformSettings.name, schema: PlatformSettingsSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
    ]),
  ],
  controllers: [PlatformInvoicesController],
  providers: [PlatformInvoicesService, InvoiceGeneratorService, InvoiceEmailService],
  exports: [PlatformInvoicesService],
})
export class PlatformInvoicesModule {}
