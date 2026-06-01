import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogEntryDocument = LogEntry & Document;

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum LogCategory {
  TECHNICAL = 'technical',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  DATABASE = 'database',
  API = 'api',
}

export enum LogSource {
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
}

@Schema({ timestamps: true })
export class LogEntry {
  @Prop({ required: true, enum: LogLevel })
  level: LogLevel;

  @Prop({ required: true, enum: LogCategory })
  category: LogCategory;

  @Prop({ required: true, enum: LogSource })
  source: LogSource;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
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

  @Prop({ type: Object, default: {} })
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
    details?: any;
  };

  @Prop()
  timestamp: Date;

  @Prop({ default: false })
  resolved: boolean;

  @Prop()
  resolvedBy?: string;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  notes?: string;
}

export const LogEntrySchema = SchemaFactory.createForClass(LogEntry);

// Index pour les recherches fréquentes
LogEntrySchema.index({ level: 1, createdAt: -1 });
LogEntrySchema.index({ category: 1, createdAt: -1 });
LogEntrySchema.index({ source: 1, createdAt: -1 });
LogEntrySchema.index({ 'metadata.tenantId': 1, createdAt: -1 });
LogEntrySchema.index({ 'metadata.userId': 1, createdAt: -1 });
LogEntrySchema.index({ resolved: 1, createdAt: -1 });
LogEntrySchema.index({ createdAt: -1 });
