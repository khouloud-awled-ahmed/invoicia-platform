import { Document } from 'mongoose';
export type GEDDocumentDocument = GEDDocument & Document;
export declare class GEDDocument {
    tenantId: string;
    name: string;
    folderId?: string;
    path: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    gridFsFileId: string;
    documentType: string;
    tags: string[];
    description?: string;
    uploadedBy?: string;
    archived: boolean;
    archivedAt?: Date;
    metadata?: {
        year?: number;
        month?: number;
        entityId?: string;
        entityType?: string;
        supplierName?: string;
        clientName?: string;
        [key: string]: any;
    };
}
export declare const GEDDocumentSchema: import("mongoose").Schema<GEDDocument, import("mongoose").Model<GEDDocument, any, any, any, Document<unknown, any, GEDDocument, any, {}> & GEDDocument & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GEDDocument, Document<unknown, {}, import("mongoose").FlatRecord<GEDDocument>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GEDDocument> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
