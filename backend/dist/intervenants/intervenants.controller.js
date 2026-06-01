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
exports.IntervenantsController = void 0;
const common_1 = require("@nestjs/common");
const intervenants_service_1 = require("./intervenants.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let IntervenantsController = class IntervenantsController {
    constructor(intervenantsService) {
        this.intervenantsService = intervenantsService;
    }
    create(createDto, user) {
        return this.intervenantsService.create(createDto, user.tenantId);
    }
    findAll(filters, user) {
        return this.intervenantsService.findAll(user.tenantId, filters);
    }
    findOne(id, user) {
        return this.intervenantsService.findOne(id, user.tenantId);
    }
    update(id, updateDto, user) {
        return this.intervenantsService.update(id, updateDto, user.tenantId);
    }
    remove(id, user) {
        return this.intervenantsService.remove(id, user.tenantId);
    }
    generateCRAToken(id, user) {
        return this.intervenantsService.generateCRAAccessToken(id, user.tenantId);
    }
    async findByToken(token) {
        const intervenant = await this.intervenantsService.findByCRAToken(token);
        if (!intervenant) {
            throw new common_1.NotFoundException('Token invalide ou intervenant non trouvé');
        }
        return {
            id: intervenant._id?.toString(),
            firstName: intervenant.firstName,
            lastName: intervenant.lastName,
            email: intervenant.email,
            type: intervenant.type,
            supplierName: intervenant.supplierName,
        };
    }
};
exports.IntervenantsController = IntervenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IntervenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IntervenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntervenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], IntervenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntervenantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/generate-cra-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntervenantsController.prototype, "generateCRAToken", null);
__decorate([
    (0, common_1.Get)('public/by-token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntervenantsController.prototype, "findByToken", null);
exports.IntervenantsController = IntervenantsController = __decorate([
    (0, common_1.Controller)('intervenants'),
    __metadata("design:paramtypes", [intervenants_service_1.IntervenantsService])
], IntervenantsController);
//# sourceMappingURL=intervenants.controller.js.map