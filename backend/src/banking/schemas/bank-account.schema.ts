import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankAccountDocument = BankAccount & Document;

export enum BankAccountProvider {
  MANUAL = 'MANUAL',
  GOCARDLESS = 'GOCARDLESS',
  BRIDGE = 'BRIDGE',
}

@Schema({ timestamps: true })
export class BankAccount {
  @Prop({ required: true })
  name: string;

  @Prop()
  iban?: string; // Optionnel (certains comptes de paiement n'en ont pas)

  @Prop()
  bic?: string;

  @Prop()
  bankName?: string;

  @Prop()
  accountNumber?: string;

  @Prop({ required: true, enum: BankAccountProvider, default: BankAccountProvider.MANUAL })
  provider: BankAccountProvider;

  @Prop()
  externalId?: string; // ID unique chez l'agrégateur (GoCardless, Bridge, etc.)

  @Prop({ type: Number, default: 0 })
  balance: number;

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: String, ref: 'BankConnection' })
  connectionId?: string; // Référence vers la connexion OAuth

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
BankAccountSchema.index({ tenantId: 1 });
BankAccountSchema.index({ tenantId: 1, provider: 1 });
BankAccountSchema.index({ externalId: 1 });
BankAccountSchema.index({ connectionId: 1 });
