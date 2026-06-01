import { Document } from 'mongoose';
export type GEDFolderDocument = GEDFolder & Document;
export declare class GEDFolder {
    tenantId: string;
    name: string;
    parentId?: string;
    path: string;
    documentCount: number;
    totalSize: number;
    documentType?: string;
    isActive: boolean;
    description?: string;
    metadata?: {
        color?: string;
        icon?: string;
        [key: string]: any;
    };
}
export declare const GEDFolderSchema: import("mongoose").Schema<GEDFolder, import("mongoose").Model<GEDFolder, any, any, any, Document<unknown, any, GEDFolder, any, {}> & GEDFolder & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GEDFolder, Document<unknown, {}, import("mongoose").FlatRecord<GEDFolder>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GEDFolder> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
