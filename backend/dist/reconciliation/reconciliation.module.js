"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bank_transaction_schema_1 = require("../banking/schemas/bank-transaction.schema");
const invoice_schema_1 = require("../billing/sales/schemas/invoice.schema");
const expense_schema_1 = require("../billing/purchases/schemas/expense.schema");
const accounting_entry_schema_1 = require("../accounting/schemas/accounting-entry.schema");
const reconciliation_service_1 = require("./reconciliation.service");
const reconciliation_controller_1 = require("./reconciliation.controller");
let ReconciliationModule = class ReconciliationModule {
};
exports.ReconciliationModule = ReconciliationModule;
exports.ReconciliationModule = ReconciliationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: bank_transaction_schema_1.BankTransaction.name, schema: bank_transaction_schema_1.BankTransactionSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: expense_schema_1.Expense.name, schema: expense_schema_1.ExpenseSchema },
                { name: accounting_entry_schema_1.AccountingEntry.name, schema: accounting_entry_schema_1.AccountingEntrySchema },
            ]),
        ],
        controllers: [reconciliation_controller_1.ReconciliationController],
        providers: [reconciliation_service_1.ReconciliationService],
        exports: [reconciliation_service_1.ReconciliationService],
    })
], ReconciliationModule);
//# sourceMappingURL=reconciliation.module.js.map