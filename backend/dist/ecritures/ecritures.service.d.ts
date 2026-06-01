import { Model } from 'mongoose';
import { Ecriture, EcritureDocument } from './schemas/ecriture.schema';
export declare class EcrituresService {
    private ecritureModel;
    constructor(ecritureModel: Model<EcritureDocument>);
    create(dto: any, tenantId: string): Promise<import("mongoose").Document<unknown, {}, EcritureDocument, {}, {}> & Ecriture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, EcritureDocument, {}, {}> & Ecriture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
