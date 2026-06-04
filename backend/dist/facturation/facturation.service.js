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
exports.FacturationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cra_schema_1 = require("./schemas/cra.schema");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
let FacturationService = class FacturationService {
    constructor(craModel, invoiceModel) {
        this.craModel = craModel;
        this.invoiceModel = invoiceModel;
    }
    async getPendingLines(tenantId) {
        const lines = await this.craModel
            .find({ tenantId, status: 'VALIDATED' })
            .sort({ date: -1 })
            .exec();
        return lines.map((l) => ({
            id: l._id.toString(),
            projectName: l.projectName,
            consultant: l.intervenantName,
            date: new Date(l.date).toLocaleDateString('fr-FR'),
            hours: l.hours,
            rate: l.rate,
            amount: l.amount,
        }));
    }
    async getStats(tenantId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const pending = await this.craModel.aggregate([
            { $match: { tenantId, status: 'VALIDATED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const invoiced = await this.craModel.aggregate([
            {
                $match: {
                    tenantId,
                    status: 'INVOICED',
                    updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalPending = pending[0]?.total ?? 0;
        const totalInvoiced = invoiced[0]?.total ?? 0;
        return {
            totalMonth: totalPending + totalInvoiced,
            alreadyInvoiced: totalInvoiced,
            month: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        };
    }
    async generateInvoices(craLineIds, tenantId) {
        const lines = await this.craModel
            .find({ _id: { $in: craLineIds }, tenantId, status: 'VALIDATED' })
            .exec();
        if (lines.length !== craLineIds.length)
            throw new common_1.NotFoundException('One or more CRA lines not found');
        const byProject = {};
        for (const line of lines) {
            const key = line.projectName;
            if (!byProject[key])
                byProject[key] = [];
            byProject[key].push(line);
        }
        const year = new Date().getFullYear();
        const prefix = `FA-${year}-`;
        const last = await this.invoiceModel
            .findOne({ tenantId, number: { $regex: `^${prefix}` } })
            .sort({ number: -1 })
            .exec();
        let nextNum = 1;
        if (last) {
            const parts = last.number.split('-');
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum))
                nextNum = lastNum + 1;
        }
        const createdInvoices = [];
        for (const [projectName, projectLines] of Object.entries(byProject)) {
            const items = projectLines.map((l) => ({
                article: `CRA - ${l.intervenantName}`,
                description: `${l.hours}h x ${l.rate}€/h - ${new Date(l.date).toLocaleDateString('fr-FR')}`,
                quantity: l.hours,
                unitPrice: l.rate,
                discount: 0,
                vatRate: 19,
            }));
            const amountHT = projectLines.reduce((s, l) => s + l.amount, 0);
            const amountTVA = Math.round(amountHT * 0.19 * 1000) / 1000;
            const amountTTC = Math.round((amountHT + amountTVA) * 1000) / 1000;
            const number = `${prefix}${String(nextNum).padStart(4, '0')}`;
            nextNum++;
            const now = new Date();
            const dueDate = new Date(now);
            dueDate.setDate(dueDate.getDate() + 30);
            const invoice = await this.invoiceModel.create({
                number,
                date: now,
                dueDate,
                clientId: tenantId,
                client: projectName,
                tenantId,
                items,
                amountHT,
                amountTVA,
                amountTTC,
                netAPayer: amountTTC,
                status: 'pending',
                currency: 'TND',
            });
            createdInvoices.push(invoice);
        }
        await this.craModel.updateMany({ _id: { $in: craLineIds }, tenantId }, { $set: { status: 'INVOICED' } });
        return { invoiceCount: createdInvoices.length };
    }
};
exports.FacturationService = FacturationService;
exports.FacturationService = FacturationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cra_schema_1.Cra.name)),
    __param(1, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], FacturationService);
//# sourceMappingURL=facturation.service.js.map