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
exports.ProjectAssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const project_assignments_service_1 = require("./project-assignments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const common_2 = require("@nestjs/common");
let ProjectAssignmentsController = class ProjectAssignmentsController {
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    async create(createDto, user) {
        if (!user.tenantId) {
            throw new common_2.BadRequestException('Tenant ID requis');
        }
        if (!['TENANT_ADMIN', 'RH', 'MANAGER'].includes(user.role)) {
            throw new common_2.BadRequestException('Accès réservé aux administrateurs et RH');
        }
        return this.assignmentsService.create(createDto.userId, createDto.projectId, new Date(createDto.startDate), user.tenantId, createDto.endDate ? new Date(createDto.endDate) : undefined, createDto.validatorId, createDto.dailyRate);
    }
    async getMyAssignments(user) {
        if (!user.tenantId) {
            throw new common_2.BadRequestException('Tenant ID requis');
        }
        return this.assignmentsService.findByUser(user.userId || user._id, user.tenantId);
    }
    async getByProject(projectId, user) {
        if (!user.tenantId) {
            throw new common_2.BadRequestException('Tenant ID requis');
        }
        return this.assignmentsService.findByProject(projectId, user.tenantId);
    }
    async update(id, updateDto, user) {
        if (!user.tenantId) {
            throw new common_2.BadRequestException('Tenant ID requis');
        }
        if (!['TENANT_ADMIN', 'RH', 'MANAGER'].includes(user.role)) {
            throw new common_2.BadRequestException('Accès réservé aux administrateurs et RH');
        }
        return this.assignmentsService.update(id, {
            ...updateDto,
            endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
        }, user.tenantId);
    }
    async endAssignment(id, user) {
        if (!user.tenantId) {
            throw new common_2.BadRequestException('Tenant ID requis');
        }
        if (!['TENANT_ADMIN', 'RH', 'MANAGER'].includes(user.role)) {
            throw new common_2.BadRequestException('Accès réservé aux administrateurs et RH');
        }
        return this.assignmentsService.endAssignment(id, user.tenantId);
    }
};
exports.ProjectAssignmentsController = ProjectAssignmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-assignments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "getMyAssignments", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "getByProject", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "endAssignment", null);
exports.ProjectAssignmentsController = ProjectAssignmentsController = __decorate([
    (0, common_1.Controller)('projects/assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [project_assignments_service_1.ProjectAssignmentsService])
], ProjectAssignmentsController);
//# sourceMappingURL=project-assignments.controller.js.map