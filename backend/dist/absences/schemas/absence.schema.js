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
exports.AbsenceSchema = exports.Absence = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Absence = class Absence {
};
exports.Absence = Absence;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Employee' }),
    __metadata("design:type", String)
], Absence.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Absence.prototype, "employeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['CP', 'RTT', 'MALADIE', 'MATERNITE', 'VOYAGE', 'AUTRE'],
    }),
    __metadata("design:type", String)
], Absence.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Absence.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Absence.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], Absence.prototype, "days", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Absence.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Absence.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Absence.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Absence.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Tenant' }),
    __metadata("design:type", String)
], Absence.prototype, "tenantId", void 0);
exports.Absence = Absence = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Absence);
exports.AbsenceSchema = mongoose_1.SchemaFactory.createForClass(Absence);
exports.AbsenceSchema.index({ tenantId: 1, employeeId: 1 });
exports.AbsenceSchema.index({ tenantId: 1, status: 1 });
exports.AbsenceSchema.index({ tenantId: 1, startDate: -1 });
//# sourceMappingURL=absence.schema.js.map