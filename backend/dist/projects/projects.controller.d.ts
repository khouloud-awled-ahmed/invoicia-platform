import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createDto: any, user: any): Promise<import("./schemas/project.schema").Project>;
    findAll(user: any): Promise<import("./schemas/project.schema").Project[]>;
    findOne(id: string, user: any): Promise<import("./schemas/project.schema").Project>;
    update(id: string, updateDto: any, user: any): Promise<import("./schemas/project.schema").Project>;
    remove(id: string, user: any): Promise<void>;
}
