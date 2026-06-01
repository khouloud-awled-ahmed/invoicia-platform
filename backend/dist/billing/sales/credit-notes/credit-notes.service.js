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
exports.CreditNotesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const credit_note_schema_1 = require("../../../credit-notes/schemas/credit-note.schema");
let CreditNotesService = class CreditNotesService {
    constructor(creditNoteModel) {
        this.creditNoteModel = creditNoteModel;
    }
    calculateTotals(items) {
        const amountHT = items.reduce((sum, item) => {
            const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
            return sum + lineTotal;
        }, 0);
        const amountTVA = items.reduce((sum, item) => {
            const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
            return sum + (lineTotal * (item.vatRate || 19) / 100);
        }, 0);
        return {
            amountHT: Math.round(amountHT * 1000) / 1000,
            amountTVA: Math.round(amountTVA * 1000) / 1000,
            amountTTC: Math.round((amountHT + amountTVA) * 1000) / 1000,
        };
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const prefix = `AV-${year}-`;
        const all = await this.creditNoteModel
            .find({ tenantId, number: { $regex: `^${prefix}` } })
            .select('number')
            .exec();
        let max = 0;
        for (const doc of all) {
            const parts = doc.number.split('-');
            const num = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(num) && num > max)
                max = num;
        }
        let next = max + 1;
        let candidate = `${prefix}${String(next).padStart(4, '0')}`;
        while (await this.creditNoteModel.findOne({ tenantId, number: candidate }).exec()) {
            next++;
            candidate = `${prefix}${String(next).padStart(4, '0')}`;
        }
        return candidate;
    }
    async getNextNumber(tenantId) {
        const number = await this.generateNumber(tenantId);
        return { number };
    }
    async create(createDto, tenantId) {
        const number = createDto.number || await this.generateNumber(tenantId);
        let totals = {};
        if (createDto.items && createDto.items.length > 0) {
            totals = this.calculateTotals(createDto.items);
        }
        else if (createDto.amountHT !== undefined) {
            const amountHT = parseFloat(createDto.amountHT) || 0;
            const tvaRate = parseFloat(createDto.tvaRate) || 19;
            const amountTVA = Math.round(amountHT * (tvaRate / 100) * 1000) / 1000;
            const amountTTC = Math.round((amountHT + amountTVA) * 1000) / 1000;
            totals = { amountHT, amountTVA, amountTTC };
        }
        const creditNote = new this.creditNoteModel({
            ...createDto,
            number,
            tenantId,
            currency: createDto.currency || 'TND',
            date: new Date(createDto.date),
            ...totals,
        });
        return creditNote.save();
    }
    async findAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.clientId)
            query.clientId = filters.clientId;
        if (filters?.relatedInvoiceId)
            query.relatedInvoiceId = filters.relatedInvoiceId;
        return this.creditNoteModel.find(query).sort({ date: -1 }).exec();
    }
    async findOne(id, tenantId) {
        const creditNote = await this.creditNoteModel.findOne({ _id: id, tenantId }).exec();
        if (!creditNote) {
            throw new common_1.NotFoundException(`Avoir #${id} introuvable`);
        }
        return creditNote;
    }
    async update(id, updateDto, tenantId) {
        if (updateDto.items && updateDto.items.length > 0) {
            const totals = this.calculateTotals(updateDto.items);
            updateDto = { ...updateDto, ...totals };
        }
        else if (updateDto.amountHT !== undefined) {
            const amountHT = parseFloat(updateDto.amountHT) || 0;
            const tvaRate = parseFloat(updateDto.tvaRate) || 19;
            const amountTVA = Math.round(amountHT * (tvaRate / 100) * 1000) / 1000;
            const amountTTC = Math.round((amountHT + amountTVA) * 1000) / 1000;
            updateDto = { ...updateDto, amountHT, amountTVA, amountTTC };
        }
        const updated = await this.creditNoteModel
            .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Avoir #${id} introuvable`);
        }
        return updated;
    }
    async remove(id, tenantId) {
        const result = await this.creditNoteModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Avoir #${id} introuvable`);
        }
    }
    async validate(id, tenantId) {
        const creditNote = await this.findOne(id, tenantId);
        if (creditNote.status !== 'draft') {
            throw new common_1.BadRequestException('Seuls les avoirs en brouillon peuvent être validés');
        }
        const updated = await this.creditNoteModel
            .findOneAndUpdate({ _id: id, tenantId }, { status: 'validated' }, { new: true })
            .exec();
        return updated;
    }
    async archive(id, tenantId) {
        const creditNote = await this.findOne(id, tenantId);
        if (creditNote.status === 'archived') {
            throw new common_1.BadRequestException('Cet avoir est déjà archivé');
        }
        const updated = await this.creditNoteModel
            .findOneAndUpdate({ _id: id, tenantId }, { status: 'archived' }, { new: true })
            .exec();
        return updated;
    }
    async getDashboard(tenantId) {
        const creditNotes = await this.creditNoteModel.find({ tenantId }).exec();
        const total = creditNotes.reduce((sum, cn) => sum + (cn.amountTTC || 0), 0);
        const statuses = ['draft', 'pending', 'validated', 'archived'];
        const distribution = statuses.map(status => ({
            status,
            count: creditNotes.filter(cn => cn.status === status).length,
            total: creditNotes
                .filter(cn => cn.status === status)
                .reduce((sum, cn) => sum + (cn.amountTTC || 0), 0),
        }));
        return {
            total: Math.round(total * 1000) / 1000,
            count: creditNotes.length,
            statusDistribution: distribution,
        };
    }
};
exports.CreditNotesService = CreditNotesService;
exports.CreditNotesService = CreditNotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(credit_note_schema_1.CreditNote.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CreditNotesService);
//# sourceMappingURL=credit-notes.service.js.map