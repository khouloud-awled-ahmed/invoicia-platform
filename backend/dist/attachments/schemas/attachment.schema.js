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
exports.AttachmentSchema = exports.Attachment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Attachment = class Attachment {
};
exports.Attachment = Attachment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['invoice', 'purchase_invoice', 'credit_note', 'tenant_logo'] }),
    __metadata("design:type", String)
], Attachment.prototype, "entityType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Attachment.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "gridFsFileId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attachment.prototype, "uploadedBy", void 0);
exports.Attachment = Attachment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Attachment);
exports.AttachmentSchema = mongoose_1.SchemaFactory.createForClass(Attachment);
exports.AttachmentSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });
exports.AttachmentSchema.index({ tenantId: 1, gridFsFileId: 1 });
//# sourceMappingURL=attachment.schema.js.map