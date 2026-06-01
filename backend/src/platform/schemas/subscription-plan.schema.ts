import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ required: true, default: 'EUR' })
  currency: string;

  @Prop({ type: [String], default: [] })
  features: string[]; // Array of module IDs: 'SALES', 'PURCHASES', etc.

  @Prop({ default: 10 })
  maxUsers: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: {
    billingPeriod?: 'monthly' | 'yearly';
    trialDays?: number;
    [key: string]: any;
  };
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
