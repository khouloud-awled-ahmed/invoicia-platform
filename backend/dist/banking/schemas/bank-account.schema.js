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
exports.BankAccountSchema = exports.BankAccount = exports.BankAccountProvider = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var BankAccountProvider;
(function (BankAccountProvider) {
    BankAccountProvider["MANUAL"] = "MANUAL";
    BankAccountProvider["GOCARDLESS"] = "GOCARDLESS";
    BankAccountProvider["BRIDGE"] = "BRIDGE";
})(BankAccountProvider || (exports.BankAccountProvider = BankAccountProvider = {}));
let BankAccount = class BankAccount {
};
exports.BankAccount = BankAccount;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankAccount.prototype, "iban", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankAccount.prototype, "bic", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankAccount.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankAccount.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BankAccountProvider, default: BankAccountProvider.MANUAL }),
    __metadata("design:type", String)
], BankAccount.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankAccount.prototype, "externalId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], BankAccount.prototype, "balance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'EUR' }),
    __metadata("design:type", String)
], BankAccount.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BankAccount.prototype, "lastSyncAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'BankConnection' }),
    __metadata("design:type", String)
], BankAccount.prototype, "connectionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], BankAccount.prototype, "isActive", void 0);
exports.BankAccount = BankAccount = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BankAccount);
exports.BankAccountSchema = mongoose_1.SchemaFactory.createForClass(BankAccount);
exports.BankAccountSchema.index({ tenantId: 1 });
exports.BankAccountSchema.index({ tenantId: 1, provider: 1 });
exports.BankAccountSchema.index({ externalId: 1 });
exports.BankAccountSchema.index({ connectionId: 1 });
//# sourceMappingURL=bank-account.schema.js.map