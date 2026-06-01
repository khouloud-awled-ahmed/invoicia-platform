"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatbotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cv_schema_1 = require("./schemas/cv.schema");
const employee_schema_1 = require("./schemas/employee.schema");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
let ChatbotService = ChatbotService_1 = class ChatbotService {
    constructor(cvModel, employeeModel, invoiceModel, clientModel) {
        this.cvModel = cvModel;
        this.employeeModel = employeeModel;
        this.invoiceModel = invoiceModel;
        this.clientModel = clientModel;
        this.logger = new common_1.Logger(ChatbotService_1.name);
        this.chatbotUrl = process.env.CHATBOT_URL || '';
    }
    async chat(question, tenantId) {
        try {
            const [cvs, employees, invoices, clients] = await Promise.all([
                this.cvModel.find({ tenantId }).limit(10).lean(),
                this.employeeModel.find({ tenantId }).limit(20).lean(),
                this.invoiceModel.find({ tenantId }).limit(20).lean(),
                this.clientModel.find({ tenantId }).limit(20).lean(),
            ]);
            const context = {
                candidates: cvs.map(cv => ({
                    name: cv.name || cv.fileName,
                    email: cv.email,
                    rawText: cv.rawText?.substring(0, 300),
                })),
                employees: employees.map(e => ({
                    name: `${e.firstName} ${e.lastName}`,
                    position: e.position,
                    department: e.department,
                    salary: e.salary,
                    status: e.status,
                })),
                invoices: invoices.map((i) => ({
                    number: i.number,
                    client: i.client,
                    amount: i.totalTTC,
                    status: i.status,
                    date: i.date,
                    dueDate: i.dueDate,
                })),
                clients: clients.map((c) => ({
                    name: c.name,
                    email: c.email,
                    phone: c.phone,
                })),
            };
            const response = await fetch(`${this.chatbotUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ question, ...context }),
            });
            const data = await response.json();
            return data.answer || 'Pas de reponse';
        }
        catch (error) {
            this.logger.error('Erreur chatbot:', error);
            return 'Erreur lors de la connexion au chatbot.';
        }
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = ChatbotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cv_schema_1.CV.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(2, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(3, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map