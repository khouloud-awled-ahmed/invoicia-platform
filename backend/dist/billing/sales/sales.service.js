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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("./schemas/invoice.schema");
const client_schema_1 = require("../../clients/schemas/client.schema");
const project_schema_1 = require("../../projects/schemas/project.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
let SalesService = class SalesService {
    constructor(invoiceModel, clientModel, projectModel, tenantModel) {
        this.invoiceModel = invoiceModel;
        this.clientModel = clientModel;
        this.projectModel = projectModel;
        this.tenantModel = tenantModel;
    }
    calculateInvoiceAmounts(items) {
        let amountHT = 0;
        let amountTVA = 0;
        for (const item of items) {
            const quantity = item.quantity || 1;
            const unitPrice = item.unitPrice || 0;
            const discount = item.discount || 0;
            const vatRate = item.vatRate ?? 19;
            const itemHT = quantity * unitPrice * (1 - discount / 100);
            amountHT += itemHT;
            amountTVA += itemHT * (vatRate / 100);
        }
        const amountTTC = amountHT + amountTVA;
        return {
            amountHT: Math.round(amountHT * 1000) / 1000,
            amountTVA: Math.round(amountTVA * 1000) / 1000,
            amountTTC: Math.round(amountTTC * 1000) / 1000,
        };
    }
    async getDashboard(tenantId) {
        const invoices = await this.invoiceModel.find({ tenantId }).exec();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalCA = invoices
            .filter((i) => !['cancelled', 'archived'].includes(i.status))
            .reduce((sum, i) => sum + (i.amountTTC || 0), 0);
        const thisMonth = invoices
            .filter((i) => new Date(i.date) >= startOfMonth && !['cancelled', 'archived'].includes(i.status))
            .reduce((sum, i) => sum + (i.amountTTC || 0), 0);
        const pending = invoices.filter((i) => i.status === 'pending').length;
        const validated = invoices.filter((i) => i.status === 'validated').length;
        const clientMap = {};
        for (const inv of invoices) {
            if (!['cancelled', 'archived'].includes(inv.status)) {
                clientMap[inv.client] = (clientMap[inv.client] || 0) + (inv.amountTTC || 0);
            }
        }
        const top5Clients = Object.entries(clientMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([client, total]) => ({
            client,
            total: Math.round(total * 1000) / 1000,
            percentage: totalCA > 0 ? Math.round((total / totalCA) * 1000) / 10 : 0,
        }));
        const statuses = ['draft', 'pending', 'validated', 'paid', 'cancelled', 'archived'];
        const statusDistribution = statuses.map((status) => ({
            status,
            count: invoices.filter((i) => i.status === status).length,
            total: invoices
                .filter((i) => i.status === status)
                .reduce((sum, i) => sum + (i.amountTTC || 0), 0),
        }));
        return {
            totalCA: Math.round(totalCA * 1000) / 1000,
            totalInvoices: invoices.length,
            thisMonth: Math.round(thisMonth * 1000) / 1000,
            thisMonthCount: invoices.filter((i) => new Date(i.date) >= startOfMonth).length,
            pending,
            validated,
            top5Clients,
            statusDistribution,
        };
    }
    async getNextInvoiceNumber(tenantId) {
        const year = new Date().getFullYear();
        const prefix = `FA-${year}-`;
        const last = await this.invoiceModel
            .findOne({ tenantId, number: { $regex: `^${prefix}` } })
            .sort({ number: -1 })
            .exec();
        let next = 1;
        if (last) {
            const parts = last.number.split('-');
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum))
                next = lastNum + 1;
        }
        return { number: `${prefix}${String(next).padStart(4, '0')}` };
    }
    async createInvoice(createInvoiceDto, tenantId) {
        if (!tenantId)
            throw new common_1.BadRequestException('Tenant ID is required');
        const existingInvoice = await this.invoiceModel
            .findOne({ tenantId, number: createInvoiceDto.number })
            .exec();
        if (existingInvoice) {
            throw new common_1.BadRequestException(`Une facture avec le numéro ${createInvoiceDto.number} existe déjà`);
        }
        const statusMap = {
            Brouillon: 'draft',
            'En attente': 'pending',
            Validée: 'validated',
            Payée: 'paid',
            Annulée: 'cancelled',
            Archivée: 'archived',
        };
        if (createInvoiceDto.status && statusMap[createInvoiceDto.status]) {
            createInvoiceDto.status = statusMap[createInvoiceDto.status];
        }
        const normalizedItems = createInvoiceDto.items.map((item) => ({
            ...item,
            article: item.article || item.description || 'Article',
            description: item.description || item.article || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            discount: item.discount || 0,
            vatRate: item.vatRate ?? 19,
        }));
        const { amountHT, amountTVA, amountTTC } = this.calculateInvoiceAmounts(normalizedItems);
        const timbreFiscal = createInvoiceDto.timbreFiscal || 0;
        const withholdingAmount = createInvoiceDto.withholdingAmount || 0;
        const netAPayer = Math.round((amountTTC + timbreFiscal - withholdingAmount) * 1000) / 1000;
        const newInvoice = new this.invoiceModel({
            ...createInvoiceDto,
            items: normalizedItems,
            tenantId,
            amountHT,
            amountTVA,
            amountTTC,
            timbreFiscal,
            withholdingAmount,
            netAPayer,
            currency: createInvoiceDto.currency || 'TND',
            date: typeof createInvoiceDto.date === 'string'
                ? new Date(createInvoiceDto.date)
                : createInvoiceDto.date,
            dueDate: typeof createInvoiceDto.dueDate === 'string'
                ? new Date(createInvoiceDto.dueDate)
                : createInvoiceDto.dueDate,
        });
        try {
            return await newInvoice.save();
        }
        catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern || {})[0];
                throw new common_1.BadRequestException(`Une facture avec ce ${field} existe déjà`);
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors || {})
                    .map((e) => e.message)
                    .join(', ');
                throw new common_1.BadRequestException(`Erreur de validation: ${messages}`);
            }
            throw error;
        }
    }
    async findAllInvoices(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.clientId)
            query.clientId = filters.clientId;
        return this.invoiceModel.find(query).sort({ date: -1 }).exec();
    }
    async findOneInvoice(id, tenantId) {
        const invoice = await this.invoiceModel.findOne({ _id: id, tenantId }).exec();
        if (!invoice)
            throw new common_1.NotFoundException(`Facture #${id} introuvable`);
        return invoice;
    }
    async updateInvoice(id, updateInvoiceDto, tenantId) {
        let extra = {};
        if (updateInvoiceDto.items) {
            const normalizedItems = updateInvoiceDto.items.map((item) => ({
                ...item,
                article: item.article || item.description || 'Article',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                discount: item.discount || 0,
                vatRate: item.vatRate ?? 19,
            }));
            const { amountHT, amountTVA, amountTTC } = this.calculateInvoiceAmounts(normalizedItems);
            const timbreFiscal = updateInvoiceDto.timbreFiscal || 0;
            const withholdingAmount = updateInvoiceDto.withholdingAmount || 0;
            extra = {
                items: normalizedItems,
                amountHT,
                amountTVA,
                amountTTC,
                netAPayer: Math.round((amountTTC + timbreFiscal - withholdingAmount) * 1000) / 1000,
            };
        }
        const updatedInvoice = await this.invoiceModel
            .findOneAndUpdate({ _id: id, tenantId }, { ...updateInvoiceDto, ...extra }, { new: true })
            .exec();
        if (!updatedInvoice)
            throw new common_1.NotFoundException(`Facture #${id} introuvable`);
        return updatedInvoice;
    }
    async removeInvoice(id, tenantId) {
        const deletedInvoice = await this.invoiceModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!deletedInvoice)
            throw new common_1.NotFoundException(`Facture #${id} introuvable`);
        return deletedInvoice;
    }
    async changeInvoiceStatus(id, status, tenantId) {
        const invoice = await this.findOneInvoice(id, tenantId);
        const allowed = {
            draft: ['pending', 'validated', 'cancelled'],
            pending: ['validated', 'cancelled', 'draft'],
            validated: ['paid', 'cancelled', 'archived'],
            paid: ['archived'],
            cancelled: [],
            archived: [],
        };
        if (!allowed[invoice.status]?.includes(status)) {
            throw new common_1.BadRequestException(`Transition "${invoice.status}" → "${status}" non autorisée`);
        }
        const updated = await this.invoiceModel
            .findOneAndUpdate({ _id: id, tenantId }, { status }, { new: true })
            .exec();
        return updated;
    }
    async cancelInvoice(id, reason, tenantId) {
        const invoice = await this.findOneInvoice(id, tenantId);
        if (['cancelled', 'archived'].includes(invoice.status)) {
            throw new common_1.BadRequestException('Cette facture est déjà annulée ou archivée');
        }
        const updated = await this.invoiceModel
            .findOneAndUpdate({ _id: id, tenantId }, { status: 'cancelled', cancellationReason: reason, cancelledAt: new Date() }, { new: true })
            .exec();
        return updated;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __param(2, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(3, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SalesService);
//# sourceMappingURL=sales.service.js.map