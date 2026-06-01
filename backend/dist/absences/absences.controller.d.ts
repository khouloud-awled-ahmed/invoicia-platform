import { AbsencesService } from './absences.service';
export declare class AbsencesController {
    private readonly absencesService;
    constructor(absencesService: AbsencesService);
    getStats(user: any): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        totalDays: number;
        byType: Record<string, number>;
    }>;
    create(dto: any, user: any): Promise<import("./schemas/absence.schema").Absence>;
    findAll(user: any, query: any): Promise<import("./schemas/absence.schema").Absence[]>;
    findOne(id: string, user: any): Promise<import("./schemas/absence.schema").Absence>;
    update(id: string, dto: any, user: any): Promise<import("./schemas/absence.schema").Absence>;
    remove(id: string, user: any): Promise<void>;
    approve(id: string, user: any): Promise<import("./schemas/absence.schema").Absence>;
    reject(id: string, user: any): Promise<import("./schemas/absence.schema").Absence>;
}
