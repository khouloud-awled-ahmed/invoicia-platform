import { RecrutementService } from './recrutement.service';
export declare class RecrutementController {
    private readonly recrutementService;
    constructor(recrutementService: RecrutementService);
    create(dto: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/offre.schema").OffreDocument, {}, {}> & import("./schemas/offre.schema").Offre & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(user: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/offre.schema").OffreDocument, {}, {}> & import("./schemas/offre.schema").Offre & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, body: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/offre.schema").OffreDocument, {}, {}> & import("./schemas/offre.schema").Offre & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
