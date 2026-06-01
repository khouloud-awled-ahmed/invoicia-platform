import { Document } from 'mongoose';
export type ProjectAssignmentDocument = ProjectAssignment & Document;
export declare class ProjectAssignment {
    userId: string;
    projectId: string;
    projectName: string;
    startDate: Date;
    endDate?: Date;
    validatorId?: string;
    validatorName?: string;
    dailyRate?: number;
    status: string;
    tenantId: string;
    metadata?: Record<string, any>;
}
export declare const ProjectAssignmentSchema: import("mongoose").Schema<ProjectAssignment, import("mongoose").Model<ProjectAssignment, any, any, any, Document<unknown, any, ProjectAssignment, any, {}> & ProjectAssignment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectAssignment, Document<unknown, {}, import("mongoose").FlatRecord<ProjectAssignment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProjectAssignment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
