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
exports.EnvelopeSchema = exports.Envelope = exports.RecipientSchema = exports.Recipient = exports.EnvelopeDocumentFileSchema = exports.EnvelopeDocumentFile = exports.FieldSchema = exports.Field = exports.AuditEventSchema = exports.AuditEvent = exports.FieldType = exports.RecipientRole = exports.RecipientStatus = exports.EnvelopeStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var EnvelopeStatus;
(function (EnvelopeStatus) {
    EnvelopeStatus["DRAFT"] = "DRAFT";
    EnvelopeStatus["SENT"] = "SENT";
    EnvelopeStatus["IN_PROGRESS"] = "IN_PROGRESS";
    EnvelopeStatus["COMPLETED"] = "COMPLETED";
    EnvelopeStatus["VOIDED"] = "VOIDED";
    EnvelopeStatus["EXPIRED"] = "EXPIRED";
})(EnvelopeStatus || (exports.EnvelopeStatus = EnvelopeStatus = {}));
var RecipientStatus;
(function (RecipientStatus) {
    RecipientStatus["WAITING"] = "WAITING";
    RecipientStatus["SENT"] = "SENT";
    RecipientStatus["SIGNED"] = "SIGNED";
    RecipientStatus["REFUSED"] = "REFUSED";
})(RecipientStatus || (exports.RecipientStatus = RecipientStatus = {}));
var RecipientRole;
(function (RecipientRole) {
    RecipientRole["SIGNER"] = "SIGNER";
    RecipientRole["VIEWER"] = "VIEWER";
})(RecipientRole || (exports.RecipientRole = RecipientRole = {}));
var FieldType;
(function (FieldType) {
    FieldType["SIGNATURE"] = "SIGNATURE";
    FieldType["INITIALS"] = "INITIALS";
    FieldType["DATE"] = "DATE";
    FieldType["TEXT"] = "TEXT";
    FieldType["CHECKBOX"] = "CHECKBOX";
})(FieldType || (exports.FieldType = FieldType = {}));
let AuditEvent = class AuditEvent {
};
exports.AuditEvent = AuditEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], AuditEvent.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AuditEvent.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditEvent.prototype, "actorEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditEvent.prototype, "actorName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditEvent.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AuditEvent.prototype, "metadata", void 0);
exports.AuditEvent = AuditEvent = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AuditEvent);
exports.AuditEventSchema = mongoose_1.SchemaFactory.createForClass(AuditEvent);
let Field = class Field {
};
exports.Field = Field;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Field.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: FieldType }),
    __metadata("design:type", String)
], Field.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, min: 1 }),
    __metadata("design:type", Number)
], Field.prototype, "pageNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, min: 0 }),
    __metadata("design:type", Number)
], Field.prototype, "xPosition", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, min: 0 }),
    __metadata("design:type", Number)
], Field.prototype, "yPosition", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Field.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Field.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Field.prototype, "assignedRecipientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Field.prototype, "linkedDocumentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Field.prototype, "required", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Field.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Field.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Boolean)
], Field.prototype, "defaultValue", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Field.prototype, "signedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Field.prototype, "signedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Field.prototype, "signatureData", void 0);
exports.Field = Field = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Field);
exports.FieldSchema = mongoose_1.SchemaFactory.createForClass(Field);
let EnvelopeDocumentFile = class EnvelopeDocumentFile {
};
exports.EnvelopeDocumentFile = EnvelopeDocumentFile;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvelopeDocumentFile.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvelopeDocumentFile.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvelopeDocumentFile.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EnvelopeDocumentFile.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvelopeDocumentFile.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], EnvelopeDocumentFile.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvelopeDocumentFile.prototype, "signedFileUrl", void 0);
exports.EnvelopeDocumentFile = EnvelopeDocumentFile = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], EnvelopeDocumentFile);
exports.EnvelopeDocumentFileSchema = mongoose_1.SchemaFactory.createForClass(EnvelopeDocumentFile);
let Recipient = class Recipient {
};
exports.Recipient = Recipient;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Recipient.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Recipient.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Recipient.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: RecipientRole }),
    __metadata("design:type", String)
], Recipient.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Recipient.prototype, "routingOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: RecipientStatus, default: RecipientStatus.WAITING }),
    __metadata("design:type", String)
], Recipient.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recipient.prototype, "securityCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Recipient.prototype, "signedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Recipient.prototype, "refusedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recipient.prototype, "refusalReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recipient.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recipient.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recipient.prototype, "userAgent", void 0);
exports.Recipient = Recipient = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Recipient);
exports.RecipientSchema = mongoose_1.SchemaFactory.createForClass(Recipient);
let Envelope = class Envelope {
};
exports.Envelope = Envelope;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Envelope.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: EnvelopeStatus, default: EnvelopeStatus.DRAFT }),
    __metadata("design:type", String)
], Envelope.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], Envelope.prototype, "currentRoutingOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.RecipientSchema], default: [] }),
    __metadata("design:type", Array)
], Envelope.prototype, "recipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.EnvelopeDocumentFileSchema], default: [] }),
    __metadata("design:type", Array)
], Envelope.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.FieldSchema], default: [] }),
    __metadata("design:type", Array)
], Envelope.prototype, "fields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.AuditEventSchema], default: [] }),
    __metadata("design:type", Array)
], Envelope.prototype, "auditTrail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Envelope.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Envelope.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Envelope.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Envelope.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Envelope.prototype, "certificateUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Envelope.prototype, "completedAt", void 0);
exports.Envelope = Envelope = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Envelope);
exports.EnvelopeSchema = mongoose_1.SchemaFactory.createForClass(Envelope);
exports.EnvelopeSchema.index({ tenantId: 1, createdAt: -1 });
exports.EnvelopeSchema.index({ 'recipients.email': 1 });
exports.EnvelopeSchema.index({ status: 1 });
exports.EnvelopeSchema.index({ expiresAt: 1 });
//# sourceMappingURL=envelope.schema.js.map