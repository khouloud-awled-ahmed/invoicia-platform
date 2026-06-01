"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_controller_1 = require("./platform.controller");
const platform_service_1 = require("./platform.service");
const subscription_plans_service_1 = require("./subscription-plans.service");
const platform_settings_service_1 = require("./platform-settings.service");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const subscription_plan_schema_1 = require("./schemas/subscription-plan.schema");
const platform_settings_schema_1 = require("./schemas/platform-settings.schema");
const platform_invoices_module_1 = require("./platform-invoices/platform-invoices.module");
let PlatformModule = class PlatformModule {
};
exports.PlatformModule = PlatformModule;
exports.PlatformModule = PlatformModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: subscription_plan_schema_1.SubscriptionPlan.name, schema: subscription_plan_schema_1.SubscriptionPlanSchema },
                { name: platform_settings_schema_1.PlatformSettings.name, schema: platform_settings_schema_1.PlatformSettingsSchema },
            ]),
            platform_invoices_module_1.PlatformInvoicesModule,
        ],
        controllers: [platform_controller_1.PlatformController],
        providers: [platform_service_1.PlatformService, subscription_plans_service_1.SubscriptionPlansService, platform_settings_service_1.PlatformSettingsService],
        exports: [platform_service_1.PlatformService, subscription_plans_service_1.SubscriptionPlansService, platform_settings_service_1.PlatformSettingsService],
    })
], PlatformModule);
//# sourceMappingURL=platform.module.js.map