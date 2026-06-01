import { Model } from 'mongoose';
import { ProjectAssignmentDocument } from './schemas/project-assignment.schema';
import { ProjectDocument } from './schemas/project.schema';
import { UserDocument } from '../users/schemas/user.schema';
export declare class ProjectAssignmentsService {
    private assignmentModel;
    private projectModel;
    private userModel;
    constructor(assignmentModel: Model<ProjectAssignmentDocument>, projectModel: Model<ProjectDocument>, userModel: Model<UserDocument>);
    create(userId: string, projectId: string, startDate: Date, tenantId: string, endDate?: Date, validatorId?: string, dailyRate?: number): Promise<ProjectAssignmentDocument>;
    findByUser(userId: string, tenantId: string, includeEnded?: boolean): Promise<ProjectAssignmentDocument[]>;
    findByProject(projectId: string, tenantId: string): Promise<ProjectAssignmentDocument[]>;
    update(id: string, updateDto: {
        endDate?: Date;
        validatorId?: string;
        dailyRate?: number;
        status?: string;
    }, tenantId: string): Promise<ProjectAssignmentDocument>;
    endAssignment(id: string, tenantId: string): Promise<ProjectAssignmentDocument>;
    findActiveAssignmentsForDate(userId: string, date: Date, tenantId: string): Promise<ProjectAssignmentDocument[]>;
}
