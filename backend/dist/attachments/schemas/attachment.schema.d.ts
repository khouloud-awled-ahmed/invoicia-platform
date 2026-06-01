import { Document } from 'mongoose';
export type AttachmentDocument = Attachment & Document;
export declare class Attachment {
    tenantId: string;
    entityType: string;
    entityId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    gridFsFileId: string;
    uploadedBy?: string;
}
export declare const AttachmentSchema: import("mongoose").Schema<Attachment, import("mongoose").Model<Attachment, any, any, any, Document<unknown, any, Attachment, any, {}> & Attachment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attachment, Document<unknown, {}, import("mongoose").FlatRecord<Attachment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Attachment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
