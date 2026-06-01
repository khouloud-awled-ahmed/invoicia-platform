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
exports.GEDFolderSchema = exports.GEDFolder = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let GEDFolder = class GEDFolder {
};
exports.GEDFolder = GEDFolder;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDFolder.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GEDFolder.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'GEDFolder' }),
    __metadata("design:type", String)
], GEDFolder.prototype, "parentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'root' }),
    __metadata("design:type", String)
], GEDFolder.prototype, "path", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], GEDFolder.prototype, "documentCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], GEDFolder.prototype, "totalSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: [
            'root',
            'factures',
            'depenses',
            'avoirs',
            'devis',
            'documents_fournisseurs',
            'documents_clients',
            'contrats',
            'documents_societe',
            'autre',
        ],
        default: 'autre',
    }),
    __metadata("design:type", String)
], GEDFolder.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], GEDFolder.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GEDFolder.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], GEDFolder.prototype, "metadata", void 0);
exports.GEDFolder = GEDFolder = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GEDFolder);
exports.GEDFolderSchema = mongoose_1.SchemaFactory.createForClass(GEDFolder);
exports.GEDFolderSchema.index({ tenantId: 1, parentId: 1 });
exports.GEDFolderSchema.index({ tenantId: 1, path: 1 });
exports.GEDFolderSchema.index({ tenantId: 1, documentType: 1 });
//# sourceMappingURL=ged-folder.schema.js.map