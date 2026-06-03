import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LogEntry,
  LogEntryDocument,
  LogLevel,
  LogCategory,
  LogSource,
} from './schemas/log-entry.schema';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(@InjectModel(LogEntry.name) private logEntryModel: Model<LogEntryDocument>) {}

  async createLog(data: {
    level: LogLevel;
    category: LogCategory;
    source: LogSource;
    message: string;
    metadata?: any;
    error?: any;
  }): Promise<LogEntry> {
    try {
      const logEntry = new this.logEntryModel({
        ...data,
        timestamp: new Date(),
      });
      return await logEntry.save();
    } catch (error) {
      // Logger l'erreur sans créer une boucle infinie
      this.logger.error('Failed to save log entry', error);
      return null;
    }
  }

  async findAll(
    filters: {
      level?: LogLevel;
      category?: LogCategory;
      source?: LogSource;
      tenantId?: string;
      userId?: string;
      resolved?: boolean;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: LogEntry[]; total: number }> {
    const query: any = {};

    if (filters.level) query.level = filters.level;
    if (filters.category) query.category = filters.category;
    if (filters.source) query.source = filters.source;
    if (filters.resolved !== undefined) query.resolved = filters.resolved;
    if (filters.tenantId) query['metadata.tenantId'] = filters.tenantId;
    if (filters.userId) query['metadata.userId'] = filters.userId;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    if (filters.search) {
      query.$or = [
        { message: { $regex: filters.search, $options: 'i' } },
        { 'error.message': { $regex: filters.search, $options: 'i' } },
        { 'metadata.endpoint': { $regex: filters.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.logEntryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.logEntryModel.countDocuments(query).exec(),
    ]);

    return { logs: logs as LogEntry[], total };
  }

  async findOne(id: string): Promise<LogEntry> {
    return this.logEntryModel.findById(id).lean().exec();
  }

  async markAsResolved(id: string, resolvedBy: string, notes?: string): Promise<LogEntry> {
    return this.logEntryModel
      .findByIdAndUpdate(
        id,
        {
          resolved: true,
          resolvedBy,
          resolvedAt: new Date(),
          notes,
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async getStats(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<{
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    bySource: Record<LogSource, number>;
    errors: number;
    warnings: number;
    unresolved: number;
  }> {
    const now = new Date();
    const ranges = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    const startDate = ranges[timeRange];

    const query = { createdAt: { $gte: startDate } };

    const [total, byLevel, byCategory, bySource, unresolved] = await Promise.all([
      this.logEntryModel.countDocuments(query).exec(),
      this.logEntryModel
        .aggregate([{ $match: query }, { $group: { _id: '$level', count: { $sum: 1 } } }])
        .exec(),
      this.logEntryModel
        .aggregate([{ $match: query }, { $group: { _id: '$category', count: { $sum: 1 } } }])
        .exec(),
      this.logEntryModel
        .aggregate([{ $match: query }, { $group: { _id: '$source', count: { $sum: 1 } } }])
        .exec(),
      this.logEntryModel.countDocuments({ ...query, resolved: false }).exec(),
    ]);

    const errors = byLevel.find((item: any) => item._id === LogLevel.ERROR)?.count || 0;
    const warnings = byLevel.find((item: any) => item._id === LogLevel.WARN)?.count || 0;

    return {
      total,
      byLevel: byLevel.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      bySource: bySource.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      errors,
      warnings,
      unresolved,
    };
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.logEntryModel
      .deleteMany({
        createdAt: { $lt: cutoffDate },
        resolved: true,
      })
      .exec();

    return result.deletedCount;
  }
}
