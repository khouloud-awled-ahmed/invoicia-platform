import { Document } from 'mongoose';
export type FormationDocument = Formation & Document;
export declare class Formation {
    titre: string;
    organisme: string;
    dateDebut: string;
    duree: number;
    employeeId: string;
    employe: string;
    description: string;
    statut: string;
    tenantId: string;
}
export declare const FormationSchema: import("mongoose").Schema<Formation, import("mongoose").Model<Formation, any, any, any, Document<unknown, any, Formation, any, {}> & Formation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Formation, Document<unknown, {}, import("mongoose").FlatRecord<Formation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Formation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
