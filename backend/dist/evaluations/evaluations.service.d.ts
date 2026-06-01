import { Model } from 'mongoose';
import { Evaluation, EvaluationDocument } from './schemas/evaluation.schema';
export declare class EvaluationsService {
    private evalModel;
    constructor(evalModel: Model<EvaluationDocument>);
    create(dto: any, tenantId: string): Promise<import("mongoose").Document<unknown, {}, EvaluationDocument, {}, {}> & Evaluation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, EvaluationDocument, {}, {}> & Evaluation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    remove(id: string, tenantId: string): Promise<void>;
}
