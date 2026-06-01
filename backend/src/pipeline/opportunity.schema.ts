import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OpportunityDocument = Opportunity & Document;

@Schema({ timestamps: true })
export class Opportunity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  client: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  probability: number;

  @Prop({ default: 'lead', enum: ['lead','qualified','proposal','negotiation','won','lost'] })
  stage: string;

  @Prop()
  tenantId: string;
}

export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);
