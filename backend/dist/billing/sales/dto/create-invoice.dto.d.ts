export declare class InvoiceItemDto {
    article?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    vatRate?: number;
}
export declare class CreateInvoiceDto {
    id?: string;
    number: string;
    date: string;
    dueDate: string;
    clientId: string;
    client: string;
    clientAddress?: string;
    clientEmail?: string;
    orderNumber?: string;
    engagementId?: string;
    items: InvoiceItemDto[];
    timbreFiscal?: number;
    withholdingAmount?: number;
    currency?: string;
    deposit?: number;
    paymentTerms?: string;
    notes?: string;
    status?: string;
    tags?: string[];
    projectIds?: string[];
    linkedCreditNoteId?: string;
    linkedCreditNoteNumber?: string;
    replacedInvoiceId?: string;
    replacedInvoiceNumber?: string;
}
