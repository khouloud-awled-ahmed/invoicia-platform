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
exports.OffreSchema = exports.Offre = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Offre = class Offre {
};
exports.Offre = Offre;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Offre.prototype, "titre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Offre.prototype, "departement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Offre.prototype, "typeContrat", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Offre.prototype, "localisation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Offre.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['ouverte', 'en_cours', 'pourvue', 'annulee'], default: 'ouverte' }),
    __metadata("design:type", String)
], Offre.prototype, "statut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Offre.prototype, "candidatures", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Offre.prototype, "datePublication", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Offre.prototype, "tenantId", void 0);
exports.Offre = Offre = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Offre);
exports.OffreSchema = mongoose_1.SchemaFactory.createForClass(Offre);
//# sourceMappingURL=offre.schema.js.map