import { Document } from 'mongoose';
export type BankParserTemplateDocument = BankParserTemplate & Document;
export declare class BankParserTemplate {
    name: string;
    signature: string;
    config: {
        startRow: number;
        dateColumn: number;
        labelColumn: number;
        amountColumn: number;
        dateFormat: string;
        hasHeader: boolean;
        delimiter?: string;
        encoding?: string;
    };
    tenantId: string;
    isActive: boolean;
    fileType: 'CSV' | 'PDF';
}
export declare const BankParserTemplateSchema: import("mongoose").Schema<BankParserTemplate, import("mongoose").Model<BankParserTemplate, any, any, any, Document<unknown, any, BankParserTemplate, any, {}> & BankParserTemplate & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BankParserTemplate, Document<unknown, {}, import("mongoose").FlatRecord<BankParserTemplate>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BankParserTemplate> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
