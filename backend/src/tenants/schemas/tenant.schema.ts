import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  logo?: string;

  @Prop({ default: '#3b82f6' })
  primaryColor: string;

  /** Matricule Fiscal (ex: 1234567/A/B/M/000) - Obligatoire Tunisie */
  @Prop({ required: true, unique: true })
  matriculeFiscal: string;

  /** Registre de Commerce */
  @Prop()
  registreCommerce?: string;

  /** Code Douane (optionnel) */
  @Prop()
  codeDouane?: string;

  /** Affiliation CNSS - Numéro Employeur 8 chiffres */
  @Prop()
  affiliationCNSS?: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  tvaNumber?: string;

  @Prop({ default: false })
  isVatSubject?: boolean;

  @Prop()
  legalForm?: string;

  @Prop()
  capital?: number;

  // Adresse structurée
  @Prop({ type: Object })
  address?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };

  // Coordonnées bancaires par défaut
  @Prop({ type: Object })
  defaultBankAccount?: {
    bankName: string;
    bankAddress: string;
    iban: string;
    bic: string;
  };

  // Conditions générales de vente
  @Prop({ type: Object })
  defaultTerms?: {
    penaltyRate: number;
    penaltyDescription: string;
    recoveryFee: number;
    discountPolicy: string;
    paymentTermsDefault: number;
  };

  /** true une fois l'onboarding terminé (wizard infranchissable si false). */
  @Prop({ default: false })
  isConfigured?: boolean;

  // Paramètres de facturation (Tunisie)
  @Prop({ type: Object })
  invoiceSettings?: {
    prefix?: string;
    nextNumber?: string;
    footerText?: string;
    template?: string;
    facturXGeneration?: boolean;
    eInvoicingTransmission?: boolean;
    /** Devise unique Tunisie */
    currency?: string;
    /** Droit de Timbre (ligne fixe ajoutée au Total TTC) en TND - défaut 1.000 */
    timbreFiscalAmount?: number;
  };

  // Configuration du module de facturation
  @Prop({ type: Object })
  billingSettings?: {
    enabled: boolean;
    structuredFormatsEnabled: boolean;
    platformAgreementEnabled: boolean;
    platformAgreementConfig?: {
      platform: string;
      apiKey?: string;
      apiSecret?: string;
      endpoint?: string;
    };
  };

  // Paramètres de notifications
  @Prop({ type: Object })
  notificationPreferences?: {
    [key: string]: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  };

  // Paramètres de sécurité
  @Prop({ type: Object })
  securitySettings?: {
    mfaRequired: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChar: boolean;
    };
  };

  @Prop({
    required: true,
    enum: ['essential', 'business', 'premium'],
    default: 'essential',
  })
  pack: string;

  @Prop({ type: [String], default: [] })
  modules: string[];

  /** Feature flags par module (SaaS modulaire). Par défaut false. */
  @Prop({
    type: Object,
    default: () => ({}),
  })
  moduleFlags?: {
    module_clients?: boolean;
    module_crm?: boolean;
    module_invoicing?: boolean;
    module_suppliers?: boolean;
    module_projects?: boolean;
    module_staffing?: boolean;
    module_cra?: boolean;
    module_accounting?: boolean;
    module_payments?: boolean;
    module_banking?: boolean;
    module_hr?: boolean;
    module_cvtech?: boolean;
    module_ged?: boolean;
    module_signature?: boolean;
  };

  @Prop({
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
  })
  subscriptionStatus: string;

  @Prop({
    enum: ['CUSTOM', 'STARTER', 'BUSINESS', 'PREMIUM'],
    default: 'CUSTOM',
  })
  planType: string;

  @Prop({ type: String, ref: 'SubscriptionPlan', required: false })
  planId?: string;

  @Prop({ default: 10 })
  maxUsers: number;

  @Prop({ default: 0 })
  currentUsers: number;

  @Prop({
    enum: ['active', 'trial', 'suspended', 'pending'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: Date })
  trialEndsAt?: Date;

  @Prop({ type: Date })
  subscriptionEndsAt?: Date;

  @Prop({ type: Object })
  metadata?: {
    notes?: string;
    lastLogin?: Date;
    [key: string]: any;
  };

  // TenantSettings embarqué
  @Prop({ type: Object })
  settings?: {
    companyAddress?: {
      line1: string;
      line2?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    matriculeFiscal?: string;
    vatNumber?: string;
    logoUrl?: string;
    paymentMethods?: Array<{
      type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
      enabled: boolean;
      details: Record<string, any>;
    }>;
  };

  @Prop({ required: true })
  adminEmail: string;

  @Prop({
    enum: ['essential', 'business', 'premium'],
    default: 'essential',
  })
  subscriptionPlan: string;

  // Paramètres de paie (Tunisie - CNSS)
  @Prop({ type: Object })
  payrollSettings?: {
    matriculeFiscal?: string;
    affiliationCNSS?: string;
    codeDouane?: string;
  };

  // Configuration bancaire (clés API cryptées)
  @Prop({ type: Object })
  bankingConfig?: {
    provider?: 'GOCARDLESS' | 'BRIDGE';
    clientId?: string; // Crypté
    clientSecret?: string; // Crypté
    isActive?: boolean;
    redirectUri?: string;
    baseUrl?: string;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
