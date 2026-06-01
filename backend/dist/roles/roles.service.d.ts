import { Model } from 'mongoose';
import { Role, RoleDocument } from './role.schema';
export declare class RolesService {
    private roleModel;
    constructor(roleModel: Model<RoleDocument>);
    findAll(tenantId: string): Promise<Role[]>;
    findBySlug(tenantId: string, slug: string): Promise<Role | null>;
    create(tenantId: string, data: Partial<Role>): Promise<Role>;
    update(id: string, tenantId: string, data: Partial<Role>): Promise<Role>;
    delete(id: string, tenantId: string): Promise<void>;
    seedDefaultRoles(tenantId: string): Promise<void>;
}
