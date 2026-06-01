import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type OffreDocument = Offre & Document;
@Schema({ timestamps: true })
export class Offre {
  @Prop({ required: true }) titre: string;
  @Prop({ required: true }) departement: string;
  @Prop({ required: true }) typeContrat: string;
  @Prop() localisation: string;
  @Prop() description: string;
  @Prop({ enum: ['ouverte','en_cours','pourvue','annulee'], default: 'ouverte' }) statut: string;
  @Prop({ default: 0 }) candidatures: number;
  @Prop() datePublication: string;
  @Prop({ required: true }) tenantId: string;
}
export const OffreSchema = SchemaFactory.createForClass(Offre);
