"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAgreementModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_agreement_controller_1 = require("./platform-agreement.controller");
const platform_agreement_service_1 = require("./platform-agreement.service");
const invoice_schema_1 = require("../sales/schemas/invoice.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const structured_formats_module_1 = require("../structured-formats/structured-formats.module");
let PlatformAgreementModule = class PlatformAgreementModule {
};
exports.PlatformAgreementModule = PlatformAgreementModule;
exports.PlatformAgreementModule = PlatformAgreementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
            ]),
            structured_formats_module_1.StructuredFormatsModule,
        ],
        controllers: [platform_agreement_controller_1.PlatformAgreementController],
        providers: [platform_agreement_service_1.PlatformAgreementService],
        exports: [platform_agreement_service_1.PlatformAgreementService],
    })
], PlatformAgreementModule);
//# sourceMappingURL=platform-agreement.module.js.map