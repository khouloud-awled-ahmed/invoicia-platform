"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredFormatsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const structured_formats_controller_1 = require("./structured-formats.controller");
const structured_formats_service_1 = require("./structured-formats.service");
const ubl_generator_service_1 = require("./generators/ubl-generator.service");
const cii_generator_service_1 = require("./generators/cii-generator.service");
const factur_x_generator_service_1 = require("./generators/factur-x-generator.service");
const invoice_schema_1 = require("../sales/schemas/invoice.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
let StructuredFormatsModule = class StructuredFormatsModule {
};
exports.StructuredFormatsModule = StructuredFormatsModule;
exports.StructuredFormatsModule = StructuredFormatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
            ]),
        ],
        controllers: [structured_formats_controller_1.StructuredFormatsController],
        providers: [
            structured_formats_service_1.StructuredFormatsService,
            ubl_generator_service_1.UBLGeneratorService,
            cii_generator_service_1.CIIGeneratorService,
            factur_x_generator_service_1.FacturXGeneratorService,
        ],
        exports: [structured_formats_service_1.StructuredFormatsService],
    })
], StructuredFormatsModule);
//# sourceMappingURL=structured-formats.module.js.map