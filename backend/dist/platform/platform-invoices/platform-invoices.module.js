"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformInvoicesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_invoices_controller_1 = require("./platform-invoices.controller");
const platform_invoices_service_1 = require("./platform-invoices.service");
const platform_invoice_schema_1 = require("../schemas/platform-invoice.schema");
const platform_settings_schema_1 = require("../schemas/platform-settings.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const subscription_plan_schema_1 = require("../schemas/subscription-plan.schema");
const invoice_generator_service_1 = require("../invoice-generator/invoice-generator.service");
const invoice_email_service_1 = require("../invoice-generator/invoice-email.service");
let PlatformInvoicesModule = class PlatformInvoicesModule {
};
exports.PlatformInvoicesModule = PlatformInvoicesModule;
exports.PlatformInvoicesModule = PlatformInvoicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: platform_invoice_schema_1.PlatformInvoice.name, schema: platform_invoice_schema_1.PlatformInvoiceSchema },
                { name: platform_settings_schema_1.PlatformSettings.name, schema: platform_settings_schema_1.PlatformSettingsSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
                { name: subscription_plan_schema_1.SubscriptionPlan.name, schema: subscription_plan_schema_1.SubscriptionPlanSchema },
            ]),
        ],
        controllers: [platform_invoices_controller_1.PlatformInvoicesController],
        providers: [platform_invoices_service_1.PlatformInvoicesService, invoice_generator_service_1.InvoiceGeneratorService, invoice_email_service_1.InvoiceEmailService],
        exports: [platform_invoices_service_1.PlatformInvoicesService],
    })
], PlatformInvoicesModule);
//# sourceMappingURL=platform-invoices.module.js.map