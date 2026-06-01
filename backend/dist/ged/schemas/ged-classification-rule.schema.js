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
exports.GEDClassificationRuleSchema = exports.GEDClassificationRule = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let GEDClassificationRule = class GEDClassificationRule {
};
exports.GEDClassificationRule = GEDClassificationRule;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDClassificationRule.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDClassificationRule.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: [
            'facture',
            'depense',
            'avoir',
            'devis',
            'document_fournisseur',
            'document_client',
            'contrat',
            'document_societe',
        ],
        required: true,
    }),
    __metadata("design:type", String)
], GEDClassificationRule.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'GEDFolder' }),
    __metadata("design:type", String)
], GEDClassificationRule.prototype, "targetFolderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], GEDClassificationRule.prototype, "keywords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], GEDClassificationRule.prototype, "fileExtensions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], GEDClassificationRule.prototype, "conditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], GEDClassificationRule.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], GEDClassificationRule.prototype, "priority", void 0);
exports.GEDClassificationRule = GEDClassificationRule = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GEDClassificationRule);
exports.GEDClassificationRuleSchema = mongoose_1.SchemaFactory.createForClass(GEDClassificationRule);
exports.GEDClassificationRuleSchema.index({ tenantId: 1, documentType: 1 });
exports.GEDClassificationRuleSchema.index({ tenantId: 1, isActive: 1 });
//# sourceMappingURL=ged-classification-rule.schema.js.map