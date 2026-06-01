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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_assignment_schema_1 = require("./schemas/project-assignment.schema");
const project_schema_1 = require("./schemas/project.schema");
const user_schema_1 = require("../users/schemas/user.schema");
let ProjectAssignmentsService = class ProjectAssignmentsService {
    constructor(assignmentModel, projectModel, userModel) {
        this.assignmentModel = assignmentModel;
        this.projectModel = projectModel;
        this.userModel = userModel;
    }
    async create(userId, projectId, startDate, tenantId, endDate, validatorId, dailyRate) {
        const project = await this.projectModel.findById(projectId).exec();
        if (!project || project.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Project not found');
        }
        const user = await this.userModel.findById(userId).exec();
        if (!user || user.tenantId !== tenantId) {
            throw new common_1.NotFoundException('User not found');
        }
        const conflictingAssignment = await this.assignmentModel
            .findOne({
            userId,
            projectId,
            status: 'ACTIVE',
            $or: [
                { endDate: { $gte: startDate } },
                { endDate: null },
            ],
        })
            .exec();
        if (conflictingAssignment) {
            throw new common_1.BadRequestException('User is already assigned to this project during this period');
        }
        let validatorName;
        if (validatorId) {
            const validator = await this.userModel.findById(validatorId).exec();
            validatorName = validator?.name;
        }
        const assignment = new this.assignmentModel({
            userId,
            projectId,
            projectName: project.name,
            startDate,
            endDate,
            validatorId,
            validatorName,
            dailyRate: dailyRate || 0,
            status: 'ACTIVE',
            tenantId,
        });
        return assignment.save();
    }
    async findByUser(userId, tenantId, includeEnded = false) {
        const query = { userId, tenantId };
        if (!includeEnded) {
            query.status = 'ACTIVE';
        }
        return this.assignmentModel.find(query).sort({ startDate: -1 }).exec();
    }
    async findByProject(projectId, tenantId) {
        return this.assignmentModel
            .find({ projectId, tenantId })
            .populate('userId', 'name email')
            .populate('validatorId', 'name email')
            .sort({ startDate: -1 })
            .exec();
    }
    async update(id, updateDto, tenantId) {
        const assignment = await this.assignmentModel.findOne({ _id: id, tenantId }).exec();
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (updateDto.validatorId) {
            const validator = await this.userModel.findById(updateDto.validatorId).exec();
            updateDto['validatorName'] = validator?.name;
        }
        Object.assign(assignment, updateDto);
        return assignment.save();
    }
    async endAssignment(id, tenantId) {
        return this.update(id, { status: 'ENDED', endDate: new Date() }, tenantId);
    }
    async findActiveAssignmentsForDate(userId, date, tenantId) {
        return this.assignmentModel
            .find({
            userId,
            tenantId,
            status: 'ACTIVE',
            startDate: { $lte: date },
            $or: [{ endDate: { $gte: date } }, { endDate: null }],
        })
            .populate('projectId', 'name code type')
            .exec();
    }
};
exports.ProjectAssignmentsService = ProjectAssignmentsService;
exports.ProjectAssignmentsService = ProjectAssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_assignment_schema_1.ProjectAssignment.name)),
    __param(1, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ProjectAssignmentsService);
//# sourceMappingURL=project-assignments.service.js.map