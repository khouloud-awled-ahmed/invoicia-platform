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
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../users/schemas/user.schema");
const platform_settings_schema_1 = require("../../platform/schemas/platform-settings.schema");
let VerificationService = class VerificationService {
    constructor(userModel, settingsModel) {
        this.userModel = userModel;
        this.settingsModel = settingsModel;
        this.otpStorage = new Map();
    }
    async sendEmailOTP(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.otpStorage.set(`email:${email}`, {
            code: otp,
            expiresAt,
            attempts: 0,
        });
        console.log(`[EMAIL OTP] Envoyé à ${email}: ${otp} (expire dans 10 minutes)`);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    async sendSMSOTP(phone) {
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.otpStorage.set(`sms:${phone}`, {
            code: otp,
            expiresAt,
            attempts: 0,
        });
        console.log(`[SMS OTP] Envoyé à ${phone}: ${otp} (expire dans 10 minutes)`);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    async validateEmailOTP(email, code) {
        const key = `email:${email}`;
        const stored = this.otpStorage.get(key);
        if (!stored) {
            throw new common_1.BadRequestException('Code OTP non trouvé. Veuillez en demander un nouveau.');
        }
        if (new Date() > stored.expiresAt) {
            this.otpStorage.delete(key);
            throw new common_1.BadRequestException('Code OTP expiré. Veuillez en demander un nouveau.');
        }
        if (stored.attempts >= 5) {
            this.otpStorage.delete(key);
            throw new common_1.BadRequestException('Trop de tentatives. Veuillez en demander un nouveau code.');
        }
        stored.attempts++;
        if (stored.code !== code) {
            if (stored.attempts >= 5) {
                this.otpStorage.delete(key);
            }
            throw new common_1.BadRequestException('Code OTP invalide');
        }
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (user) {
            user.isEmailVerified = true;
            await user.save();
        }
        this.otpStorage.delete(key);
        return true;
    }
    async validateSMSOTP(phone, code) {
        const key = `sms:${phone}`;
        const stored = this.otpStorage.get(key);
        if (!stored) {
            throw new common_1.BadRequestException('Code OTP non trouvé. Veuillez en demander un nouveau.');
        }
        if (new Date() > stored.expiresAt) {
            this.otpStorage.delete(key);
            throw new common_1.BadRequestException('Code OTP expiré. Veuillez en demander un nouveau.');
        }
        if (stored.attempts >= 5) {
            this.otpStorage.delete(key);
            throw new common_1.BadRequestException('Trop de tentatives. Veuillez en demander un nouveau code.');
        }
        stored.attempts++;
        if (stored.code !== code) {
            if (stored.attempts >= 5) {
                this.otpStorage.delete(key);
            }
            throw new common_1.BadRequestException('Code OTP invalide');
        }
        const user = await this.userModel.findOne({ phone }).exec();
        if (user) {
            user.isPhoneVerified = true;
            await user.save();
        }
        this.otpStorage.delete(key);
        return true;
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async getVerificationSettings() {
        const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
        return {
            requireEmailVerification: settings?.requireEmailVerification ?? true,
            requirePhoneVerification: settings?.requirePhoneVerification ?? false,
        };
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(platform_settings_schema_1.PlatformSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], VerificationService);
//# sourceMappingURL=verification.service.js.map