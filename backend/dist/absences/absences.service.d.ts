import { Model } from 'mongoose';
import { Absence, AbsenceDocument } from './schemas/absence.schema';
export declare class AbsencesService {
    private absenceModel;
    constructor(absenceModel: Model<AbsenceDocument>);
    create(dto: any, tenantId: string): Promise<Absence>;
    findAll(tenantId: string, filters?: any): Promise<Absence[]>;
    findOne(id: string, tenantId: string): Promise<Absence>;
    update(id: string, dto: any, tenantId: string): Promise<Absence>;
    remove(id: string, tenantId: string): Promise<void>;
    approve(id: string, tenantId: string, approvedBy?: string): Promise<Absence>;
    reject(id: string, tenantId: string): Promise<Absence>;
    getStats(tenantId: string): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        totalDays: number;
        byType: Record<string, number>;
    }>;
}
