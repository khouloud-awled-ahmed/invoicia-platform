import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  supplier: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  amountHT: number;

  @Prop({ required: true, default: 0 })
  amountTVA: number;

  @Prop({ required: true, default: 0 })
  amountTTC: number;

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({
    enum: ['pending', 'verified', 'exported', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop()
  documentUrl?: string;

  @Prop()
  documentType?: string;

  @Prop()
  extractionConfidence?: number;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop()
  notes?: string;

  @Prop()
  paymentMethod?: string;

  @Prop({ default: false })
  isDuplicate: boolean;

  @Prop()
  approvedBy?: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ tenantId: 1, date: -1 });
ExpenseSchema.index({ tenantId: 1, status: 1 });
