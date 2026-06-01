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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingEntrySchema = exports.AccountingEntry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let AccountingEntry = class AccountingEntry {
};
exports.AccountingEntry = AccountingEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], AccountingEntry.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AccountingEntry.prototype, "account", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AccountingEntry.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], AccountingEntry.prototype, "debit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], AccountingEntry.prototype, "credit", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountingEntry.prototype, "journal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountingEntry.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AccountingEntry.prototype, "validated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AccountingEntry.prototype, "locked", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], AccountingEntry.prototype, "tenantId", void 0);
exports.AccountingEntry = AccountingEntry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AccountingEntry);
exports.AccountingEntrySchema = mongoose_1.SchemaFactory.createForClass(AccountingEntry);
exports.AccountingEntrySchema.index({ tenantId: 1, date: -1 });
exports.AccountingEntrySchema.index({ tenantId: 1, account: 1 });
//# sourceMappingURL=accounting-entry.schema.js.map