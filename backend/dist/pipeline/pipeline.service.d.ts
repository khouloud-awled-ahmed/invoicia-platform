import { Model } from 'mongoose';
import { Opportunity, OpportunityDocument } from './opportunity.schema';
export declare class PipelineService {
    private opportunityModel;
    constructor(opportunityModel: Model<OpportunityDocument>);
    findAll(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, OpportunityDocument, {}, {}> & Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(data: any, tenantId: string): Promise<import("mongoose").Document<unknown, {}, OpportunityDocument, {}, {}> & Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, OpportunityDocument, {}, {}> & Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, OpportunityDocument, {}, {}> & Opportunity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
