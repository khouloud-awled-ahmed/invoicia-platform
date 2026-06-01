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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const platform_settings_schema_1 = require("./schemas/platform-settings.schema");
let PlatformSettingsService = class PlatformSettingsService {
    constructor(settingsModel) {
        this.settingsModel = settingsModel;
    }
    async getSettings() {
        let settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
        if (!settings) {
            settings = new this.settingsModel({
                id: 'platform',
                paymentMethods: {},
            });
            await settings.save();
        }
        const safeSettings = settings.toObject();
        if (safeSettings.paymentMethods?.stripe?.secretKey) {
            delete safeSettings.paymentMethods.stripe.secretKey;
        }
        if (safeSettings.paymentMethods?.stripe?.webhookSecret) {
            delete safeSettings.paymentMethods.stripe.webhookSecret;
        }
        if (safeSettings.paymentMethods?.paypal?.clientSecret) {
            delete safeSettings.paymentMethods.paypal.clientSecret;
        }
        return safeSettings;
    }
    async updateSettings(updateDto) {
        let settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
        if (!settings) {
            settings = new this.settingsModel({
                id: 'platform',
                ...updateDto,
            });
        }
        else {
            Object.assign(settings, updateDto);
        }
        await settings.save();
        const safeSettings = settings.toObject();
        if (safeSettings.paymentMethods?.stripe?.secretKey) {
            delete safeSettings.paymentMethods.stripe.secretKey;
        }
        if (safeSettings.paymentMethods?.stripe?.webhookSecret) {
            delete safeSettings.paymentMethods.stripe.webhookSecret;
        }
        if (safeSettings.paymentMethods?.paypal?.clientSecret) {
            delete safeSettings.paymentMethods.paypal.clientSecret;
        }
        return safeSettings;
    }
};
exports.PlatformSettingsService = PlatformSettingsService;
exports.PlatformSettingsService = PlatformSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(platform_settings_schema_1.PlatformSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PlatformSettingsService);
//# sourceMappingURL=platform-settings.service.js.map