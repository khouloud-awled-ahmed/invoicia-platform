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
exports.SocialOrgSchema = exports.SocialOrg = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let SocialOrg = class SocialOrg {
};
exports.SocialOrg = SocialOrg;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SocialOrg.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SocialOrg.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SocialOrg.prototype, "contractId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SocialOrg.prototype, "affiliationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Tenant', required: true }),
    __metadata("design:type", String)
], SocialOrg.prototype, "tenantId", void 0);
exports.SocialOrg = SocialOrg = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SocialOrg);
exports.SocialOrgSchema = mongoose_1.SchemaFactory.createForClass(SocialOrg);
exports.SocialOrgSchema.index({ tenantId: 1 });
exports.SocialOrgSchema.index({ tenantId: 1, type: 1 });
//# sourceMappingURL=social-org.schema.js.map