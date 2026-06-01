import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { ModuleAccessGuard } from './guards/module-access.guard';

// Sous-domaines principaux
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AutomationModule } from './automation/automation.module';
import { SubscriptionModule } from './subscription/subscription.module';

// Modules partagés
import { AccountingModule } from './accounting/accounting.module';
import { StructuredFormatsModule } from './structured-formats/structured-formats.module';
import { PlatformAgreementModule } from './platform-agreement/platform-agreement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    SubscriptionModule,
    SalesModule,
    PurchasesModule,
    AutomationModule,
    AccountingModule,
    StructuredFormatsModule,
    PlatformAgreementModule,
  ],
  controllers: [BillingController],
  providers: [BillingService, ModuleAccessGuard],
  exports: [
    BillingService,
    ModuleAccessGuard,
    SalesModule,
    PurchasesModule,
    AutomationModule,
    AccountingModule,
    StructuredFormatsModule,
    PlatformAgreementModule,
  ],
})
export class BillingModule {}
