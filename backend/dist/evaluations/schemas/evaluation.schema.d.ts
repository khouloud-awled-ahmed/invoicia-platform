import { Document } from 'mongoose';
export type EvaluationDocument = Evaluation & Document;
export declare class Evaluation {
    employeeId: string;
    employe: string;
    evaluateur: string;
    date: string;
    score: number;
    objectifs: string;
    commentaires: string;
    statut: string;
    tenantId: string;
}
export declare const EvaluationSchema: import("mongoose").Schema<Evaluation, import("mongoose").Model<Evaluation, any, any, any, Document<unknown, any, Evaluation, any, {}> & Evaluation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Evaluation, Document<unknown, {}, import("mongoose").FlatRecord<Evaluation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Evaluation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
