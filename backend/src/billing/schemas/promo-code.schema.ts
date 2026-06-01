import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromoCodeDocument = PromoCode & Document;

@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: ['PERCENT', 'AMOUNT'] })
  discountType: string;

  @Prop({ required: true })
  value: number; // Pourcentage (0-100) ou montant en euros

  @Prop({ type: Date })
  expirationDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop()
  maxUsage?: number; // Limite d'utilisation (optionnel)

  @Prop({ type: [String] })
  applicablePlans?: string[]; // IDs des plans applicables (vide = tous les plans)

  @Prop()
  description?: string;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
PromoCodeSchema.index({ code: 1 }, { unique: true });
