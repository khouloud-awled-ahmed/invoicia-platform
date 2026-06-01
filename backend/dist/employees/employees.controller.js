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
var EmployeesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const employees_service_1 = require("./employees.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const universal_document_parser_service_1 = require("../document-parser/services/universal-document-parser.service");
const chatbot_service_1 = require("./chatbot.service");
let EmployeesController = EmployeesController_1 = class EmployeesController {
    constructor(employeesService, documentParser, chatbotService) {
        this.employeesService = employeesService;
        this.documentParser = documentParser;
        this.chatbotService = chatbotService;
        this.logger = new common_1.Logger(EmployeesController_1.name);
    }
    async create(createDto, user) {
        try {
            if (!createDto.firstName || !createDto.lastName || !createDto.email) {
                throw new common_1.BadRequestException('Les champs Prénom, Nom et Email sont obligatoires');
            }
            if (!user.tenantId) {
                throw new common_1.BadRequestException('Tenant ID requis');
            }
            return await this.employeesService.create(createDto, user.tenantId);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error.code === 11000) {
                throw new common_1.BadRequestException('Cet email est déjà utilisé. Veuillez en choisir un autre.');
            }
            throw new common_1.BadRequestException(error.message || 'Erreur lors de la création du collaborateur');
        }
    }
    async findAll(user) {
        try {
            if (!user.tenantId)
                throw new common_1.BadRequestException('Tenant ID requis');
            return await this.employeesService.findAll(user.tenantId);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Erreur lors de la récupération des employés');
        }
    }
    async getCVs(user) {
        if (!user.tenantId)
            throw new common_1.BadRequestException('Tenant ID requis');
        return await this.employeesService.findAllCVs(user.tenantId);
    }
    async findOne(id, user) {
        return await this.employeesService.findOne(id, user.tenantId);
    }
    async update(id, updateDto, user) {
        return await this.employeesService.update(id, updateDto, user.tenantId);
    }
    async remove(id, user) {
        return await this.employeesService.remove(id, user.tenantId);
    }
    async uploadCV(file, user) {
        if (!file)
            throw new common_1.BadRequestException('Aucun fichier fourni');
        if (!user.tenantId)
            throw new common_1.BadRequestException('Tenant ID requis');
        try {
            const result = await this.documentParser.analyze(file, 'CV', user.tenantId);
            const rawTextFallback = result.rawText || '';
            const emailFallback = rawTextFallback.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/)?.[1];
            const nameFallback = rawTextFallback.split('\n').slice(0, 3).filter(l => l.trim().length > 2 && l.trim().length < 60).join(' ').trim().substring(0, 60);
            if (result.status === 'LEARNING_NEEDED') {
                const saved = await this.employeesService.createCV(user.tenantId, {
                    fileName: file.originalname || 'document',
                    name: nameFallback || undefined,
                    email: emailFallback || undefined,
                    rawText: rawTextFallback,
                });
                const nameParts = (saved.name || '').trim().split(/\s+/);
                return {
                    id: saved._id.toString(),
                    fileName: saved.fileName,
                    name: saved.name,
                    email: saved.email,
                    rawText: saved.rawText?.substring(0, 500),
                    createdAt: saved.createdAt,
                    extractedData: {
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || '',
                        email: emailFallback || '',
                        phone: rawTextFallback.match(/(?:\+216|0)[0-9\s]{8,}/)?.[0]?.trim() || '',
                        title: '',
                        summary: '',
                        yearsOfExperience: 0,
                        city: '',
                        skills: [],
                        experiences: [],
                        education: [],
                        certifications: [],
                        languages: [],
                    },
                };
            }
            if (result.status !== 'SUCCESS' || !result.data) {
                throw new common_1.BadRequestException('Impossible de lire le contenu du fichier.');
            }
            const data = result.data;
            this.logger.log('CV AI data: ' + JSON.stringify(data));
            const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined;
            const rawText = typeof data.rawText === 'string' ? data.rawText : result.rawText || '';
            const emailFromText = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/)?.[1];
            const finalEmail = data.email || emailFromText || undefined;
            const nameFromText = rawText.split('\n').slice(0, 3).join(' ').trim().substring(0, 50);
            const finalName = name || nameFromText || undefined;
            const saved = await this.employeesService.createCV(user.tenantId, {
                fileName: file.originalname || 'document',
                name: finalName,
                email: finalEmail,
                rawText,
            });
            const nameParts = (saved.name || '').trim().split(/\s+/);
            return {
                id: saved._id.toString(),
                fileName: saved.fileName,
                name: saved.name,
                email: saved.email,
                rawText: saved.rawText?.substring(0, 500),
                createdAt: saved.createdAt,
                extractedData: {
                    firstName: data.firstName || nameParts[0] || '',
                    lastName: data.lastName || nameParts.slice(1).join(' ') || '',
                    email: finalEmail || '',
                    phone: data.phone || rawText.match(/(?:\+216|0)[0-9]{8}/)?.[0] || '',
                    title: data.title || '',
                    summary: data.summary || '',
                    yearsOfExperience: 0,
                    city: '',
                    skills: data.skills?.map((s) => ({ name: s, category: 'Technique', level: 3, years: 1 })) || [],
                    experiences: data.experiences || [],
                    education: data.education || [],
                    certifications: [],
                    languages: [],
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException(error.message || 'Erreur upload CV');
        }
    }
    async chatbot(body, user) {
        if (!user.tenantId)
            throw new common_1.BadRequestException('Tenant ID requis');
        const answer = await this.chatbotService.chat(body.question, user.tenantId);
        return { answer };
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('cvs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getCVs", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('upload-cv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "uploadCV", null);
__decorate([
    (0, common_1.Post)('chatbot'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "chatbot", null);
exports.EmployeesController = EmployeesController = EmployeesController_1 = __decorate([
    (0, common_1.Controller)('employees'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService,
        universal_document_parser_service_1.UniversalDocumentParserService,
        chatbot_service_1.ChatbotService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map