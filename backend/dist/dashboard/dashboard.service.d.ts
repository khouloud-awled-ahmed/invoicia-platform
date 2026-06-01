import { Model } from 'mongoose';
import { EmployeeDocument } from '../employees/schemas/employee.schema';
import { InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { ExpenseDocument } from '../billing/purchases/schemas/expense.schema';
import { BankAccountDocument } from '../banking/schemas/bank-account.schema';
export declare class DashboardService {
    private employeeModel;
    private invoiceModel;
    private expenseModel;
    private bankAccountModel;
    constructor(employeeModel: Model<EmployeeDocument>, invoiceModel: Model<InvoiceDocument>, expenseModel: Model<ExpenseDocument>, bankAccountModel: Model<BankAccountDocument>);
    private getDateFilter;
    getSummary(tenantId: string, months?: number): Promise<{
        employees: number;
        totalRevenue: number;
        pendingInvoices: number;
        treasuryBalance: number;
        expenses: number;
    }>;
    getRevenueByMonth(tenantId: string, months?: number): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getTopClients(tenantId: string, months?: number): Promise<{
        name: string;
        total: number;
        count: number;
    }[]>;
    getInvoiceStats(tenantId: string, months?: number): Promise<{
        total: number;
        paid: number;
        pending: number;
        overdue: number;
        draft: number;
        paymentRate: number;
        totalRevenue: number;
        pendingRevenue: number;
    }>;
    getExpensesByCategory(tenantId: string, months?: number): Promise<{
        category: string;
        total: number;
    }[]>;
    getCashFlow(tenantId: string, months?: number): Promise<{
        month: string;
        income: number;
        expense: number;
        net: number;
    }[]>;
    getAIInsights(tenantId: string, months?: number): Promise<any[]>;
}
