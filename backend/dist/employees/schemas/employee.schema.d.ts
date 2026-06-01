import { Document } from 'mongoose';
export type EmployeeDocument = Employee & Document;
export declare class Employee {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    hireDate?: Date;
    birthDate?: Date;
    position?: string;
    department?: string;
    salary?: number;
    matriculeCNSS?: string;
    cin?: string;
    cinDeliveryDate?: Date;
    chefDeFamille?: boolean;
    enfantsACharge?: number;
    status: string;
    userId?: string;
    tenantId: string;
    metadata?: Record<string, any>;
}
export declare const EmployeeSchema: import("mongoose").Schema<Employee, import("mongoose").Model<Employee, any, any, any, Document<unknown, any, Employee, any, {}> & Employee & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Employee, Document<unknown, {}, import("mongoose").FlatRecord<Employee>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Employee> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
