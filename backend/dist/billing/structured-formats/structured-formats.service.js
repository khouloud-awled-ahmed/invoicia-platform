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
exports.StructuredFormatsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("../sales/schemas/invoice.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const ubl_generator_service_1 = require("./generators/ubl-generator.service");
const cii_generator_service_1 = require("./generators/cii-generator.service");
const factur_x_generator_service_1 = require("./generators/factur-x-generator.service");
let StructuredFormatsService = class StructuredFormatsService {
    constructor(invoiceModel, tenantModel, ublGenerator, ciiGenerator, facturXGenerator) {
        this.invoiceModel = invoiceModel;
        this.tenantModel = tenantModel;
        this.ublGenerator = ublGenerator;
        this.ciiGenerator = ciiGenerator;
        this.facturXGenerator = facturXGenerator;
    }
    async isEnabled(tenantId) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        return tenant?.features?.includes('structured-formats') || false;
    }
    async generateInvoice(invoiceId, format, tenantId) {
        const isEnabled = await this.isEnabled(tenantId);
        if (!isEnabled) {
            throw new common_1.ForbiddenException('Structured formats are not enabled for this tenant');
        }
        const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        switch (format) {
            case 'UBL':
                return this.ublGenerator.generate(invoice, tenant);
            case 'CII':
                return this.ciiGenerator.generate(invoice, tenant);
            case 'Factur-X':
                return this.facturXGenerator.generate(invoice, tenant);
            default:
                throw new common_1.NotFoundException(`Format ${format} is not supported`);
        }
    }
    async validateInvoice(invoiceId, tenantId) {
        const isEnabled = await this.isEnabled(tenantId);
        if (!isEnabled) {
            throw new common_1.ForbiddenException('Structured formats are not enabled for this tenant');
        }
        const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        const errors = [];
        if (!invoice.number)
            errors.push('Invoice number is required');
        if (!invoice.date)
            errors.push('Invoice date is required');
        if (!invoice.clientId)
            errors.push('Client is required');
        if (!invoice.items || invoice.items.length === 0) {
            errors.push('At least one item is required');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.StructuredFormatsService = StructuredFormatsService;
exports.StructuredFormatsService = StructuredFormatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        ubl_generator_service_1.UBLGeneratorService,
        cii_generator_service_1.CIIGeneratorService,
        factur_x_generator_service_1.FacturXGeneratorService])
], StructuredFormatsService);
//# sourceMappingURL=structured-formats.service.js.map