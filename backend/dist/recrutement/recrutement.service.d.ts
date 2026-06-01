import { Model } from 'mongoose';
import { Offre, OffreDocument } from './schemas/offre.schema';
export declare class RecrutementService {
    private offreModel;
    constructor(offreModel: Model<OffreDocument>);
    create(dto: any, tenantId: string): Promise<import("mongoose").Document<unknown, {}, OffreDocument, {}, {}> & Offre & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, OffreDocument, {}, {}> & Offre & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, statut: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, OffreDocument, {}, {}> & Offre & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
