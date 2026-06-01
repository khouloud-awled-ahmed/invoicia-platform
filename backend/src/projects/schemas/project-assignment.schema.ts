import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectAssignmentDocument = ProjectAssignment & Document;

@Schema({ timestamps: true })
export class ProjectAssignment {
  @Prop({ required: true, type: String, ref: 'User' })
  userId: string; // Consultant assigné

  @Prop({ required: true, type: String, ref: 'Project' })
  projectId: string;

  @Prop({ required: true })
  projectName: string; // Snapshot pour historique

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date; // Optionnel si affectation en cours

  @Prop({ type: String, ref: 'User' })
  validatorId?: string; // Manager responsable de la validation

  @Prop()
  validatorName?: string; // Snapshot du nom du manager

  @Prop({ default: 0 })
  dailyRate?: number; // TJM (masqué pour le consultant)

  @Prop({
    enum: ['ACTIVE', 'ENDED', 'CANCELLED'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ProjectAssignmentSchema = SchemaFactory.createForClass(ProjectAssignment);
ProjectAssignmentSchema.index({ userId: 1, status: 1 });
ProjectAssignmentSchema.index({ projectId: 1, status: 1 });
ProjectAssignmentSchema.index({ tenantId: 1, userId: 1 });
