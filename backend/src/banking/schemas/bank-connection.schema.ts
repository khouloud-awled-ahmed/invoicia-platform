import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankConnectionDocument = BankConnection & Document;

export enum BankingProvider {
  GOCARDLESS = 'GOCARDLESS',
  BRIDGE = 'BRIDGE',
}

@Schema({ timestamps: true })
export class BankConnection {
  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ required: true, enum: BankingProvider })
  provider: BankingProvider;

  @Prop({ required: true })
  institutionId: string; // ID de la banque chez l'agrégateur

  @Prop()
  institutionName?: string; // Nom de la banque (pour affichage)

  @Prop({ required: true })
  accessToken: string; // Doit être crypté en production

  @Prop()
  refreshToken?: string;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Données supplémentaires selon le provider
}

export const BankConnectionSchema = SchemaFactory.createForClass(BankConnection);
BankConnectionSchema.index({ tenantId: 1 });
BankConnectionSchema.index({ tenantId: 1, provider: 1 });
BankConnectionSchema.index({ institutionId: 1 });
