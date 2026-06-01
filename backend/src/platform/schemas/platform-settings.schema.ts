import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformSettingsDocument = PlatformSettings & Document;

@Schema({ timestamps: true })
export class PlatformSettings {
  @Prop({ default: 'platform' })
  id: string; // Toujours 'platform' pour un singleton

  @Prop({ type: Object })
  paymentMethods?: {
    iban?: {
      iban: string;
      bic: string;
      bankName: string;
      accountHolder: string;
    };
    stripe?: {
      publicKey: string;
      secretKey?: string; // Ne jamais exposer au frontend
      webhookSecret?: string;
    };
    paypal?: {
      clientId: string;
      clientSecret?: string;
    };
  };

  @Prop()
  supportEmail?: string;

  @Prop()
  supportPhone?: string;

  @Prop()
  companyName?: string;

  @Prop({ type: Object })
  address?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: true })
  requireEmailVerification: boolean;

  @Prop({ default: false })
  requirePhoneVerification: boolean;

  @Prop({ default: 7 })
  defaultTrialDaysForTransfer: number;

  // ==========================================
  // 📄 INVOICE CONFIGURATION (Platform Billing)
  // ==========================================

  @Prop()
  invoiceLogoUrl?: string;

  @Prop()
  invoiceCompanyName?: string;

  @Prop({ type: Object })
  invoiceCompanyAddress?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };

  @Prop()
  invoiceCompanyVat?: string; // Numéro de TVA intracommunautaire

  @Prop()
  invoiceFooterText?: string; // Mentions légales, capital social, etc.

  @Prop({ default: 1 })
  nextInvoiceNumber: number; // Numéro séquentiel pour les factures

  @Prop({ default: '#667eea' })
  invoiceColor: string; // Couleur principale du template

  @Prop()
  invoicePrefix?: string; // Préfixe pour les numéros (ex: "INV-2024-")
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
PlatformSettingsSchema.index({ id: 1 }, { unique: true });
