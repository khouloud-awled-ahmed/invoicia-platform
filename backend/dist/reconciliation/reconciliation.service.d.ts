import { Model } from 'mongoose';
import { BankTransactionDocument } from '../banking/schemas/bank-transaction.schema';
import { InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { ExpenseDocument } from '../billing/purchases/schemas/expense.schema';
import { AccountingEntryDocument } from '../accounting/schemas/accounting-entry.schema';
import { ReconciliationTargetType } from './dto/match-reconciliation.dto';
export interface OpenItemInvoice {
    id: string;
    type: 'INVOICE';
    number: string;
    date: Date;
    dueDate: Date;
    label: string;
    amount: number;
    currency?: string;
}
export interface OpenItemExpense {
    id: string;
    type: 'EXPENSE';
    date: Date;
    supplier: string;
    category: string;
    amount: number;
    currency: string;
}
export interface OpenItemPayroll {
    id: string;
    type: 'PAYROLL';
    label: string;
    amount: number;
    date?: Date;
}
export type OpenItem = OpenItemInvoice | OpenItemExpense | OpenItemPayroll;
export interface OpenItemsResponse {
    invoices: OpenItemInvoice[];
    expenses: OpenItemExpense[];
    payrolls: OpenItemPayroll[];
}
export declare class ReconciliationService {
    private bankTransactionModel;
    private invoiceModel;
    private expenseModel;
    private accountingEntryModel;
    constructor(bankTransactionModel: Model<BankTransactionDocument>, invoiceModel: Model<InvoiceDocument>, expenseModel: Model<ExpenseDocument>, accountingEntryModel: Model<AccountingEntryDocument>);
    getOpenItems(tenantId: string): Promise<OpenItemsResponse>;
    match(tenantId: string, bankTransactionId: string, targetId: string, targetType: ReconciliationTargetType): Promise<{
        success: boolean;
        message: string;
    }>;
    private createBankReconciliationEntries;
}
