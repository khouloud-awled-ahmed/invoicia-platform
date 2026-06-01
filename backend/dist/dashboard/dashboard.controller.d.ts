import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(user: any, months?: string): Promise<{
        employees: number;
        totalRevenue: number;
        pendingInvoices: number;
        treasuryBalance: number;
        expenses: number;
    }>;
    getRevenueByMonth(user: any, months?: string): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getTopClients(user: any, months?: string): Promise<{
        name: string;
        total: number;
        count: number;
    }[]>;
    getInvoiceStats(user: any, months?: string): Promise<{}>;
    getExpensesByCategory(user: any, months?: string): Promise<{
        category: string;
        total: number;
    }[]>;
    getCashFlow(user: any, months?: string): Promise<{
        month: string;
        income: number;
        expense: number;
        net: number;
    }[]>;
    getAIInsights(user: any, months?: string): Promise<any[]>;
}
