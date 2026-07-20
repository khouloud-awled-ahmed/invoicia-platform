import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ required: true })
  account: string;

  @Prop({ required: true })
  accountLabel: string;

  @Prop({ required: true })
  period: string; // format "YYYY-MM"

  @Prop({ required: true })
  budgeted: number;

  @Prop({ required: true })
  tenantId: string;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
BudgetSchema.index({ tenantId: 1, period: 1 });