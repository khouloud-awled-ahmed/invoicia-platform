import { PipelineService } from './pipeline.service';
export declare class PipelineController {
    private readonly pipelineService;
    constructor(pipelineService: PipelineService);
    findAll(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./opportunity.schema").OpportunityDocument, {}, {}> & import("./opportunity.schema").Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(body: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("./opportunity.schema").OpportunityDocument, {}, {}> & import("./opportunity.schema").Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("./opportunity.schema").OpportunityDocument, {}, {}> & import("./opportunity.schema").Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("./opportunity.schema").OpportunityDocument, {}, {}> & import("./opportunity.schema").Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
