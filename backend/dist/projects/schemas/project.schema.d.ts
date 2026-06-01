import { Document } from 'mongoose';
export type ProjectDocument = Project & Document;
export declare class Project {
    name: string;
    client: string;
    status: string;
    priority: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    consumed: number;
    progress: number;
    manager: string;
    team: string[];
    description: string;
    tasksTotal: number;
    tasksCompleted: number;
    hoursEstimated: number;
    hoursSpent: number;
    code: string;
    color: string;
    type: string;
    tenantId: string;
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, Document<unknown, any, Project, any, {}> & Project & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Project> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
