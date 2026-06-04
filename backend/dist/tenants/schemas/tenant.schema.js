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
exports.TenantSchema = exports.Tenant = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tenant.prototype, "businessName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "logo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '#3b82f6' }),
    __metadata("design:type", String)
], Tenant.prototype, "primaryColor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "matriculeFiscal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "registreCommerce", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "codeDouane", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "affiliationCNSS", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "tvaNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isVatSubject", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tenant.prototype, "legalForm", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Tenant.prototype, "capital", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "defaultBankAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "defaultTerms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isConfigured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "invoiceSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "billingSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "notificationPreferences", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "securitySettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['essential', 'business', 'premium'],
        default: 'essential',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "pack", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tenant.prototype, "modules", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Tenant.prototype, "moduleFlags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: [
            'INCOMPLETE',
            'TRIAL',
            'ACTIVE',
            'PAST_DUE',
            'CANCELED',
            'PENDING_PAYMENT',
            'SUSPENDED',
            'CANCELLED',
        ],
        default: 'INCOMPLETE',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['CUSTOM', 'STARTER', 'BUSINESS', 'PREMIUM'],
        default: 'CUSTOM',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "planType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'SubscriptionPlan', required: false }),
    __metadata("design:type", String)
], Tenant.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 10 }),
    __metadata("design:type", Number)
], Tenant.prototype, "maxUsers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Tenant.prototype, "currentUsers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['active', 'trial', 'suspended', 'pending'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tenant.prototype, "features", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Tenant.prototype, "trialEndsAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Tenant.prototype, "subscriptionEndsAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tenant.prototype, "adminEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['essential', 'business', 'premium'],
        default: 'essential',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "payrollSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Tenant.prototype, "bankingConfig", void 0);
exports.Tenant = Tenant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Tenant);
exports.TenantSchema = mongoose_1.SchemaFactory.createForClass(Tenant);
//# sourceMappingURL=tenant.schema.js.map