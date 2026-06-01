import { Document } from 'mongoose';
export type ParsingTemplateDocument = ParsingTemplate & Document;
export type DocumentType = 'BANK' | 'INVOICE' | 'CV';
export declare class ParsingTemplate {
    name: string;
    signature: string;
    type: DocumentType;
    config: {
        startRow?: number;
        dateColumn?: number;
        labelColumn?: number;
        amountColumn?: number;
        dateFormat?: string;
        hasHeader?: boolean;
        delimiter?: string;
        encoding?: string;
        invoiceNumberPattern?: string;
        datePattern?: string;
        totalHTPattern?: string;
        totalTVAPattern?: string;
        totalTTCPattern?: string;
        supplierPattern?: string;
        emailPattern?: string;
        phonePattern?: string;
        skillsKeywords?: string[];
        experienceKeywords?: string[];
    };
    tenantId: string;
    isActive: boolean;
    fileType: 'CSV' | 'PDF' | 'DOCX';
}
export declare const ParsingTemplateSchema: import("mongoose").Schema<ParsingTemplate, import("mongoose").Model<ParsingTemplate, any, any, any, Document<unknown, any, ParsingTemplate, any, {}> & ParsingTemplate & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ParsingTemplate, Document<unknown, {}, import("mongoose").FlatRecord<ParsingTemplate>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ParsingTemplate> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
