import { InvoiceItemDto } from './create-invoice.dto';
export declare class UpdateInvoiceDto {
    number?: string;
    date?: string;
    dueDate?: string;
    clientId?: string;
    client?: string;
    clientAddress?: string;
    clientEmail?: string;
    orderNumber?: string;
    engagementId?: string;
    items?: InvoiceItemDto[];
    timbreFiscal?: number;
    withholdingAmount?: number;
    currency?: string;
    deposit?: number;
    paymentTerms?: string;
    notes?: string;
    status?: string;
    tags?: string[];
    cancellationReason?: string;
    cancelledAt?: string;
}
