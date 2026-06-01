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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogEntrySchema = exports.LogEntry = exports.LogSource = exports.LogCategory = exports.LogLevel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var LogCategory;
(function (LogCategory) {
    LogCategory["TECHNICAL"] = "technical";
    LogCategory["USER_ACTION"] = "user_action";
    LogCategory["SYSTEM"] = "system";
    LogCategory["SECURITY"] = "security";
    LogCategory["PERFORMANCE"] = "performance";
    LogCategory["DATABASE"] = "database";
    LogCategory["API"] = "api";
})(LogCategory || (exports.LogCategory = LogCategory = {}));
var LogSource;
(function (LogSource) {
    LogSource["BACKEND"] = "backend";
    LogSource["FRONTEND"] = "frontend";
    LogSource["DATABASE"] = "database";
    LogSource["EXTERNAL_API"] = "external_api";
})(LogSource || (exports.LogSource = LogSource = {}));
let LogEntry = class LogEntry {
};
exports.LogEntry = LogEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: LogLevel }),
    __metadata("design:type", String)
], LogEntry.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: LogCategory }),
    __metadata("design:type", String)
], LogEntry.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: LogSource }),
    __metadata("design:type", String)
], LogEntry.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LogEntry.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], LogEntry.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], LogEntry.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LogEntry.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], LogEntry.prototype, "resolved", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LogEntry.prototype, "resolvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LogEntry.prototype, "resolvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LogEntry.prototype, "notes", void 0);
exports.LogEntry = LogEntry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LogEntry);
exports.LogEntrySchema = mongoose_1.SchemaFactory.createForClass(LogEntry);
exports.LogEntrySchema.index({ level: 1, createdAt: -1 });
exports.LogEntrySchema.index({ category: 1, createdAt: -1 });
exports.LogEntrySchema.index({ source: 1, createdAt: -1 });
exports.LogEntrySchema.index({ 'metadata.tenantId': 1, createdAt: -1 });
exports.LogEntrySchema.index({ 'metadata.userId': 1, createdAt: -1 });
exports.LogEntrySchema.index({ resolved: 1, createdAt: -1 });
exports.LogEntrySchema.index({ createdAt: -1 });
//# sourceMappingURL=log-entry.schema.js.map