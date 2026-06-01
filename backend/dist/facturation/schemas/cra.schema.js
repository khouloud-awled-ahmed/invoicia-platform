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
exports.CraSchema = exports.Cra = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Cra = class Cra {
};
exports.Cra = Cra;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Intervenant' }),
    __metadata("design:type", String)
], Cra.prototype, "intervenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Cra.prototype, "intervenantName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Project' }),
    __metadata("design:type", String)
], Cra.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Cra.prototype, "projectName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Cra.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Cra.prototype, "hours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Cra.prototype, "rate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Cra.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['DRAFT', 'SUBMITTED', 'VALIDATED', 'INVOICED'],
        default: 'VALIDATED',
    }),
    __metadata("design:type", String)
], Cra.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], Cra.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Cra.prototype, "notes", void 0);
exports.Cra = Cra = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Cra);
exports.CraSchema = mongoose_1.SchemaFactory.createForClass(Cra);
exports.CraSchema.index({ tenantId: 1, status: 1 });
exports.CraSchema.index({ tenantId: 1, intervenantId: 1 });
exports.CraSchema.index({ tenantId: 1, projectId: 1 });
//# sourceMappingURL=cra.schema.js.map