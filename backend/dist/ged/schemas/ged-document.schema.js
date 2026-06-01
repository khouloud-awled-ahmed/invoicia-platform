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
exports.GEDDocumentSchema = exports.GEDDocument = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let GEDDocument = class GEDDocument {
};
exports.GEDDocument = GEDDocument;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDDocument.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDDocument.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'GEDFolder' }),
    __metadata("design:type", String)
], GEDDocument.prototype, "folderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '/' }),
    __metadata("design:type", String)
], GEDDocument.prototype, "path", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDDocument.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], GEDDocument.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDDocument.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDDocument.prototype, "gridFsFileId", void 0);
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
            'autre',
        ],
        default: 'autre',
    }),
    __metadata("design:type", String)
], GEDDocument.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], GEDDocument.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GEDDocument.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'User' }),
    __metadata("design:type", String)
], GEDDocument.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], GEDDocument.prototype, "archived", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], GEDDocument.prototype, "archivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], GEDDocument.prototype, "metadata", void 0);
exports.GEDDocument = GEDDocument = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GEDDocument);
exports.GEDDocumentSchema = mongoose_1.SchemaFactory.createForClass(GEDDocument);
exports.GEDDocumentSchema.index({ tenantId: 1, folderId: 1 });
exports.GEDDocumentSchema.index({ tenantId: 1, documentType: 1 });
exports.GEDDocumentSchema.index({ tenantId: 1, path: 1 });
exports.GEDDocumentSchema.index({ tenantId: 1, archived: 1 });
exports.GEDDocumentSchema.index({ tenantId: 1, 'metadata.entityId': 1 });
//# sourceMappingURL=ged-document.schema.js.map