"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const purchases_controller_1 = require("./purchases.controller");
const purchases_service_1 = require("./purchases.service");
const expense_schema_1 = require("./schemas/expense.schema");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const module_access_guard_1 = require("../guards/module-access.guard");
const document_parser_module_1 = require("../../document-parser/document-parser.module");
let PurchasesModule = class PurchasesModule {
};
exports.PurchasesModule = PurchasesModule;
exports.PurchasesModule = PurchasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: expense_schema_1.Expense.name, schema: expense_schema_1.ExpenseSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
            ]),
            suppliers_module_1.SuppliersModule,
            document_parser_module_1.DocumentParserModule,
        ],
        controllers: [purchases_controller_1.PurchasesController],
        providers: [purchases_service_1.PurchasesService, module_access_guard_1.ModuleAccessGuard],
        exports: [purchases_service_1.PurchasesService, suppliers_module_1.SuppliersModule],
    })
], PurchasesModule);
//# sourceMappingURL=purchases.module.js.map