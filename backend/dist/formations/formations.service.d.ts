import { Model } from 'mongoose';
import { Formation, FormationDocument } from './schemas/formation.schema';
export declare class FormationsService {
    private formationModel;
    constructor(formationModel: Model<FormationDocument>);
    create(dto: any, tenantId: string): Promise<import("mongoose").Document<unknown, {}, FormationDocument, {}, {}> & Formation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, FormationDocument, {}, {}> & Formation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, statut: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, FormationDocument, {}, {}> & Formation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, tenantId: string): Promise<void>;
}
