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
exports.ProjectAssignmentSchema = exports.ProjectAssignment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ProjectAssignment = class ProjectAssignment {
};
exports.ProjectAssignment = ProjectAssignment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'User' }),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Project' }),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "projectName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], ProjectAssignment.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ProjectAssignment.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'User' }),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "validatorId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "validatorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ProjectAssignment.prototype, "dailyRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['ACTIVE', 'ENDED', 'CANCELLED'],
        default: 'ACTIVE',
    }),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], ProjectAssignment.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ProjectAssignment.prototype, "metadata", void 0);
exports.ProjectAssignment = ProjectAssignment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProjectAssignment);
exports.ProjectAssignmentSchema = mongoose_1.SchemaFactory.createForClass(ProjectAssignment);
exports.ProjectAssignmentSchema.index({ userId: 1, status: 1 });
exports.ProjectAssignmentSchema.index({ projectId: 1, status: 1 });
exports.ProjectAssignmentSchema.index({ tenantId: 1, userId: 1 });
//# sourceMappingURL=project-assignment.schema.js.map