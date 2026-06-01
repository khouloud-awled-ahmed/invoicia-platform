import { LogsService } from './logs.service';
import { FilterLogsDto } from './dto/filter-logs.dto';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    findAll(filters: FilterLogsDto, page: number, limit: number): Promise<{
        logs: import("./schemas/log-entry.schema").LogEntry[];
        total: number;
    }>;
    getStats(timeRange?: '24h' | '7d' | '30d'): Promise<{
        total: number;
        byLevel: Record<import("./schemas/log-entry.schema").LogLevel, number>;
        byCategory: Record<import("./schemas/log-entry.schema").LogCategory, number>;
        bySource: Record<import("./schemas/log-entry.schema").LogSource, number>;
        errors: number;
        warnings: number;
        unresolved: number;
    }>;
    findOne(id: string): Promise<import("./schemas/log-entry.schema").LogEntry>;
    markAsResolved(id: string, notes: string, user: any): Promise<import("./schemas/log-entry.schema").LogEntry>;
    cleanupOldLogs(daysToKeep: number): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
