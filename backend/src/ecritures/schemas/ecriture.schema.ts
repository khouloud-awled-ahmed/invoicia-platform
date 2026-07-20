import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type EcritureDocument = Ecriture & Document;
@Schema({ timestamps: true })
export class Ecriture {
  @Prop({ required: true }) date: string;
  @Prop({ required: true }) journal: string;
  @Prop({ required: true }) compte: string;
  @Prop({ required: true }) libelle: string;
  @Prop({ default: 0 }) debit: number;
  @Prop({ default: 0 }) credit: number;
  @Prop({ required: true }) tenantId: string;
  @Prop({ required: false }) projectId?: string;
  @Prop({ required: false, enum: ['ACTIF', 'PASSIF', 'PRODUIT', 'CHARGE', 'TVA_COLLECTEE', 'TVA_DEDUCTIBLE'] }) accountType?: string;
}
export const EcritureSchema = SchemaFactory.createForClass(Ecriture);
