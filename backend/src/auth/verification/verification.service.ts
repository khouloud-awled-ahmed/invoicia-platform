import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { PlatformSettings, PlatformSettingsDocument } from '../../platform/schemas/platform-settings.schema';

interface OTPStorage {
  code: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class VerificationService {
  private otpStorage: Map<string, OTPStorage> = new Map();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PlatformSettings.name) private settingsModel: Model<PlatformSettingsDocument>,
  ) {}

  async sendEmailOTP(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.otpStorage.set(`email:${email}`, {
      code: otp,
      expiresAt,
      attempts: 0,
    });

    // TODO: Intégrer SendGrid ou service email
    console.log(`[EMAIL OTP] Envoyé à ${email}: ${otp} (expire dans 10 minutes)`);

    // Simuler l'envoi
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async sendSMSOTP(phone: string): Promise<void> {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.otpStorage.set(`sms:${phone}`, {
      code: otp,
      expiresAt,
      attempts: 0,
    });

    // TODO: Intégrer Twilio ou service SMS
    console.log(`[SMS OTP] Envoyé à ${phone}: ${otp} (expire dans 10 minutes)`);

    // Simuler l'envoi
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async validateEmailOTP(email: string, code: string): Promise<boolean> {
    const key = `email:${email}`;
    const stored = this.otpStorage.get(key);

    if (!stored) {
      throw new BadRequestException('Code OTP non trouvé. Veuillez en demander un nouveau.');
    }

    if (new Date() > stored.expiresAt) {
      this.otpStorage.delete(key);
      throw new BadRequestException('Code OTP expiré. Veuillez en demander un nouveau.');
    }

    if (stored.attempts >= 5) {
      this.otpStorage.delete(key);
      throw new BadRequestException('Trop de tentatives. Veuillez en demander un nouveau code.');
    }

    stored.attempts++;

    if (stored.code !== code) {
      if (stored.attempts >= 5) {
        this.otpStorage.delete(key);
      }
      throw new BadRequestException('Code OTP invalide');
    }

    // Code valide
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (user) {
      user.isEmailVerified = true;
      await user.save();
    }

    this.otpStorage.delete(key);
    return true;
  }

  async validateSMSOTP(phone: string, code: string): Promise<boolean> {
    const key = `sms:${phone}`;
    const stored = this.otpStorage.get(key);

    if (!stored) {
      throw new BadRequestException('Code OTP non trouvé. Veuillez en demander un nouveau.');
    }

    if (new Date() > stored.expiresAt) {
      this.otpStorage.delete(key);
      throw new BadRequestException('Code OTP expiré. Veuillez en demander un nouveau.');
    }

    if (stored.attempts >= 5) {
      this.otpStorage.delete(key);
      throw new BadRequestException('Trop de tentatives. Veuillez en demander un nouveau code.');
    }

    stored.attempts++;

    if (stored.code !== code) {
      if (stored.attempts >= 5) {
        this.otpStorage.delete(key);
      }
      throw new BadRequestException('Code OTP invalide');
    }

    // Code valide
    const user = await this.userModel.findOne({ phone }).exec();
    if (user) {
      user.isPhoneVerified = true;
      await user.save();
    }

    this.otpStorage.delete(key);
    return true;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getVerificationSettings(): Promise<{ requireEmailVerification: boolean; requirePhoneVerification: boolean }> {
    const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
    return {
      requireEmailVerification: settings?.requireEmailVerification ?? true,
      requirePhoneVerification: settings?.requirePhoneVerification ?? false,
    };
  }
}
