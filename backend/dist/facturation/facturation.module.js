"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const facturation_controller_1 = require("./facturation.controller");
const facturation_service_1 = require("./facturation.service");
const cra_schema_1 = require("./schemas/cra.schema");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
let FacturationModule = class FacturationModule {
};
exports.FacturationModule = FacturationModule;
exports.FacturationModule = FacturationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: cra_schema_1.Cra.name, schema: cra_schema_1.CraSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
            ]),
        ],
        controllers: [facturation_controller_1.FacturationController],
        providers: [facturation_service_1.FacturationService],
    })
], FacturationModule);
//# sourceMappingURL=facturation.module.js.map