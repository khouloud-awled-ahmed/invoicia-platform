import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type FormationDocument = Formation & Document;
@Schema({ timestamps: true })
export class Formation {
  @Prop({ required: true }) titre: string;
  @Prop() organisme: string;
  @Prop({ required: true }) dateDebut: string;
  @Prop({ required: true }) duree: number;
  @Prop() employeeId: string;
  @Prop() employe: string;
  @Prop() description: string;
  @Prop({ enum: ['planifiee','en_cours','terminee','annulee'], default: 'planifiee' }) statut: string;
  @Prop({ required: true }) tenantId: string;
}
export const FormationSchema = SchemaFactory.createForClass(Formation);
