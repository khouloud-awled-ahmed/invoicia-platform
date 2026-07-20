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

  @Prop({ required: true, type: String })
  rawText: string;
}

export const CVSchema = SchemaFactory.createForClass(CV);
CVSchema.index({ tenantId: 1, createdAt: -1 });
