"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const employees_service_1 = require("./employees.service");
const employees_controller_1 = require("./employees.controller");
const employee_schema_1 = require("./schemas/employee.schema");
const cv_schema_1 = require("./schemas/cv.schema");
const users_module_1 = require("../users/users.module");
const document_parser_module_1 = require("../document-parser/document-parser.module");
const chatbot_service_1 = require("./chatbot.service");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
let EmployeesModule = class EmployeesModule {
};
exports.EmployeesModule = EmployeesModule;
exports.EmployeesModule = EmployeesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: cv_schema_1.CV.name, schema: cv_schema_1.CVSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
            ]),
            users_module_1.UsersModule,
            document_parser_module_1.DocumentParserModule,
        ],
        controllers: [employees_controller_1.EmployeesController],
        providers: [employees_service_1.EmployeesService, chatbot_service_1.ChatbotService],
        exports: [employees_service_1.EmployeesService],
    })
], EmployeesModule);
//# sourceMappingURL=employees.module.js.map