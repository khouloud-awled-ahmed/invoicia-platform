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
exports.PlatformInvoiceSchema = exports.PlatformInvoice = exports.PlatformInvoicePaymentMethod = exports.PlatformInvoiceStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PlatformInvoiceStatus;
(function (PlatformInvoiceStatus) {
    PlatformInvoiceStatus["DRAFT"] = "DRAFT";
    PlatformInvoiceStatus["ISSUED"] = "ISSUED";
    PlatformInvoiceStatus["PAID"] = "PAID";
    PlatformInvoiceStatus["CANCELLED"] = "CANCELLED";
})(PlatformInvoiceStatus || (exports.PlatformInvoiceStatus = PlatformInvoiceStatus = {}));
var PlatformInvoicePaymentMethod;
(function (PlatformInvoicePaymentMethod) {
    PlatformInvoicePaymentMethod["CARD"] = "CARD";
    PlatformInvoicePaymentMethod["TRANSFER"] = "TRANSFER";
    PlatformInvoicePaymentMethod["PAYPAL"] = "PAYPAL";
})(PlatformInvoicePaymentMethod || (exports.PlatformInvoicePaymentMethod = PlatformInvoicePaymentMethod = {}));
let PlatformInvoice = class PlatformInvoice {
};
exports.PlatformInvoice = PlatformInvoice;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Tenant' }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'SubscriptionPlan' }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "planName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PlatformInvoice.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'EUR' }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PlatformInvoiceStatus, default: PlatformInvoiceStatus.ISSUED }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PlatformInvoicePaymentMethod }),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "pdfUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "pdfPath", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PlatformInvoice.prototype, "issuedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PlatformInvoice.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PlatformInvoice.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlatformInvoice.prototype, "tenantSnapshot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlatformInvoice.prototype, "planSnapshot", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "promoCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PlatformInvoice.prototype, "discountAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PlatformInvoice.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PlatformInvoice.prototype, "taxAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PlatformInvoice.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformInvoice.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PlatformInvoice.prototype, "emailSent", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PlatformInvoice.prototype, "emailSentAt", void 0);
exports.PlatformInvoice = PlatformInvoice = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PlatformInvoice);
exports.PlatformInvoiceSchema = mongoose_1.SchemaFactory.createForClass(PlatformInvoice);
exports.PlatformInvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
exports.PlatformInvoiceSchema.index({ tenantId: 1 });
exports.PlatformInvoiceSchema.index({ issuedAt: -1 });
//# sourceMappingURL=platform-invoice.schema.js.map