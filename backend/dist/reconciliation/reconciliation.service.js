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
exports.ReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bank_transaction_schema_1 = require("../banking/schemas/bank-transaction.schema");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
const expense_schema_1 = require("../billing/purchases/schemas/expense.schema");
const accounting_entry_schema_1 = require("../accounting/schemas/accounting-entry.schema");
const match_reconciliation_dto_1 = require("./dto/match-reconciliation.dto");
let ReconciliationService = class ReconciliationService {
    constructor(bankTransactionModel, invoiceModel, expenseModel, accountingEntryModel) {
        this.bankTransactionModel = bankTransactionModel;
        this.invoiceModel = invoiceModel;
        this.expenseModel = expenseModel;
        this.accountingEntryModel = accountingEntryModel;
    }
    async getOpenItems(tenantId) {
        const [invoices, expenses] = await Promise.all([
            this.invoiceModel
                .find({
                tenantId,
                status: { $in: ['pending', 'validated'] },
            })
                .sort({ dueDate: 1 })
                .lean()
                .exec(),
            this.expenseModel
                .find({ tenantId, status: 'verified' })
                .sort({ date: 1 })
                .lean()
                .exec(),
        ]);
        return {
            invoices: invoices.map((inv) => ({
                id: inv._id.toString(),
                type: 'INVOICE',
                number: inv.number,
                date: inv.date,
                dueDate: inv.dueDate,
                label: `Facture ${inv.number} - ${inv.client || ''}`,
                amount: inv.amountTTC ?? 0,
                currency: 'EUR',
            })),
            expenses: expenses.map((exp) => ({
                id: exp._id.toString(),
                type: 'EXPENSE',
                date: exp.date,
                supplier: exp.supplier,
                category: exp.category,
                amount: exp.amountTTC ?? 0,
                currency: exp.currency ?? 'EUR',
            })),
            payrolls: [],
        };
    }
    async match(tenantId, bankTransactionId, targetId, targetType) {
        const tx = await this.bankTransactionModel.findOne({
            _id: bankTransactionId,
            tenantId,
        }).exec();
        if (!tx) {
            throw new common_1.NotFoundException('Transaction bancaire introuvable');
        }
        if (tx.status === bank_transaction_schema_1.BankTransactionStatus.RECONCILED) {
            throw new common_1.BadRequestException('Cette transaction est déjà rapprochée');
        }
        const amount = Math.abs(Number(tx.amount));
        const date = tx.date instanceof Date ? tx.date : new Date(tx.date);
        const reference = `Rapprochement ${tx.label || tx._id}`;
        if (targetType === match_reconciliation_dto_1.ReconciliationTargetType.INVOICE) {
            const invoice = await this.invoiceModel.findOne({
                _id: targetId,
                tenantId,
            }).exec();
            if (!invoice) {
                throw new common_1.NotFoundException('Facture introuvable');
            }
            await this.invoiceModel
                .updateOne({ _id: targetId, tenantId }, { $set: { status: 'paid' } })
                .exec();
            await this.createBankReconciliationEntries(tenantId, date, reference, amount, '512000', '411000', invoice.number);
        }
        else if (targetType === match_reconciliation_dto_1.ReconciliationTargetType.EXPENSE) {
            const expense = await this.expenseModel.findOne({
                _id: targetId,
                tenantId,
            }).exec();
            if (!expense) {
                throw new common_1.NotFoundException('Dépense introuvable');
            }
            await this.expenseModel
                .updateOne({ _id: targetId, tenantId }, { $set: { status: 'exported' } })
                .exec();
            await this.createBankReconciliationEntries(tenantId, date, reference, amount, '401000', '512000', expense.supplier);
        }
        else if (targetType === match_reconciliation_dto_1.ReconciliationTargetType.PAYROLL || targetType === match_reconciliation_dto_1.ReconciliationTargetType.TAX) {
            await this.createBankReconciliationEntries(tenantId, date, reference, amount, '421000', '512000', `Paie/TVA ${targetId}`);
        }
        else {
            throw new common_1.BadRequestException('Type de cible non géré');
        }
        await this.bankTransactionModel
            .updateOne({ _id: bankTransactionId, tenantId }, {
            $set: {
                status: bank_transaction_schema_1.BankTransactionStatus.RECONCILED,
                reconciledAt: new Date(),
                targetType,
                targetId,
            },
        })
            .exec();
        return { success: true, message: 'Rapprochement enregistré' };
    }
    async createBankReconciliationEntries(tenantId, date, label, amount, debitAccount, creditAccount, reference) {
        const entries = [
            {
                tenantId,
                date,
                account: debitAccount,
                label,
                debit: amount,
                credit: 0,
                journal: 'BQ',
                reference,
                validated: false,
                locked: false,
            },
            {
                tenantId,
                date,
                account: creditAccount,
                label,
                debit: 0,
                credit: amount,
                journal: 'BQ',
                reference,
                validated: false,
                locked: false,
            },
        ];
        await this.accountingEntryModel.insertMany(entries);
    }
};
exports.ReconciliationService = ReconciliationService;
exports.ReconciliationService = ReconciliationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bank_transaction_schema_1.BankTransaction.name)),
    __param(1, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(2, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __param(3, (0, mongoose_1.InjectModel)(accounting_entry_schema_1.AccountingEntry.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReconciliationService);
//# sourceMappingURL=reconciliation.service.js.map