import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type BulletinDocument = Bulletin & Document;
@Schema({ timestamps: true })
export class Bulletin {
  @Prop({ required: true }) employeeId: string;
  @Prop({ required: true }) employeeName: string;
  @Prop({ required: true }) month: number;
  @Prop({ required: true }) year: number;
  @Prop({ required: true }) salaireBrut: number;
  @Prop({ required: true }) cnss: number;
  @Prop({ required: true }) irpp: number;
  @Prop({ default: 0 }) autresRetenues: number;
  @Prop({ required: true }) salaireNet: number;
  @Prop({ enum: ['draft', 'validated', 'paid'], default: 'draft' }) status: string;
  @Prop({ required: true }) tenantId: string;
}
export const BulletinSchema = SchemaFactory.createForClass(Bulletin);
