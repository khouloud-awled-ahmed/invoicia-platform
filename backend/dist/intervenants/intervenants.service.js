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
var IntervenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervenantsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const intervenant_schema_1 = require("./schemas/intervenant.schema");
const user_sync_service_1 = require("../users/user-sync.service");
let IntervenantsService = IntervenantsService_1 = class IntervenantsService {
    constructor(intervenantModel, userSyncService) {
        this.intervenantModel = intervenantModel;
        this.userSyncService = userSyncService;
        this.logger = new common_1.Logger(IntervenantsService_1.name);
    }
    async create(createDto, tenantId) {
        const intervenant = new this.intervenantModel({
            ...createDto,
            tenantId,
            email: createDto.email?.toLowerCase(),
        });
        const savedIntervenant = await intervenant.save();
        if (savedIntervenant.type === 'externe' && savedIntervenant.canSubmitCRA) {
            try {
                const user = await this.userSyncService.createUserFromIntervenant(savedIntervenant.email, savedIntervenant.firstName, savedIntervenant.lastName, tenantId);
                await this.intervenantModel
                    .findByIdAndUpdate(savedIntervenant._id, {
                    $set: { metadata: { ...savedIntervenant.metadata, userId: user._id.toString() } },
                })
                    .exec();
            }
            catch (error) {
                this.logger.error('Erreur lors de la création automatique du User pour intervenant:', error);
            }
        }
        return savedIntervenant;
    }
    async findAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.type)
            query.type = filters.type;
        if (filters?.status)
            query.status = filters.status;
        return this.intervenantModel.find(query).sort({ lastName: 1, firstName: 1 }).exec();
    }
    async findOne(id, tenantId) {
        const intervenant = await this.intervenantModel.findOne({ _id: id, tenantId }).exec();
        if (!intervenant) {
            throw new common_1.NotFoundException(`Intervenant with ID ${id} not found`);
        }
        return intervenant;
    }
    async findByEmail(email, tenantId) {
        return this.intervenantModel.findOne({ email: email.toLowerCase(), tenantId }).exec();
    }
    async update(id, updateDto, tenantId) {
        const updated = await this.intervenantModel
            .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Intervenant with ID ${id} not found`);
        }
        return updated;
    }
    async remove(id, tenantId) {
        const result = await this.intervenantModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Intervenant with ID ${id} not found`);
        }
    }
    async generateCRAAccessToken(id, tenantId) {
        const intervenant = await this.findOne(id, tenantId);
        const token = `cra_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await this.intervenantModel
            .findOneAndUpdate({ _id: id, tenantId }, { craAccessToken: token, canSubmitCRA: true }, { new: true })
            .exec();
        return token;
    }
    async findByCRAToken(token) {
        return this.intervenantModel
            .findOne({
            craAccessToken: token,
            canSubmitCRA: true,
            status: 'active',
        })
            .exec();
    }
};
exports.IntervenantsService = IntervenantsService;
exports.IntervenantsService = IntervenantsService = IntervenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(intervenant_schema_1.Intervenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_sync_service_1.UserSyncService])
], IntervenantsService);
//# sourceMappingURL=intervenants.service.js.map