import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type EvaluationDocument = Evaluation & Document;
@Schema({ timestamps: true })
export class Evaluation {
  @Prop({ required: true }) employeeId: string;
  @Prop({ required: true }) employe: string;
  @Prop() evaluateur: string;
  @Prop({ required: true }) date: string;
  @Prop({ required: true }) score: number;
  @Prop() objectifs: string;
  @Prop() commentaires: string;
  @Prop({ enum: ['draft', 'completed'], default: 'completed' }) statut: string;
  @Prop({ required: true }) tenantId: string;
}
export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
