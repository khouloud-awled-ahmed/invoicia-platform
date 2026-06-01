import { Document } from 'mongoose';
export type OpportunityDocument = Opportunity & Document;
export declare class Opportunity {
    name: string;
    client: string;
    amount: number;
    probability: number;
    stage: string;
    tenantId: string;
}
export declare const OpportunitySchema: import("mongoose").Schema<Opportunity, import("mongoose").Model<Opportunity, any, any, any, Document<unknown, any, Opportunity, any, {}> & Opportunity & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Opportunity, Document<unknown, {}, import("mongoose").FlatRecord<Opportunity>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Opportunity> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
