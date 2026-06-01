import { Model } from 'mongoose';
import { LogEntry, LogEntryDocument, LogLevel, LogCategory, LogSource } from './schemas/log-entry.schema';
export declare class LogsService {
    private logEntryModel;
    private readonly logger;
    constructor(logEntryModel: Model<LogEntryDocument>);
    createLog(data: {
        level: LogLevel;
        category: LogCategory;
        source: LogSource;
        message: string;
        metadata?: any;
        error?: any;
    }): Promise<LogEntry>;
    findAll(filters: {
        level?: LogLevel;
        category?: LogCategory;
        source?: LogSource;
        tenantId?: string;
        userId?: string;
        resolved?: boolean;
        startDate?: Date;
        endDate?: Date;
        search?: string;
    }, page?: number, limit?: number): Promise<{
        logs: LogEntry[];
        total: number;
    }>;
    findOne(id: string): Promise<LogEntry>;
    markAsResolved(id: string, resolvedBy: string, notes?: string): Promise<LogEntry>;
    getStats(timeRange?: '24h' | '7d' | '30d'): Promise<{
        total: number;
        byLevel: Record<LogLevel, number>;
        byCategory: Record<LogCategory, number>;
        bySource: Record<LogSource, number>;
        errors: number;
        warnings: number;
        unresolved: number;
    }>;
    deleteOldLogs(daysToKeep?: number): Promise<number>;
}
