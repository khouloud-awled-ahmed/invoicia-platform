import { StructuredFormatsService } from './structured-formats.service';
export declare class StructuredFormatsController {
    private readonly structuredFormatsService;
    constructor(structuredFormatsService: StructuredFormatsService);
    generateInvoice(invoiceId: string, format: 'UBL' | 'CII' | 'Factur-X', user: any): Promise<any>;
    validateInvoice(invoiceId: string, user: any): Promise<any>;
}
