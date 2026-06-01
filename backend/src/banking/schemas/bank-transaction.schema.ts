import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankTransactionDocument = BankTransaction & Document;

export enum BankTransactionStatus {
  UNRECONCILED = 'UNRECONCILED',
  RECONCILED = 'RECONCILED',
}

@Schema({ timestamps: true })
export class BankTransaction {
  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ type: String, ref: 'BankAccount', required: true })
  bankAccountId: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  label: string;

  /** Montant signé : positif = entrée, négatif = sortie (ou utiliser type + montant absolu) */
  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({ enum: ['debit', 'credit'], required: true })
  type: 'debit' | 'credit';

  @Prop({ enum: BankTransactionStatus, default: BankTransactionStatus.UNRECONCILED })
  status: BankTransactionStatus;

  @Prop({ type: Date })
  reconciledAt?: Date;

  @Prop()
  targetType?: 'INVOICE' | 'EXPENSE' | 'PAYROLL' | 'TAX';

  @Prop()
  targetId?: string;

  @Prop()
  rawLine?: string;

  @Prop()
  category?: string;
}

export const BankTransactionSchema = SchemaFactory.createForClass(BankTransaction);
BankTransactionSchema.index({ tenantId: 1, bankAccountId: 1, date: -1 });
BankTransactionSchema.index({ tenantId: 1, status: 1 });
