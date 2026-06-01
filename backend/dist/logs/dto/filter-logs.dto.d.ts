import { LogLevel, LogCategory, LogSource } from '../schemas/log-entry.schema';
export declare class FilterLogsDto {
    level?: LogLevel;
    category?: LogCategory;
    source?: LogSource;
    tenantId?: string;
    userId?: string;
    resolved?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}
