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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const supplier_schema_1 = require("../../../suppliers/schemas/supplier.schema");
let SuppliersService = class SuppliersService {
    constructor(supplierModel) {
        this.supplierModel = supplierModel;
    }
    async getStats(tenantId) {
        const suppliers = await this.supplierModel.find({ tenantId }).exec();
        const active = suppliers.filter((s) => s.status === 'active').length;
        const inactive = suppliers.filter((s) => s.status === 'inactive').length;
        const totalIntervenants = suppliers.reduce((sum, s) => sum + (s.intervenantIds?.length || 0), 0);
        return {
            total: suppliers.length,
            active,
            inactive,
            totalIntervenants,
        };
    }
    async create(createDto, tenantId) {
        const supplier = new this.supplierModel({ ...createDto, tenantId });
        return supplier.save();
    }
    async findAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { businessName: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { matriculeFiscal: { $regex: filters.search, $options: 'i' } },
            ];
        }
        return this.supplierModel.find(query).sort({ name: 1 }).exec();
    }
    async findOne(id, tenantId) {
        const supplier = await this.supplierModel.findOne({ _id: id, tenantId }).exec();
        if (!supplier) {
            throw new common_1.NotFoundException(`Fournisseur #${id} introuvable`);
        }
        return supplier;
    }
    async update(id, updateDto, tenantId) {
        const updated = await this.supplierModel
            .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Fournisseur #${id} introuvable`);
        }
        return updated;
    }
    async remove(id, tenantId) {
        const result = await this.supplierModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Fournisseur #${id} introuvable`);
        }
    }
    async toggleStatus(id, tenantId) {
        const supplier = await this.findOne(id, tenantId);
        const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
        const updated = await this.supplierModel
            .findOneAndUpdate({ _id: id, tenantId }, { status: newStatus }, { new: true })
            .exec();
        return updated;
    }
    async addIntervenant(id, intervenantId, tenantId) {
        const updated = await this.supplierModel
            .findOneAndUpdate({ _id: id, tenantId }, { $addToSet: { intervenantIds: intervenantId } }, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException(`Fournisseur #${id} introuvable`);
        return updated;
    }
    async removeIntervenant(id, intervenantId, tenantId) {
        const updated = await this.supplierModel
            .findOneAndUpdate({ _id: id, tenantId }, { $pull: { intervenantIds: intervenantId } }, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException(`Fournisseur #${id} introuvable`);
        return updated;
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(supplier_schema_1.Supplier.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map