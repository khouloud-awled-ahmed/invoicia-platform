import { ProjectAssignmentsService } from './project-assignments.service';
export declare class ProjectAssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: ProjectAssignmentsService);
    create(createDto: {
        userId: string;
        projectId: string;
        startDate: string;
        endDate?: string;
        validatorId?: string;
        dailyRate?: number;
    }, user: any): Promise<import("./schemas/project-assignment.schema").ProjectAssignmentDocument>;
    getMyAssignments(user: any): Promise<import("./schemas/project-assignment.schema").ProjectAssignmentDocument[]>;
    getByProject(projectId: string, user: any): Promise<import("./schemas/project-assignment.schema").ProjectAssignmentDocument[]>;
    update(id: string, updateDto: {
        endDate?: string;
        validatorId?: string;
        dailyRate?: number;
        status?: string;
    }, user: any): Promise<import("./schemas/project-assignment.schema").ProjectAssignmentDocument>;
    endAssignment(id: string, user: any): Promise<import("./schemas/project-assignment.schema").ProjectAssignmentDocument>;
}
