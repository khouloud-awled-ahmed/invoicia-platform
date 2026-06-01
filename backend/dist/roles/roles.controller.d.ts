import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(req: any): Promise<import("./role.schema").Role[]>;
    create(req: any, body: any): Promise<import("./role.schema").Role>;
    update(req: any, id: string, body: any): Promise<import("./role.schema").Role>;
    delete(req: any, id: string): Promise<void>;
}
