import { Document } from 'mongoose';
export type EcritureDocument = Ecriture & Document;
export declare class Ecriture {
    date: string;
    journal: string;
    compte: string;
    libelle: string;
    debit: number;
    credit: number;
    tenantId: string;
}
export declare const EcritureSchema: import("mongoose").Schema<Ecriture, import("mongoose").Model<Ecriture, any, any, any, Document<unknown, any, Ecriture, any, {}> & Ecriture & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Ecriture, Document<unknown, {}, import("mongoose").FlatRecord<Ecriture>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Ecriture> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
