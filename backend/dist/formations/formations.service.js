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
exports.FormationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const formation_schema_1 = require("./schemas/formation.schema");
let FormationsService = class FormationsService {
    constructor(formationModel) {
        this.formationModel = formationModel;
    }
    async create(dto, tenantId) {
        return new this.formationModel({ ...dto, tenantId }).save();
    }
    async findAll(tenantId) {
        return this.formationModel.find({ tenantId }).sort({ createdAt: -1 }).exec();
    }
    async updateStatus(id, statut, tenantId) {
        const f = await this.formationModel.findOneAndUpdate({ _id: id, tenantId }, { statut }, { new: true });
        if (!f)
            throw new common_1.NotFoundException();
        return f;
    }
    async remove(id, tenantId) {
        const f = await this.formationModel.findOneAndDelete({ _id: id, tenantId });
        if (!f)
            throw new common_1.NotFoundException();
    }
};
exports.FormationsService = FormationsService;
exports.FormationsService = FormationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(formation_schema_1.Formation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FormationsService);
//# sourceMappingURL=formations.service.js.map