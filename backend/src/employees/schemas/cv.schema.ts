import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CVDocument = CV & Document;

@Schema({ timestamps: true })
export class CV {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop()
  name?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  title?: string;

  @Prop()
  summary?: string;

  @Prop()
  yearsOfExperience?: number;

  @Prop()
  seniorityLevel?: string;

  @Prop()
  isManager?: boolean;

  @Prop()
  city?: string;

  @Prop({ type: [Object], default: [] })
  skills?: Record<string, any>[];

  @Prop({ type: [Object], default: [] })
  experiences?: Record<string, any>[];

  @Prop({ type: [Object], default: [] })
  education?: Record<string, any>[];

  @Prop({ type: [Object], default: [] })
  certifications?: Record<string, any>[];

  @Prop({ type: [Object], default: [] })
  languages?: Record<string, any>[];

  @Prop({ required: true, type: String })
  rawText: string;
}

export const CVSchema = SchemaFactory.createForClass(CV);
CVSchema.index({ tenantId: 1, createdAt: -1 });