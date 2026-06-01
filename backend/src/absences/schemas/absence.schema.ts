import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AbsenceDocument = Absence & Document;

@Schema({ timestamps: true })
export class Absence {
  @Prop({ required: true, type: String, ref: 'Employee' })
  employeeId: string;

  @Prop({ required: false, default: '' })
  employeeName: string;

  @Prop({
    required: true,
    enum: ['CP', 'RTT', 'MALADIE', 'MATERNITE', 'VOYAGE', 'AUTRE'],
  })
  type: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, default: 1 })
  days: number;

  @Prop({
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop()
  reason?: string;

  @Prop()
  approvedBy?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ required: true, type: String, ref: 'Tenant' })
  tenantId: string;
}

export const AbsenceSchema = SchemaFactory.createForClass(Absence);
AbsenceSchema.index({ tenantId: 1, employeeId: 1 });
AbsenceSchema.index({ tenantId: 1, status: 1 });
AbsenceSchema.index({ tenantId: 1, startDate: -1 });