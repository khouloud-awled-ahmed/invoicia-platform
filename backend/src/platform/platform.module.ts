import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { PlatformSettingsService } from './platform-settings.service';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from './schemas/subscription-plan.schema';
import { PlatformSettings, PlatformSettingsSchema } from './schemas/platform-settings.schema';
import { PlatformInvoicesModule } from './platform-invoices/platform-invoices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: PlatformSettings.name, schema: PlatformSettingsSchema },
    ]),
    PlatformInvoicesModule,
  ],
  controllers: [PlatformController],
  providers: [PlatformService, SubscriptionPlansService, PlatformSettingsService],
  exports: [PlatformService, SubscriptionPlansService, PlatformSettingsService],
})
export class PlatformModule {}
