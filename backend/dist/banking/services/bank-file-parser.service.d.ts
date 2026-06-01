import { Model } from 'mongoose';
import { BankParserTemplate, BankParserTemplateDocument } from '../schemas/bank-parser-template.schema';
export interface ParsedTransaction {
    date: Date;
    label: string;
    amount: number;
    rawLine?: string[];
}
export interface AnalyzeFileResult {
    status: 'SUCCESS' | 'UNKNOWN_FORMAT';
    transactions?: ParsedTransaction[];
    rawData?: string[][];
    templateId?: string;
    templateName?: string;
    message?: string;
}
export declare class BankFileParserService {
    private templateModel;
    private readonly logger;
    constructor(templateModel: Model<BankParserTemplateDocument>);
    analyzeFile(file: any, tenantId: string): Promise<AnalyzeFileResult>;
    learnFormat(tenantId: string, templateData: {
        name: string;
        signature: string;
        config: BankParserTemplate['config'];
        fileType: 'CSV' | 'PDF';
    }): Promise<BankParserTemplateDocument>;
    private extractTextFromPDF;
    private parseCSV;
    private textToLines;
    private detectFileType;
    private findTemplateBySignature;
    private extractTransactions;
    private parseDate;
    private parseAmount;
    getTemplates(tenantId: string): Promise<BankParserTemplateDocument[]>;
    deleteTemplate(templateId: string, tenantId: string): Promise<void>;
}
