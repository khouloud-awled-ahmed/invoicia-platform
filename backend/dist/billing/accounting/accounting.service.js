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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const accounting_entry_schema_1 = require("../../accounting/schemas/accounting-entry.schema");
let AccountingService = class AccountingService {
    constructor(accountingEntryModel) {
        this.accountingEntryModel = accountingEntryModel;
    }
    async create(createDto, tenantId) {
        const entry = new this.accountingEntryModel({
            ...createDto,
            tenantId,
            date: new Date(createDto.date),
        });
        return entry.save();
    }
    async findAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.account)
            query.account = filters.account;
        return this.accountingEntryModel.find(query).sort({ date: -1 }).exec();
    }
    async findOne(id, tenantId) {
        const entry = await this.accountingEntryModel.findOne({ _id: id, tenantId }).exec();
        if (!entry) {
            throw new common_1.NotFoundException(`Accounting entry with ID ${id} not found`);
        }
        return entry;
    }
    async update(id, updateDto, tenantId) {
        const updated = await this.accountingEntryModel
            .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Accounting entry with ID ${id} not found`);
        }
        return updated;
    }
    async remove(id, tenantId) {
        const result = await this.accountingEntryModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Accounting entry with ID ${id} not found`);
        }
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(accounting_entry_schema_1.AccountingEntry.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map