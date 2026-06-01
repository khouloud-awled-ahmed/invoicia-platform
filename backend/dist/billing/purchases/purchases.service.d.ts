import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
export declare class PurchasesService {
    private expenseModel;
    constructor(expenseModel: Model<ExpenseDocument>);
    getDashboard(tenantId: string): Promise<{
        totalFull: number;
        totalInvoices: number;
        thisMonth: number;
        thisMonthCount: number;
        pending: number;
        verified: number;
        top5Categories: {
            category: string;
            total: number;
        }[];
        recentActivity: {
            id: any;
            supplier: string;
            category: string;
            amountTTC: number;
            date: Date;
            status: string;
        }[];
    }>;
    createExpense(createDto: any, tenantId: string): Promise<Expense>;
    findAllExpenses(tenantId: string, filters?: any): Promise<Expense[]>;
    findOneExpense(id: string, tenantId: string): Promise<Expense>;
    updateExpense(id: string, updateDto: any, tenantId: string): Promise<Expense>;
    removeExpense(id: string, tenantId: string): Promise<void>;
    changeExpenseStatus(id: string, status: string, tenantId: string, reason?: string): Promise<Expense>;
}
