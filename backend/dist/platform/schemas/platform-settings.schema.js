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
exports.PlatformSettingsSchema = exports.PlatformSettings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let PlatformSettings = class PlatformSettings {
};
exports.PlatformSettings = PlatformSettings;
__decorate([
    (0, mongoose_1.Prop)({ default: 'platform' }),
    __metadata("design:type", String)
], PlatformSettings.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlatformSettings.prototype, "paymentMethods", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "supportEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "supportPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "companyName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlatformSettings.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlatformSettings.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PlatformSettings.prototype, "requireEmailVerification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PlatformSettings.prototype, "requirePhoneVerification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 7 }),
    __metadata("design:type", Number)
], PlatformSettings.prototype, "defaultTrialDaysForTransfer", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "invoiceLogoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "invoiceCompanyName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlatformSettings.prototype, "invoiceCompanyAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "invoiceCompanyVat", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "invoiceFooterText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], PlatformSettings.prototype, "nextInvoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '#667eea' }),
    __metadata("design:type", String)
], PlatformSettings.prototype, "invoiceColor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlatformSettings.prototype, "invoicePrefix", void 0);
exports.PlatformSettings = PlatformSettings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PlatformSettings);
exports.PlatformSettingsSchema = mongoose_1.SchemaFactory.createForClass(PlatformSettings);
exports.PlatformSettingsSchema.index({ id: 1 }, { unique: true });
//# sourceMappingURL=platform-settings.schema.js.map