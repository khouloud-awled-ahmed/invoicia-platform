import { Model } from 'mongoose';
import { ParsingTemplate, ParsingTemplateDocument, DocumentType } from '../schemas/parsing-template.schema';
export interface ParsedBankTransaction {
    date: Date;
    label: string;
    amount: number;
    rawLine?: string[];
}
export interface ParsedInvoice {
    invoiceNumber?: string;
    date?: Date;
    dueDate?: Date;
    supplierName?: string;
    supplierAddress?: string;
    supplierSIRET?: string;
    supplierVAT?: string;
    totalHT?: number;
    totalTVA?: number;
    totalTTC?: number;
    lineItems?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        vatRate: number;
        totalHT: number;
    }>;
    rawText?: string;
}
export interface ParsedCV {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    title?: string;
    summary?: string;
    skills?: string[];
    experiences?: Array<{
        company: string;
        position: string;
        startDate?: string;
        endDate?: string;
        description?: string;
    }>;
    education?: Array<{
        institution: string;
        degree: string;
        year?: string;
    }>;
    rawText?: string;
}
export interface AnalyzeFileResult {
    status: 'SUCCESS' | 'UNKNOWN_FORMAT' | 'LEARNING_NEEDED';
    documentId?: string;
    data?: ParsedBankTransaction[] | ParsedInvoice | ParsedCV;
    rawData?: string[][];
    rawText?: string;
    templateId?: string;
    templateName?: string;
    message?: string;
    confidence?: number;
}
export declare class UniversalDocumentParserService {
    private templateModel;
    private readonly logger;
    constructor(templateModel: Model<ParsingTemplateDocument>);
    analyze(file: any, documentType: DocumentType, tenantId: string): Promise<AnalyzeFileResult>;
    learnFormat(tenantId: string, templateData: {
        name: string;
        signature: string;
        type: DocumentType;
        config: ParsingTemplate['config'];
        fileType: 'CSV' | 'PDF' | 'DOCX';
    }): Promise<ParsingTemplateDocument>;
    private extractBankTransactions;
    private extractInvoiceData;
    private extractCVData;
    private extractTextFromPDF;
    private extractTextFromDocx;
    private parseCSV;
    private textToLines;
    private detectFileType;
    private findTemplateBySignature;
    private parseDate;
    private parseAmount;
    getTemplates(tenantId: string, type?: DocumentType): Promise<ParsingTemplateDocument[]>;
    deleteTemplate(templateId: string, tenantId: string): Promise<void>;
}
