import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
export declare class ProjectsService {
    private projectModel;
    constructor(projectModel: Model<ProjectDocument>);
    create(createDto: any, tenantId: string): Promise<Project>;
    findAll(tenantId: string): Promise<Project[]>;
    findOne(id: string, tenantId: string): Promise<Project>;
    update(id: string, updateDto: any, tenantId: string): Promise<Project>;
    remove(id: string, tenantId: string): Promise<void>;
}
