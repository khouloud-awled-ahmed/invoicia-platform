"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const billing_controller_1 = require("./billing.controller");
const billing_service_1 = require("./billing.service");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const module_access_guard_1 = require("./guards/module-access.guard");
const sales_module_1 = require("./sales/sales.module");
const purchases_module_1 = require("./purchases/purchases.module");
const automation_module_1 = require("./automation/automation.module");
const subscription_module_1 = require("./subscription/subscription.module");
const accounting_module_1 = require("./accounting/accounting.module");
const structured_formats_module_1 = require("./structured-formats/structured-formats.module");
const platform_agreement_module_1 = require("./platform-agreement/platform-agreement.module");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema }]),
            subscription_module_1.SubscriptionModule,
            sales_module_1.SalesModule,
            purchases_module_1.PurchasesModule,
            automation_module_1.AutomationModule,
            accounting_module_1.AccountingModule,
            structured_formats_module_1.StructuredFormatsModule,
            platform_agreement_module_1.PlatformAgreementModule,
        ],
        controllers: [billing_controller_1.BillingController],
        providers: [billing_service_1.BillingService, module_access_guard_1.ModuleAccessGuard],
        exports: [
            billing_service_1.BillingService,
            module_access_guard_1.ModuleAccessGuard,
            sales_module_1.SalesModule,
            purchases_module_1.PurchasesModule,
            automation_module_1.AutomationModule,
            accounting_module_1.AccountingModule,
            structured_formats_module_1.StructuredFormatsModule,
            platform_agreement_module_1.PlatformAgreementModule,
        ],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map