import { FormationsService } from './formations.service';
export declare class FormationsController {
    private readonly formationsService;
    constructor(formationsService: FormationsService);
    create(dto: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/formation.schema").FormationDocument, {}, {}> & import("./schemas/formation.schema").Formation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(user: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/formation.schema").FormationDocument, {}, {}> & import("./schemas/formation.schema").Formation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, body: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/formation.schema").FormationDocument, {}, {}> & import("./schemas/formation.schema").Formation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, user: any): Promise<void>;
}
