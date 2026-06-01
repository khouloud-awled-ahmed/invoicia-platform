import { Document } from 'mongoose';
export type CraDocument = Cra & Document;
export declare class Cra {
    intervenantId: string;
    intervenantName: string;
    projectId: string;
    projectName: string;
    date: Date;
    hours: number;
    rate: number;
    amount: number;
    status: string;
    tenantId: string;
    notes?: string;
}
export declare const CraSchema: import("mongoose").Schema<Cra, import("mongoose").Model<Cra, any, any, any, Document<unknown, any, Cra, any, {}> & Cra & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Cra, Document<unknown, {}, import("mongoose").FlatRecord<Cra>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Cra> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
