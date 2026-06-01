"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const subscription_controller_1 = require("./subscription.controller");
const subscription_service_1 = require("./subscription.service");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const subscription_plan_schema_1 = require("../../platform/schemas/subscription-plan.schema");
const promo_code_schema_1 = require("../schemas/promo-code.schema");
const platform_settings_schema_1 = require("../../platform/schemas/platform-settings.schema");
const user_schema_1 = require("../../users/schemas/user.schema");
const platform_invoices_module_1 = require("../../platform/platform-invoices/platform-invoices.module");
let SubscriptionModule = class SubscriptionModule {
};
exports.SubscriptionModule = SubscriptionModule;
exports.SubscriptionModule = SubscriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
                { name: subscription_plan_schema_1.SubscriptionPlan.name, schema: subscription_plan_schema_1.SubscriptionPlanSchema },
                { name: promo_code_schema_1.PromoCode.name, schema: promo_code_schema_1.PromoCodeSchema },
                { name: platform_settings_schema_1.PlatformSettings.name, schema: platform_settings_schema_1.PlatformSettingsSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            platform_invoices_module_1.PlatformInvoicesModule,
        ],
        controllers: [subscription_controller_1.SubscriptionController],
        providers: [subscription_service_1.SubscriptionService],
        exports: [subscription_service_1.SubscriptionService],
    })
], SubscriptionModule);
//# sourceMappingURL=subscription.module.js.map