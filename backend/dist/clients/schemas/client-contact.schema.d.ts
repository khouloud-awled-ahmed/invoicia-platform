import { Document } from 'mongoose';
export type ClientContactDocument = ClientContact & Document;
export declare class ClientContact {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    type: string;
    isPrimary: boolean;
    position?: string;
    notes?: string;
}
export declare const ClientContactSchema: import("mongoose").Schema<ClientContact, import("mongoose").Model<ClientContact, any, any, any, Document<unknown, any, ClientContact, any, {}> & ClientContact & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ClientContact, Document<unknown, {}, import("mongoose").FlatRecord<ClientContact>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ClientContact> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
