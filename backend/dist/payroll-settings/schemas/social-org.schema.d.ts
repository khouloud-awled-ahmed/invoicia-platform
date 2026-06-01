import { Document } from 'mongoose';
export type SocialOrgDocument = SocialOrg & Document;
export declare class SocialOrg {
    name: string;
    type: string;
    contractId?: string;
    affiliationId?: string;
    tenantId: string;
}
export declare const SocialOrgSchema: import("mongoose").Schema<SocialOrg, import("mongoose").Model<SocialOrg, any, any, any, Document<unknown, any, SocialOrg, any, {}> & SocialOrg & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SocialOrg, Document<unknown, {}, import("mongoose").FlatRecord<SocialOrg>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SocialOrg> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
