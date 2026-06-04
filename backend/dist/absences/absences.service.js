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
exports.AbsencesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const absence_schema_1 = require("./schemas/absence.schema");
let AbsencesService = class AbsencesService {
    constructor(absenceModel) {
        this.absenceModel = absenceModel;
    }
    async create(dto, tenantId) {
        if (!dto.employeeId || !dto.type || !dto.startDate || !dto.endDate) {
            throw new common_1.BadRequestException('Champs obligatoires manquants');
        }
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (endDate < startDate) {
            throw new common_1.BadRequestException('La date de fin doit être après la date de début');
        }
        const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const absence = new this.absenceModel({
            ...dto,
            tenantId,
            startDate,
            endDate,
            days,
            status: 'pending',
        });
        return absence.save();
    }
    async findAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.employeeId)
            query.employeeId = filters.employeeId;
        if (filters?.type)
            query.type = filters.type;
        return this.absenceModel.find(query).sort({ startDate: -1 }).exec();
    }
    async findOne(id, tenantId) {
        const absence = await this.absenceModel.findOne({ _id: id, tenantId }).exec();
        if (!absence)
            throw new common_1.NotFoundException(`Absence #${id} introuvable`);
        return absence;
    }
    async update(id, dto, tenantId) {
        const updated = await this.absenceModel
            .findOneAndUpdate({ _id: id, tenantId }, dto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException(`Absence #${id} introuvable`);
        return updated;
    }
    async remove(id, tenantId) {
        const result = await this.absenceModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result)
            throw new common_1.NotFoundException(`Absence #${id} introuvable`);
    }
    async approve(id, tenantId, approvedBy) {
        const absence = await this.findOne(id, tenantId);
        if (absence.status !== 'pending') {
            throw new common_1.BadRequestException('Seules les demandes en attente peuvent être approuvées');
        }
        const updated = await this.absenceModel
            .findOneAndUpdate({ _id: id, tenantId }, { status: 'approved', approvedBy, approvedAt: new Date() }, { new: true })
            .exec();
        return updated;
    }
    async reject(id, tenantId) {
        const absence = await this.findOne(id, tenantId);
        if (absence.status !== 'pending') {
            throw new common_1.BadRequestException('Seules les demandes en attente peuvent être refusées');
        }
        const updated = await this.absenceModel
            .findOneAndUpdate({ _id: id, tenantId }, { status: 'rejected' }, { new: true })
            .exec();
        return updated;
    }
    async getStats(tenantId) {
        const absences = await this.absenceModel.find({ tenantId }).exec();
        const pending = absences.filter((a) => a.status === 'pending').length;
        const approved = absences.filter((a) => a.status === 'approved').length;
        const rejected = absences.filter((a) => a.status === 'rejected').length;
        const totalDays = absences
            .filter((a) => a.status === 'approved')
            .reduce((sum, a) => sum + a.days, 0);
        const byType = {};
        for (const a of absences.filter((ab) => ab.status === 'approved')) {
            byType[a.type] = (byType[a.type] || 0) + a.days;
        }
        return {
            total: absences.length,
            pending,
            approved,
            rejected,
            totalDays,
            byType,
        };
    }
};
exports.AbsencesService = AbsencesService;
exports.AbsencesService = AbsencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(absence_schema_1.Absence.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AbsencesService);
//# sourceMappingURL=absences.service.js.map