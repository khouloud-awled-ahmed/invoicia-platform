import { Model } from 'mongoose';
import { Intervenant, IntervenantDocument } from './schemas/intervenant.schema';
import { UserSyncService } from '../users/user-sync.service';
export declare class IntervenantsService {
    private intervenantModel;
    private userSyncService;
    private readonly logger;
    constructor(intervenantModel: Model<IntervenantDocument>, userSyncService: UserSyncService);
    create(createDto: any, tenantId: string): Promise<Intervenant>;
    findAll(tenantId: string, filters?: {
        type?: string;
        status?: string;
    }): Promise<Intervenant[]>;
    findOne(id: string, tenantId: string): Promise<Intervenant>;
    findByEmail(email: string, tenantId: string): Promise<Intervenant | null>;
    update(id: string, updateDto: any, tenantId: string): Promise<Intervenant>;
    remove(id: string, tenantId: string): Promise<void>;
    generateCRAAccessToken(id: string, tenantId: string): Promise<string>;
    findByCRAToken(token: string): Promise<Intervenant | null>;
}
