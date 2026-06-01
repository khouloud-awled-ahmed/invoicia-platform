import { FacturationService } from './facturation.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';
export declare class FacturationController {
    private readonly facturationService;
    constructor(facturationService: FacturationService);
    getPendingLines(user: any): Promise<{
        id: string;
        projectName: string;
        consultant: string;
        date: string;
        hours: number;
        rate: number;
        amount: number;
    }[]>;
    getStats(user: any): Promise<{
        totalMonth: any;
        alreadyInvoiced: any;
        month: string;
    }>;
    generateInvoices(dto: GenerateInvoicesDto, user: any): Promise<{
        invoiceCount: number;
    }>;
}
