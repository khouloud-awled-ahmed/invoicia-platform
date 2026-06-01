import { IntervenantsService } from './intervenants.service';
export declare class IntervenantsController {
    private readonly intervenantsService;
    constructor(intervenantsService: IntervenantsService);
    create(createDto: any, user: any): Promise<import("./schemas/intervenant.schema").Intervenant>;
    findAll(filters: any, user: any): Promise<import("./schemas/intervenant.schema").Intervenant[]>;
    findOne(id: string, user: any): Promise<import("./schemas/intervenant.schema").Intervenant>;
    update(id: string, updateDto: any, user: any): Promise<import("./schemas/intervenant.schema").Intervenant>;
    remove(id: string, user: any): Promise<void>;
    generateCRAToken(id: string, user: any): Promise<string>;
    findByToken(token: string): Promise<{
        id: any;
        firstName: string;
        lastName: string;
        email: string;
        type: string;
        supplierName: string;
    }>;
}
