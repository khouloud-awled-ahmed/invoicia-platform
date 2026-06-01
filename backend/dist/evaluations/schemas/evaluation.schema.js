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
exports.EvaluationSchema = exports.Evaluation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Evaluation = class Evaluation {
};
exports.Evaluation = Evaluation;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Evaluation.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Evaluation.prototype, "employe", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Evaluation.prototype, "evaluateur", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Evaluation.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Evaluation.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Evaluation.prototype, "objectifs", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Evaluation.prototype, "commentaires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['draft', 'completed'], default: 'completed' }),
    __metadata("design:type", String)
], Evaluation.prototype, "statut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Evaluation.prototype, "tenantId", void 0);
exports.Evaluation = Evaluation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Evaluation);
exports.EvaluationSchema = mongoose_1.SchemaFactory.createForClass(Evaluation);
//# sourceMappingURL=evaluation.schema.js.map