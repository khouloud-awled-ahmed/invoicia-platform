import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSettings, PlatformSettingsDocument } from './schemas/platform-settings.schema';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

@Injectable()
export class PlatformSettingsService {
  constructor(
    @InjectModel(PlatformSettings.name) private settingsModel: Model<PlatformSettingsDocument>,
  ) {}

  async getSettings(): Promise<PlatformSettings> {
    let settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
    
    if (!settings) {
      // Créer les settings par défaut
      settings = new this.settingsModel({
        id: 'platform',
        paymentMethods: {},
      });
      await settings.save();
    }

    // Ne pas exposer les clés secrètes
    const safeSettings = settings.toObject();
    if ((safeSettings as any).paymentMethods?.stripe?.secretKey) {
      delete (safeSettings as any).paymentMethods.stripe.secretKey;
    }
    if ((safeSettings as any).paymentMethods?.stripe?.webhookSecret) {
      delete (safeSettings as any).paymentMethods.stripe.webhookSecret;
    }
    if ((safeSettings as any).paymentMethods?.paypal?.clientSecret) {
      delete (safeSettings as any).paymentMethods.paypal.clientSecret;
    }

    return safeSettings as PlatformSettings;
  }

  async updateSettings(updateDto: UpdatePlatformSettingsDto): Promise<PlatformSettings> {
    let settings = await this.settingsModel.findOne({ id: 'platform' }).exec();

    if (!settings) {
      settings = new this.settingsModel({
        id: 'platform',
        ...updateDto,
      });
    } else {
      Object.assign(settings, updateDto);
    }

    await settings.save();

    // Retourner les settings sans les clés secrètes
    const safeSettings = settings.toObject();
    if ((safeSettings as any).paymentMethods?.stripe?.secretKey) {
      delete (safeSettings as any).paymentMethods.stripe.secretKey;
    }
    if ((safeSettings as any).paymentMethods?.stripe?.webhookSecret) {
      delete (safeSettings as any).paymentMethods.stripe.webhookSecret;
    }
    if ((safeSettings as any).paymentMethods?.paypal?.clientSecret) {
      delete (safeSettings as any).paymentMethods.paypal.clientSecret;
    }

    return safeSettings as PlatformSettings;
  }
}
