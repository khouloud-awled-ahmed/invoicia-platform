"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const sales_controller_1 = require("./sales.controller");
const sales_service_1 = require("./sales.service");
const invoice_pdf_service_1 = require("./invoice-pdf.service");
const clients_module_1 = require("./clients/clients.module");
const credit_notes_module_1 = require("./credit-notes/credit-notes.module");
const invoice_schema_1 = require("./schemas/invoice.schema");
const client_schema_1 = require("../../clients/schemas/client.schema");
const project_schema_1 = require("../../projects/schemas/project.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const module_access_guard_1 = require("../guards/module-access.guard");
const document_parser_module_1 = require("../../document-parser/document-parser.module");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
            ]),
            clients_module_1.ClientsModule,
            credit_notes_module_1.CreditNotesModule,
            document_parser_module_1.DocumentParserModule,
        ],
        controllers: [sales_controller_1.SalesController],
        providers: [sales_service_1.SalesService, invoice_pdf_service_1.InvoicePdfService, module_access_guard_1.ModuleAccessGuard],
        exports: [sales_service_1.SalesService, clients_module_1.ClientsModule, credit_notes_module_1.CreditNotesModule],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map