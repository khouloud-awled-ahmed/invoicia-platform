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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const expense_schema_1 = require("./schemas/expense.schema");
let PurchasesService = class PurchasesService {
    constructor(expenseModel) {
        this.expenseModel = expenseModel;
    }
    async getDashboard(tenantId) {
        const expenses = await this.expenseModel.find({ tenantId }).exec();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalAll = expenses.reduce((sum, e) => sum + (e.amountTTC || 0), 0);
        const thisMonth = expenses
            .filter(e => new Date(e.date) >= startOfMonth)
            .reduce((sum, e) => sum + (e.amountTTC || 0), 0);
        const pending = expenses.filter(e => e.status === 'pending').length;
        const verified = expenses.filter(e => e.status === 'verified').length;
        const categoryMap = {};
        for (const exp of expenses) {
            categoryMap[exp.category] = (categoryMap[exp.category] || 0) + (exp.amountTTC || 0);
        }
        const top5Categories = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, total]) => ({
            category,
            total: Math.round(total * 1000) / 1000,
        }));
        const recentActivity = [...expenses]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(e => ({
            id: e._id,
            supplier: e.supplier,
            category: e.category,
            amountTTC: e.amountTTC,
            date: e.date,
            status: e.status,
        }));
        return {
            totalFull: Math.round(totalAll * 1000) / 1000,
            totalInvoices: expenses.length,
            thisMonth: Math.round(thisMonth * 1000) / 1000,
            thisMonthCount: expenses.filter(e => new Date(e.date) >= startOfMonth).length,
            pending,
            verified,
            top5Categories,
            recentActivity,
        };
    }
    async createExpense(createDto, tenantId) {
        const expense = new this.expenseModel({
            ...createDto,
            tenantId,
            currency: createDto.currency || 'TND',
            date: new Date(createDto.date),
        });
        return expense.save();
    }
    async findAllExpenses(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.category)
            query.category = filters.category;
        if (filters?.supplier)
            query.supplier = { $regex: filters.supplier, $options: 'i' };
        return this.expenseModel.find(query).sort({ date: -1 }).exec();
    }
    async findOneExpense(id, tenantId) {
        const expense = await this.expenseModel.findOne({ _id: id, tenantId }).exec();
        if (!expense)
            throw new common_1.NotFoundException(`Dépense #${id} introuvable`);
        return expense;
    }
    async updateExpense(id, updateDto, tenantId) {
        const updated = await this.expenseModel
            .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException(`Dépense #${id} introuvable`);
        return updated;
    }
    async removeExpense(id, tenantId) {
        const result = await this.expenseModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result)
            throw new common_1.NotFoundException(`Dépense #${id} introuvable`);
    }
    async changeExpenseStatus(id, status, tenantId, reason) {
        await this.findOneExpense(id, tenantId);
        const updateData = { status };
        if (reason)
            updateData.notes = reason;
        if (status === 'verified')
            updateData.approvedBy = 'system';
        const updated = await this.expenseModel
            .findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
            .exec();
        return updated;
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map