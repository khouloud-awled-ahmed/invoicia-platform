import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountingEntryDocument = AccountingEntry & Document;

@Schema({ timestamps: true })
export class AccountingEntry {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  account: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true, default: 0 })
  debit: number;

  @Prop({ required: true, default: 0 })
  credit: number;

  @Prop()
  journal: string;

  @Prop()
  reference?: string;

  @Prop({ default: false })
  validated: boolean;

  @Prop({ default: false })
  locked: boolean;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;
}

export const AccountingEntrySchema = SchemaFactory.createForClass(AccountingEntry);
AccountingEntrySchema.index({ tenantId: 1, date: -1 });
AccountingEntrySchema.index({ tenantId: 1, account: 1 });
