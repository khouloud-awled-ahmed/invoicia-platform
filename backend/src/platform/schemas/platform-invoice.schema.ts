import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformInvoiceDocument = PlatformInvoice & Document;

export enum PlatformInvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PlatformInvoicePaymentMethod {
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  PAYPAL = 'PAYPAL',
}

@Schema({ timestamps: true })
export class PlatformInvoice {
  @Prop({ required: true })
  invoiceNumber: string; // Format: INV-2024-001

  @Prop({ required: true, type: String, ref: 'Tenant' })
  tenantId: string;

  @Prop({ required: true, type: String, ref: 'SubscriptionPlan' })
  planId: string;

  @Prop({ required: true })
  planName: string; // Snapshot du nom du plan au moment de la facturation

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({ required: true, enum: PlatformInvoiceStatus, default: PlatformInvoiceStatus.ISSUED })
  status: PlatformInvoiceStatus;

  @Prop({ required: true, enum: PlatformInvoicePaymentMethod })
  paymentMethod: PlatformInvoicePaymentMethod;

  @Prop()
  pdfUrl?: string; // URL du PDF généré

  @Prop()
  pdfPath?: string; // Chemin local du fichier PDF

  @Prop({ required: true })
  issuedAt: Date;

  @Prop()
  paidAt?: Date;

  @Prop()
  dueDate?: Date;

  // Informations du tenant au moment de la facturation (snapshot)
  @Prop({ type: Object })
  tenantSnapshot?: {
    name: string;
    businessName?: string;
    email: string;
    adminEmail: string;
    address?: {
      line1: string;
      line2?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    matriculeFiscal?: string;
    vatNumber?: string;
  };

  // Informations du plan au moment de la facturation (snapshot)
  @Prop({ type: Object })
  planSnapshot?: {
    name: string;
    price: number;
    currency: string;
    features: string[];
    maxUsers?: number;
  };

  // Code promo appliqué (si applicable)
  @Prop()
  promoCode?: string;

  @Prop()
  discountAmount?: number;

  @Prop()
  subtotal?: number; // Montant avant réduction

  @Prop()
  taxAmount?: number; // TVA si applicable

  @Prop()
  totalAmount: number; // Montant final après réduction et taxes

  @Prop()
  notes?: string; // Notes additionnelles sur la facture

  @Prop({ default: false })
  emailSent: boolean; // Indique si l'email a été envoyé

  @Prop()
  emailSentAt?: Date;
}

export const PlatformInvoiceSchema = SchemaFactory.createForClass(PlatformInvoice);
PlatformInvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
PlatformInvoiceSchema.index({ tenantId: 1 });
PlatformInvoiceSchema.index({ issuedAt: -1 });
