import { Document } from 'mongoose';
export type BulletinDocument = Bulletin & Document;
export declare class Bulletin {
    employeeId: string;
    employeeName: string;
    month: number;
    year: number;
    salaireBrut: number;
    cnss: number;
    irpp: number;
    autresRetenues: number;
    salaireNet: number;
    status: string;
    tenantId: string;
}
export declare const BulletinSchema: import("mongoose").Schema<Bulletin, import("mongoose").Model<Bulletin, any, any, any, Document<unknown, any, Bulletin, any, {}> & Bulletin & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Bulletin, Document<unknown, {}, import("mongoose").FlatRecord<Bulletin>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Bulletin> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
