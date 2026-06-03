import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  client: string;

  @Prop({
    enum: ['en-cours', 'termine', 'en-attente', 'annule'],
    default: 'en-attente',
  })
  status: string;

  @Prop({
    enum: ['haute', 'moyenne', 'basse'],
    default: 'moyenne',
  })
  priority: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, default: 0 })
  budget: number;

  @Prop({ default: 0 })
  consumed: number;

  @Prop({ default: 0 })
  progress: number;

  @Prop({ required: true })
  manager: string;

  @Prop({ type: [String], default: [] })
  team: string[];

  @Prop()
  description: string;

  @Prop({ default: 0 })
  tasksTotal: number;

  @Prop({ default: 0 })
  tasksCompleted: number;

  @Prop({ default: 0 })
  hoursEstimated: number;

  @Prop({ default: 0 })
  hoursSpent: number;

  @Prop({ required: true })
  code: string;

  @Prop({ default: '#3b82f6' })
  color: string;

  @Prop({
    enum: ['INTERNAL', 'CLIENT_BILLABLE'],
    default: 'CLIENT_BILLABLE',
  })
  type: string; // Type de projet pour ESN

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ tenantId: 1, status: 1 });
