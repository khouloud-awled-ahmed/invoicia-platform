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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("../employees/schemas/employee.schema");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
const expense_schema_1 = require("../billing/purchases/schemas/expense.schema");
const bank_account_schema_1 = require("../banking/schemas/bank-account.schema");
let DashboardService = class DashboardService {
    constructor(employeeModel, invoiceModel, expenseModel, bankAccountModel) {
        this.employeeModel = employeeModel;
        this.invoiceModel = invoiceModel;
        this.expenseModel = expenseModel;
        this.bankAccountModel = bankAccountModel;
    }
    getDateFilter(months) {
        if (!months || months === 0)
            return null;
        const d = new Date();
        d.setMonth(d.getMonth() - months);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    async getSummary(tenantId, months = 0) {
        const dateFilter = this.getDateFilter(months);
        const dateQuery = dateFilter ? { $gte: dateFilter } : undefined;
        const employeesCount = await this.employeeModel.countDocuments({ tenantId }).exec();
        const paidQuery = { tenantId, status: 'paid' };
        if (dateQuery)
            paidQuery.createdAt = dateQuery;
        const paidInvoices = await this.invoiceModel.find(paidQuery).exec();
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amountTTC || 0), 0);
        const pendingQuery = { tenantId, status: { $in: ['pending', 'validated'] } };
        if (dateQuery)
            pendingQuery.createdAt = dateQuery;
        const pendingInvoices = await this.invoiceModel.countDocuments(pendingQuery).exec();
        const bankAccounts = await this.bankAccountModel.find({ tenantId }).exec();
        const treasuryBalance = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        const expQuery = { tenantId };
        if (dateQuery)
            expQuery.createdAt = dateQuery;
        const expenses = await this.expenseModel.find(expQuery).exec();
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountTTC || 0), 0);
        return {
            employees: employeesCount,
            totalRevenue,
            pendingInvoices,
            treasuryBalance,
            expenses: totalExpenses,
        };
    }
    async getRevenueByMonth(tenantId, months = 12) {
        const actualMonths = months === 0 ? 12 : months;
        const dateFrom = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - (actualMonths - 1));
        dateFrom.setDate(1);
        dateFrom.setHours(0, 0, 0, 0);
        const invoices = await this.invoiceModel
            .find({
            tenantId,
            status: 'paid',
            createdAt: { $gte: dateFrom },
        })
            .exec();
        const monthsMap = {};
        for (let i = 0; i < actualMonths; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (actualMonths - 1 - i));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthsMap[key] = 0;
        }
        invoices.forEach((inv) => {
            const d = new Date(inv.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthsMap[key] !== undefined)
                monthsMap[key] += inv.amountTTC || 0;
        });
        return Object.entries(monthsMap).map(([month, revenue]) => ({ month, revenue }));
    }
    async getTopClients(tenantId, months = 0) {
        const dateFilter = this.getDateFilter(months);
        const query = { tenantId, status: 'paid' };
        if (dateFilter)
            query.createdAt = { $gte: dateFilter };
        const invoices = await this.invoiceModel.find(query).exec();
        const clientMap = {};
        invoices.forEach((inv) => {
            const clientId = inv.clientId?.toString() || 'unknown';
            const clientName = inv.clientName || 'Client inconnu';
            if (!clientMap[clientId])
                clientMap[clientId] = { name: clientName, total: 0, count: 0 };
            clientMap[clientId].total += inv.amountTTC || 0;
            clientMap[clientId].count += 1;
        });
        return Object.values(clientMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }
    async getInvoiceStats(tenantId, months = 0) {
        const dateFilter = this.getDateFilter(months);
        const query = { tenantId };
        if (dateFilter)
            query.createdAt = { $gte: dateFilter };
        const all = await this.invoiceModel.find(query).exec();
        const paid = all.filter((i) => i.status === 'paid').length;
        const pending = all.filter((i) => ['pending', 'validated'].includes(i.status)).length;
        const overdue = all.filter((i) => i.status === 'overdue').length;
        const draft = all.filter((i) => i.status === 'draft').length;
        const paymentRate = all.length > 0 ? Math.round((paid / all.length) * 100) : 0;
        const totalRevenue = all
            .filter((i) => i.status === 'paid')
            .reduce((s, i) => s + (i.amountTTC || 0), 0);
        const pendingRevenue = all
            .filter((i) => ['pending', 'validated'].includes(i.status))
            .reduce((s, i) => s + (i.amountTTC || 0), 0);
        return {
            total: all.length,
            paid,
            pending,
            overdue,
            draft,
            paymentRate,
            totalRevenue,
            pendingRevenue,
        };
    }
    async getExpensesByCategory(tenantId, months = 0) {
        const dateFilter = this.getDateFilter(months);
        const query = { tenantId };
        if (dateFilter)
            query.createdAt = { $gte: dateFilter };
        const expenses = await this.expenseModel.find(query).exec();
        const catMap = {};
        expenses.forEach((exp) => {
            const cat = exp.category || 'Autre';
            catMap[cat] = (catMap[cat] || 0) + (exp.amountTTC || 0);
        });
        return Object.entries(catMap)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);
    }
    async getCashFlow(tenantId, months = 6) {
        const actualMonths = months === 0 ? 6 : Math.min(months, 12);
        const monthsList = [];
        for (let i = actualMonths - 1; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthsList.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        const dateFrom = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - (actualMonths - 1));
        dateFrom.setDate(1);
        const invoices = await this.invoiceModel
            .find({ tenantId, status: 'paid', createdAt: { $gte: dateFrom } })
            .exec();
        const expenses = await this.expenseModel
            .find({ tenantId, createdAt: { $gte: dateFrom } })
            .exec();
        return monthsList.map((month) => {
            const income = invoices
                .filter((inv) => {
                const d = new Date(inv.createdAt);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month;
            })
                .reduce((s, i) => s + (i.amountTTC || 0), 0);
            const expense = expenses
                .filter((exp) => {
                const d = new Date(exp.createdAt);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month;
            })
                .reduce((s, e) => s + (e.amountTTC || 0), 0);
            return { month, income, expense, net: income - expense };
        });
    }
    async getAIInsights(tenantId, months = 0) {
        const [invStats, expenses, clients, cashFlow] = await Promise.all([
            this.getInvoiceStats(tenantId, months),
            this.getExpensesByCategory(tenantId, months),
            this.getTopClients(tenantId, months),
            this.getCashFlow(tenantId, months),
        ]);
        const totalExp = expenses.reduce((s, e) => s + e.total, 0);
        const fallback = [];
        if (invStats.overdue > 0)
            fallback.push({
                type: 'danger',
                title: 'Factures en retard',
                message: `${invStats.overdue} facture(s) impayee(s) - relancez vos clients`,
                action: 'Voir factures',
            });
        if (invStats.totalRevenue < totalExp)
            fallback.push({
                type: 'warning',
                title: 'Tresorerie negative',
                message: `Depenses (${totalExp.toLocaleString()} DT) superieures aux revenus (${invStats.totalRevenue.toLocaleString()} DT)`,
                action: 'Reduire couts',
            });
        if (invStats.paymentRate < 50 && invStats.total > 0)
            fallback.push({
                type: 'warning',
                title: 'Taux de paiement faible',
                message: `Seulement ${invStats.paymentRate}% de vos factures sont payees`,
                action: 'Relancer clients',
            });
        if (clients.length > 0)
            fallback.push({
                type: 'info',
                title: 'Meilleur client',
                message: `${clients[0].name} genere ${clients[0].total.toLocaleString()} DT de revenus`,
                action: 'Voir client',
            });
        if (invStats.pending > 0)
            fallback.push({
                type: 'info',
                title: 'Revenus en attente',
                message: `${invStats.pendingRevenue.toLocaleString()} DT en attente sur ${invStats.pending} facture(s)`,
                action: 'Suivre',
            });
        if (fallback.length === 0)
            fallback.push({
                type: 'success',
                title: 'Bonne sante financiere',
                message: 'Aucun probleme detecte - continuez sur cette lancee!',
                action: 'Voir rapport',
            });
        return fallback;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(2, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __param(3, (0, mongoose_1.InjectModel)(bank_account_schema_1.BankAccount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map