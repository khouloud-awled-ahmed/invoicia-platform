import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from '../../platform/schemas/subscription-plan.schema';
import { PromoCode, PromoCodeSchema } from '../schemas/promo-code.schema';
import { PlatformSettings, PlatformSettingsSchema } from '../../platform/schemas/platform-settings.schema';
import { User, UserSchema } from '../../users/schemas/user.schema';
import { PlatformInvoicesModule } from '../../platform/platform-invoices/platform-invoices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: PlatformSettings.name, schema: PlatformSettingsSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PlatformInvoicesModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
