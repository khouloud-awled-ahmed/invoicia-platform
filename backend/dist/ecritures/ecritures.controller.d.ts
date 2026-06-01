import { EcrituresService } from './ecritures.service';
export declare class EcrituresController {
    private readonly ecrituresService;
    constructor(ecrituresService: EcrituresService);
    create(dto: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ecriture.schema").EcritureDocument, {}, {}> & import("./schemas/ecriture.schema").Ecriture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(user: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ecriture.schema").EcritureDocument, {}, {}> & import("./schemas/ecriture.schema").Ecriture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
