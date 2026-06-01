import { PlatformAgreementService } from './platform-agreement.service';
export declare class PlatformAgreementController {
    private readonly platformAgreementService;
    constructor(platformAgreementService: PlatformAgreementService);
    getStatus(user: any): Promise<any>;
    transmitInvoice(invoiceId: string, options: {
        format?: 'UBL' | 'CII' | 'Factur-X';
        platform?: string;
    }, user: any): Promise<any>;
    getInvoiceTransmissionStatus(invoiceId: string, user: any): Promise<any>;
    getAvailablePlatforms(user: any): Promise<any[]>;
}
