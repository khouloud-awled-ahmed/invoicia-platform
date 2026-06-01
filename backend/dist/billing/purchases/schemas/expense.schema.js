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
exports.ExpenseSchema = exports.Expense = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Expense = class Expense {
};
exports.Expense = Expense;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Expense.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Expense.prototype, "supplier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Expense.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Expense.prototype, "amountHT", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Expense.prototype, "amountTVA", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Expense.prototype, "amountTTC", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'EUR' }),
    __metadata("design:type", String)
], Expense.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['pending', 'verified', 'exported', 'rejected'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Expense.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Expense.prototype, "documentUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Expense.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Expense.prototype, "extractionConfidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Expense.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Expense.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Expense.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Expense.prototype, "isDuplicate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Expense.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], Expense.prototype, "tenantId", void 0);
exports.Expense = Expense = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Expense);
exports.ExpenseSchema = mongoose_1.SchemaFactory.createForClass(Expense);
exports.ExpenseSchema.index({ tenantId: 1, date: -1 });
exports.ExpenseSchema.index({ tenantId: 1, status: 1 });
//# sourceMappingURL=expense.schema.js.map