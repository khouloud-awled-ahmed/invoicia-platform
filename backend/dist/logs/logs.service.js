"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const log_entry_schema_1 = require("./schemas/log-entry.schema");
let LogsService = LogsService_1 = class LogsService {
    constructor(logEntryModel) {
        this.logEntryModel = logEntryModel;
        this.logger = new common_1.Logger(LogsService_1.name);
    }
    async createLog(data) {
        try {
            const logEntry = new this.logEntryModel({
                ...data,
                timestamp: new Date(),
            });
            return await logEntry.save();
        }
        catch (error) {
            this.logger.error('Failed to save log entry', error);
            return null;
        }
    }
    async findAll(filters, page = 1, limit = 50) {
        const query = {};
        if (filters.level)
            query.level = filters.level;
        if (filters.category)
            query.category = filters.category;
        if (filters.source)
            query.source = filters.source;
        if (filters.resolved !== undefined)
            query.resolved = filters.resolved;
        if (filters.tenantId)
            query['metadata.tenantId'] = filters.tenantId;
        if (filters.userId)
            query['metadata.userId'] = filters.userId;
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = filters.startDate;
            if (filters.endDate)
                query.createdAt.$lte = filters.endDate;
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
            this.logEntryModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.logEntryModel.countDocuments(query).exec(),
        ]);
        return { logs: logs, total };
    }
    async findOne(id) {
        return this.logEntryModel.findById(id).lean().exec();
    }
    async markAsResolved(id, resolvedBy, notes) {
        return this.logEntryModel.findByIdAndUpdate(id, {
            resolved: true,
            resolvedBy,
            resolvedAt: new Date(),
            notes,
        }, { new: true }).lean().exec();
    }
    async getStats(timeRange = '24h') {
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
            this.logEntryModel.aggregate([
                { $match: query },
                { $group: { _id: '$level', count: { $sum: 1 } } },
            ]).exec(),
            this.logEntryModel.aggregate([
                { $match: query },
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]).exec(),
            this.logEntryModel.aggregate([
                { $match: query },
                { $group: { _id: '$source', count: { $sum: 1 } } },
            ]).exec(),
            this.logEntryModel.countDocuments({ ...query, resolved: false }).exec(),
        ]);
        const errors = byLevel.find((item) => item._id === log_entry_schema_1.LogLevel.ERROR)?.count || 0;
        const warnings = byLevel.find((item) => item._id === log_entry_schema_1.LogLevel.WARN)?.count || 0;
        return {
            total,
            byLevel: byLevel.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byCategory: byCategory.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            bySource: bySource.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            errors,
            warnings,
            unresolved,
        };
    }
    async deleteOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.logEntryModel.deleteMany({
            createdAt: { $lt: cutoffDate },
            resolved: true,
        }).exec();
        return result.deletedCount;
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = LogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(log_entry_schema_1.LogEntry.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LogsService);
//# sourceMappingURL=logs.service.js.map