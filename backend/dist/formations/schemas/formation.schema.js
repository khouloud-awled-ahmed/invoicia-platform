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
exports.FormationSchema = exports.Formation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Formation = class Formation {
};
exports.Formation = Formation;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Formation.prototype, "titre", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Formation.prototype, "organisme", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Formation.prototype, "dateDebut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Formation.prototype, "duree", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Formation.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Formation.prototype, "employe", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Formation.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['planifiee', 'en_cours', 'terminee', 'annulee'], default: 'planifiee' }),
    __metadata("design:type", String)
], Formation.prototype, "statut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Formation.prototype, "tenantId", void 0);
exports.Formation = Formation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Formation);
exports.FormationSchema = mongoose_1.SchemaFactory.createForClass(Formation);
//# sourceMappingURL=formation.schema.js.map