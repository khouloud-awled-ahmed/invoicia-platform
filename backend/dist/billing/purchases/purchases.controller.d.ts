import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    getDashboard(user: any): Promise<{
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
    createExpense(dto: any, user: any): Promise<import("./schemas/expense.schema").Expense>;
    findAllExpenses(user: any, query: any): Promise<import("./schemas/expense.schema").Expense[]>;
    findOneExpense(id: string, user: any): Promise<import("./schemas/expense.schema").Expense>;
    updateExpense(id: string, dto: any, user: any): Promise<import("./schemas/expense.schema").Expense>;
    removeExpense(id: string, user: any): Promise<void>;
    verifyExpense(id: string, user: any): Promise<import("./schemas/expense.schema").Expense>;
    exportExpense(id: string, user: any): Promise<import("./schemas/expense.schema").Expense>;
    rejectExpense(id: string, body: {
        reason?: string;
    }, user: any): Promise<import("./schemas/expense.schema").Expense>;
}
