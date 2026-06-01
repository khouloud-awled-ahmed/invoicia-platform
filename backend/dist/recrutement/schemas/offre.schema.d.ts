import { Document } from 'mongoose';
export type OffreDocument = Offre & Document;
export declare class Offre {
    titre: string;
    departement: string;
    typeContrat: string;
    localisation: string;
    description: string;
    statut: string;
    candidatures: number;
    datePublication: string;
    tenantId: string;
}
export declare const OffreSchema: import("mongoose").Schema<Offre, import("mongoose").Model<Offre, any, any, any, Document<unknown, any, Offre, any, {}> & Offre & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Offre, Document<unknown, {}, import("mongoose").FlatRecord<Offre>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Offre> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
