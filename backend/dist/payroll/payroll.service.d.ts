import { Model } from 'mongoose';
import { Bulletin, BulletinDocument } from './schemas/bulletin.schema';
export declare class PayrollService {
    private bulletinModel;
    constructor(bulletinModel: Model<BulletinDocument>);
    create(dto: any, tenantId: string): Promise<import("mongoose").Document<unknown, {}, BulletinDocument, {}, {}> & Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, BulletinDocument, {}, {}> & Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    validate(id: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, BulletinDocument, {}, {}> & Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    pay(id: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, BulletinDocument, {}, {}> & Bulletin & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
