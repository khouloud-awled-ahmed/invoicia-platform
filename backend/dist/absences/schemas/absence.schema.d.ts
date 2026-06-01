import { Document } from 'mongoose';
export type AbsenceDocument = Absence & Document;
export declare class Absence {
    employeeId: string;
    employeeName: string;
    type: string;
    startDate: Date;
    endDate: Date;
    days: number;
    status: string;
    reason?: string;
    approvedBy?: string;
    approvedAt?: Date;
    tenantId: string;
}
export declare const AbsenceSchema: import("mongoose").Schema<Absence, import("mongoose").Model<Absence, any, any, any, Document<unknown, any, Absence, any, {}> & Absence & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Absence, Document<unknown, {}, import("mongoose").FlatRecord<Absence>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Absence> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
