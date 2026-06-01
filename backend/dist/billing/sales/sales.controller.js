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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const module_access_guard_1 = require("../guards/module-access.guard");
const sales_service_1 = require("./sales.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const update_invoice_dto_1 = require("./dto/update-invoice.dto");
const universal_document_parser_service_1 = require("../../document-parser/services/universal-document-parser.service");
const invoice_pdf_service_1 = require("./invoice-pdf.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const client_schema_1 = require("../../clients/schemas/client.schema");
let SalesController = class SalesController {
    constructor(salesService, documentParser, invoicePdfService, tenantModel, clientModel) {
        this.salesService = salesService;
        this.documentParser = documentParser;
        this.invoicePdfService = invoicePdfService;
        this.tenantModel = tenantModel;
        this.clientModel = clientModel;
    }
    create(createInvoiceDto, user) {
        if (!user?.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is missing from user context');
        }
        return this.salesService.createInvoice(createInvoiceDto, user.tenantId);
    }
    findAll(filters, user) {
        return this.salesService.findAllInvoices(user.tenantId, filters);
    }
    findOne(id, user) {
        return this.salesService.findOneInvoice(id, user.tenantId);
    }
    async downloadPdf(id, user, res) {
        const invoice = await this.salesService.findOneInvoice(id, user.tenantId);
        if (!invoice)
            throw new common_1.NotFoundException('Facture introuvable');
        const tenant = await this.tenantModel.findById(user.tenantId).exec();
        if (!tenant)
            throw new common_1.NotFoundException('Société introuvable');
        const client = invoice.clientId
            ? await this.clientModel.findById(invoice.clientId).exec()
            : null;
        const pdf = await this.invoicePdfService.generateSalesInvoicePdf(invoice, tenant, client);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Facture-${invoice.number}.pdf"`);
        res.send(pdf);
    }
    update(id, updateInvoiceDto, user) {
        return this.salesService.updateInvoice(id, updateInvoiceDto, user.tenantId);
    }
    remove(id, user) {
        return this.salesService.removeInvoice(id, user.tenantId);
    }
    validateInvoice(id, user) {
        return this.salesService.changeInvoiceStatus(id, 'validated', user.tenantId);
    }
    markAsPaid(id, user) {
        return this.salesService.changeInvoiceStatus(id, 'paid', user.tenantId);
    }
    cancelInvoice(id, body, user) {
        return this.salesService.cancelInvoice(id, body.reason, user.tenantId);
    }
    archiveInvoice(id, user) {
        return this.salesService.changeInvoiceStatus(id, 'archived', user.tenantId);
    }
    getNextNumber(user) {
        return this.salesService.getNextInvoiceNumber(user.tenantId);
    }
    getDashboard(user) {
        return this.salesService.getDashboard(user.tenantId);
    }
    async parseInvoice(file, user) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        return await this.documentParser.analyze(file, 'INVOICE', user.tenantId);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('invoices/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Patch)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_invoice_dto_1.UpdateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "validateInvoice", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "cancelInvoice", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "archiveInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/next-number'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('invoices/parse'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "parseInvoice", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)('billing/sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, module_access_guard_1.ModuleAccessGuard),
    __param(3, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __param(4, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [sales_service_1.SalesService,
        universal_document_parser_service_1.UniversalDocumentParserService,
        invoice_pdf_service_1.InvoicePdfService,
        mongoose_2.Model,
        mongoose_2.Model])
], SalesController);
//# sourceMappingURL=sales.controller.js.map