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
exports.ParsingTemplateSchema = exports.ParsingTemplate = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ParsingTemplate = class ParsingTemplate {
};
exports.ParsingTemplate = ParsingTemplate;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ParsingTemplate.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ParsingTemplate.prototype, "signature", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['BANK', 'INVOICE', 'CV'] }),
    __metadata("design:type", String)
], ParsingTemplate.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], ParsingTemplate.prototype, "config", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ParsingTemplate.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ParsingTemplate.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ParsingTemplate.prototype, "fileType", void 0);
exports.ParsingTemplate = ParsingTemplate = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ParsingTemplate);
exports.ParsingTemplateSchema = mongoose_1.SchemaFactory.createForClass(ParsingTemplate);
exports.ParsingTemplateSchema.index({ tenantId: 1, type: 1, signature: 1 });
exports.ParsingTemplateSchema.index({ tenantId: 1, type: 1, isActive: 1 });
//# sourceMappingURL=parsing-template.schema.js.map