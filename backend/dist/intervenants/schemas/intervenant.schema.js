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
exports.IntervenantSchema = exports.Intervenant = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Intervenant = class Intervenant {
};
exports.Intervenant = Intervenant;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Intervenant.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Intervenant.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], Intervenant.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Intervenant.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['salarie', 'externe'],
        required: true,
    }),
    __metadata("design:type", String)
], Intervenant.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Employee' }),
    __metadata("design:type", String)
], Intervenant.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Supplier' }),
    __metadata("design:type", String)
], Intervenant.prototype, "supplierId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Intervenant.prototype, "supplierName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Intervenant.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['active', 'inactive'],
        default: 'active',
    }),
    __metadata("design:type", String)
], Intervenant.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Intervenant.prototype, "canSubmitCRA", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Intervenant.prototype, "craAccessToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], Intervenant.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Intervenant.prototype, "metadata", void 0);
exports.Intervenant = Intervenant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Intervenant);
exports.IntervenantSchema = mongoose_1.SchemaFactory.createForClass(Intervenant);
exports.IntervenantSchema.index({ tenantId: 1, email: 1 });
exports.IntervenantSchema.index({ tenantId: 1, type: 1 });
exports.IntervenantSchema.index({ tenantId: 1, employeeId: 1 });
exports.IntervenantSchema.index({ tenantId: 1, supplierId: 1 });
//# sourceMappingURL=intervenant.schema.js.map