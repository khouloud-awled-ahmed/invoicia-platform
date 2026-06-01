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
exports.GEDController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const ged_service_1 = require("./ged.service");
const ged_initialization_service_1 = require("./ged-initialization.service");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const create_classification_rule_dto_1 = require("./dto/create-classification-rule.dto");
let GEDController = class GEDController {
    constructor(gedService, initializationService) {
        this.gedService = gedService;
        this.initializationService = initializationService;
    }
    async createFolder(createFolderDto, user) {
        return this.gedService.createFolder(user.tenantId, createFolderDto.name, createFolderDto.parentId, createFolderDto.documentType, createFolderDto.description);
    }
    async getFolderTree(user, rootFolderId) {
        return this.gedService.getFolderTree(user.tenantId, rootFolderId);
    }
    async getFolder(id, user) {
        return { id, message: 'Folder details endpoint' };
    }
    async updateFolder(id, updates, user) {
        return this.gedService.updateFolder(id, user.tenantId, updates);
    }
    async moveFolder(id, body, user) {
        return this.gedService.moveFolder(id, body.newParentId, user.tenantId);
    }
    async deleteFolder(id, force, user) {
        return this.gedService.deleteFolder(id, user.tenantId, force === 'true');
    }
    async uploadDocument(file, folderId, documentType, metadata, user) {
        return this.gedService.uploadDocument(file, user.tenantId, folderId, documentType, metadata, user.userId);
    }
    async getDocuments(folderId, documentType, archived, user) {
        return this.gedService.getDocuments(user.tenantId, folderId, documentType, archived === 'true' ? true : archived === 'false' ? false : undefined);
    }
    async moveDocument(id, body, user) {
        return this.gedService.moveDocument(id, body.newFolderId, user.tenantId);
    }
    async deleteDocument(id, user) {
        return this.gedService.deleteDocument(id, user.tenantId);
    }
    async createClassificationRule(createRuleDto, user) {
        return this.gedService.createClassificationRule(user.tenantId, createRuleDto);
    }
    async getClassificationRules(user) {
        return this.gedService.getClassificationRules(user.tenantId);
    }
    async updateClassificationRule(id, updates, user) {
        return this.gedService.updateClassificationRule(id, user.tenantId, updates);
    }
    async deleteClassificationRule(id, user) {
        return this.gedService.deleteClassificationRule(id, user.tenantId);
    }
    async initializeStructure(user) {
        await this.initializationService.initializeDefaultStructure(user.tenantId);
        return { message: 'GED structure initialized successfully' };
    }
};
exports.GEDController = GEDController;
__decorate([
    (0, common_1.Post)('folders'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Get)('folders/tree'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('rootFolderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "getFolderTree", null);
__decorate([
    (0, common_1.Get)('folders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "getFolder", null);
__decorate([
    (0, common_1.Patch)('folders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Put)('folders/:id/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "moveFolder", null);
__decorate([
    (0, common_1.Delete)('folders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('force')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Post)('documents/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('folderId')),
    __param(2, (0, common_1.Query)('documentType')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents'),
    __param(0, (0, common_1.Query)('folderId')),
    __param(1, (0, common_1.Query)('documentType')),
    __param(2, (0, common_1.Query)('archived')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Put)('documents/:id/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "moveDocument", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Post)('classification-rules'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_classification_rule_dto_1.CreateClassificationRuleDto, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "createClassificationRule", null);
__decorate([
    (0, common_1.Get)('classification-rules'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "getClassificationRules", null);
__decorate([
    (0, common_1.Patch)('classification-rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "updateClassificationRule", null);
__decorate([
    (0, common_1.Delete)('classification-rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "deleteClassificationRule", null);
__decorate([
    (0, common_1.Post)('initialize'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GEDController.prototype, "initializeStructure", null);
exports.GEDController = GEDController = __decorate([
    (0, common_1.Controller)('ged'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ged_service_1.GEDService,
        ged_initialization_service_1.GEDInitializationService])
], GEDController);
//# sourceMappingURL=ged.controller.js.map