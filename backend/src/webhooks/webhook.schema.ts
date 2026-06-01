import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Webhook extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) url: string;
  @Prop({ type: [String], default: [] }) events: string[];
  @Prop({ default: true }) active: boolean;
  @Prop({ required: true }) tenantId: string;
  @Prop() secret: string;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
