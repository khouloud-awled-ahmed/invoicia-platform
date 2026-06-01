import { EvaluationsService } from './evaluations.service';
export declare class EvaluationsController {
    private readonly evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    create(dto: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/evaluation.schema").EvaluationDocument, {}, {}> & import("./schemas/evaluation.schema").Evaluation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(user: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/evaluation.schema").EvaluationDocument, {}, {}> & import("./schemas/evaluation.schema").Evaluation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    remove(id: string, user: any): Promise<void>;
}
