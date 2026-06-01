import { Document } from 'mongoose';
export type CVDocument = CV & Document;
export declare class CV {
    tenantId: string;
    fileName: string;
    name?: string;
    email?: string;
    rawText: string;
}
export declare const CVSchema: import("mongoose").Schema<CV, import("mongoose").Model<CV, any, any, any, Document<unknown, any, CV, any, {}> & CV & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CV, Document<unknown, {}, import("mongoose").FlatRecord<CV>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<CV> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
