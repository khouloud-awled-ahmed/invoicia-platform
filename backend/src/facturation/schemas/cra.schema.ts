import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CraDocument = Cra & Document;

@Schema({ timestamps: true })
export class Cra {
  @Prop({ required: true, type: String, ref: 'Intervenant' })
  intervenantId: string;

  @Prop({ required: true })
  intervenantName: string;

  @Prop({ required: true, type: String, ref: 'Project' })
  projectId: string;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, default: 0 })
  hours: number;

  @Prop({ required: true, default: 0 })
  rate: number; // TJM €/h

  @Prop({ required: true, default: 0 })
  amount: number; // hours * rate

  @Prop({
    enum: ['DRAFT', 'SUBMITTED', 'VALIDATED', 'INVOICED'],
    default: 'VALIDATED',
  })
  status: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop()
  notes?: string;
}

export const CraSchema = SchemaFactory.createForClass(Cra);
CraSchema.index({ tenantId: 1, status: 1 });
CraSchema.index({ tenantId: 1, intervenantId: 1 });
CraSchema.index({ tenantId: 1, projectId: 1 });