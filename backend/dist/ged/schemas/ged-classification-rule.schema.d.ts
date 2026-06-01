import { Document } from 'mongoose';
export type GEDClassificationRuleDocument = GEDClassificationRule & Document;
export declare class GEDClassificationRule {
    tenantId: string;
    name: string;
    documentType: string;
    targetFolderId: string;
    keywords: string[];
    fileExtensions: string[];
    conditions?: {
        entityType?: string;
        minSize?: number;
        maxSize?: number;
        [key: string]: any;
    };
    isActive: boolean;
    priority: number;
}
export declare const GEDClassificationRuleSchema: import("mongoose").Schema<GEDClassificationRule, import("mongoose").Model<GEDClassificationRule, any, any, any, Document<unknown, any, GEDClassificationRule, any, {}> & GEDClassificationRule & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GEDClassificationRule, Document<unknown, {}, import("mongoose").FlatRecord<GEDClassificationRule>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GEDClassificationRule> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
