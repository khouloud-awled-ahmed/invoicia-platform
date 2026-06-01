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
exports.BankConnectionSchema = exports.BankConnection = exports.BankingProvider = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var BankingProvider;
(function (BankingProvider) {
    BankingProvider["GOCARDLESS"] = "GOCARDLESS";
    BankingProvider["BRIDGE"] = "BRIDGE";
})(BankingProvider || (exports.BankingProvider = BankingProvider = {}));
let BankConnection = class BankConnection {
};
exports.BankConnection = BankConnection;
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], BankConnection.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BankingProvider }),
    __metadata("design:type", String)
], BankConnection.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BankConnection.prototype, "institutionId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankConnection.prototype, "institutionName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BankConnection.prototype, "accessToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BankConnection.prototype, "refreshToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BankConnection.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], BankConnection.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BankConnection.prototype, "lastSyncAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], BankConnection.prototype, "metadata", void 0);
exports.BankConnection = BankConnection = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BankConnection);
exports.BankConnectionSchema = mongoose_1.SchemaFactory.createForClass(BankConnection);
exports.BankConnectionSchema.index({ tenantId: 1 });
exports.BankConnectionSchema.index({ tenantId: 1, provider: 1 });
exports.BankConnectionSchema.index({ institutionId: 1 });
//# sourceMappingURL=bank-connection.schema.js.map