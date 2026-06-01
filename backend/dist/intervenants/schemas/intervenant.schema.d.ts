import { Document } from 'mongoose';
export type IntervenantDocument = Intervenant & Document;
export declare class Intervenant {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    type: string;
    employeeId?: string;
    supplierId?: string;
    supplierName?: string;
    position?: string;
    status: string;
    canSubmitCRA: boolean;
    craAccessToken?: string;
    tenantId: string;
    metadata?: Record<string, any>;
}
export declare const IntervenantSchema: import("mongoose").Schema<Intervenant, import("mongoose").Model<Intervenant, any, any, any, Document<unknown, any, Intervenant, any, {}> & Intervenant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Intervenant, Document<unknown, {}, import("mongoose").FlatRecord<Intervenant>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Intervenant> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
