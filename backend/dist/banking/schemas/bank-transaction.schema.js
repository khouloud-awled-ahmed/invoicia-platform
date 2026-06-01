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
exports.BankTransactionSchema = exports.BankTransaction = exports.BankTransactionStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var BankTransactionStatus;
(function (BankTransactionStatus) {
    BankTransactionStatus["UNRECONCILED"] = "UNRECONCILED";
    BankTransactionStatus["RECONCILED"] = "RECONCILED";
})(BankTransactionStatus || (exports.BankTransactionStatus = BankTransactionStatus = {}));
let BankTransaction = class BankTransaction {
};
exports.BankTransaction = BankTransaction;
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], BankTransaction.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'BankAccount', required: true }),
    __metadata("design:type", String)
], BankTransaction.prototype, "bankAccountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], BankTransaction.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BankTransaction.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], BankTransaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'EUR' }),
    __metadata("design:type", String)
], BankTransaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['debit', 'credit'], required: true }),
    __metadata("design:type", String)
], BankTransaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BankTransactionStatus, default: BankTransactionStatus.UNRECONCILED }),
    __metadata("design:type", String)
], BankTransaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BankTransaction.prototype, "reconciledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankTransaction.prototype, "targetType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankTransaction.prototype, "targetId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankTransaction.prototype, "rawLine", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankTransaction.prototype, "category", void 0);
exports.BankTransaction = BankTransaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BankTransaction);
exports.BankTransactionSchema = mongoose_1.SchemaFactory.createForClass(BankTransaction);
exports.BankTransactionSchema.index({ tenantId: 1, bankAccountId: 1, date: -1 });
exports.BankTransactionSchema.index({ tenantId: 1, status: 1 });
//# sourceMappingURL=bank-transaction.schema.js.map