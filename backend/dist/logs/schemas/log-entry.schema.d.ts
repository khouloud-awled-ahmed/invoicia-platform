import { Document } from 'mongoose';
export type LogEntryDocument = LogEntry & Document;
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare enum LogCategory {
    TECHNICAL = "technical",
    USER_ACTION = "user_action",
    SYSTEM = "system",
    SECURITY = "security",
    PERFORMANCE = "performance",
    DATABASE = "database",
    API = "api"
}
export declare enum LogSource {
    BACKEND = "backend",
    FRONTEND = "frontend",
    DATABASE = "database",
    EXTERNAL_API = "external_api"
}
export declare class LogEntry {
    level: LogLevel;
    category: LogCategory;
    source: LogSource;
    message: string;
    metadata?: {
        userId?: string;
        tenantId?: string;
        ipAddress?: string;
        userAgent?: string;
        endpoint?: string;
        method?: string;
        statusCode?: number;
        requestId?: string;
        duration?: number;
        [key: string]: any;
    };
    error?: {
        name?: string;
        message?: string;
        stack?: string;
        code?: string;
        details?: any;
    };
    timestamp: Date;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
    notes?: string;
}
export declare const LogEntrySchema: import("mongoose").Schema<LogEntry, import("mongoose").Model<LogEntry, any, any, any, Document<unknown, any, LogEntry, any, {}> & LogEntry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LogEntry, Document<unknown, {}, import("mongoose").FlatRecord<LogEntry>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<LogEntry> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
