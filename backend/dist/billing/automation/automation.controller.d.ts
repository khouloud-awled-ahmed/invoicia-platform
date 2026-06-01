import { AutomationService } from './automation.service';
export declare class AutomationController {
    private readonly automationService;
    constructor(automationService: AutomationService);
    getInvoiceableEntries(filters: any, user: any): Promise<{
        entries: any[];
        total: number;
    }>;
    generateInvoices(options: any, user: any): Promise<{
        message: string;
        invoices: any[];
    }>;
    generateFromCRA(options: any, user: any): Promise<{
        message: string;
        invoices: any[];
    }>;
}
