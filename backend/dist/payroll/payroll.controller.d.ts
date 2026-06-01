import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    create(dto: any, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/bulletin.schema").BulletinDocument, {}, {}> & import("./schemas/bulletin.schema").Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(user: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/bulletin.schema").BulletinDocument, {}, {}> & import("./schemas/bulletin.schema").Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    validate(id: string, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/bulletin.schema").BulletinDocument, {}, {}> & import("./schemas/bulletin.schema").Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    pay(id: string, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/bulletin.schema").BulletinDocument, {}, {}> & import("./schemas/bulletin.schema").Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
