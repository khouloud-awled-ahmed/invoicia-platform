import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InvoiceItem, InvoiceItemSchema } from './invoice-item.schema';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true })
  number: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true, type: String, ref: 'Client' })
  clientId: string;

  @Prop({ required: true })
  client: string;

  @Prop()
  clientAddress?: string;

  @Prop()
  clientEmail?: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop()
  orderNumber?: string;

  @Prop()
  engagementId?: string;

  @Prop({ type: [InvoiceItemSchema], default: [] })
  items: InvoiceItem[];

  @Prop({ required: true, default: 0 })
  amountHT: number;

  @Prop({ required: true, default: 0 })
  amountTVA: number;

  @Prop({ required: true, default: 0 })
  amountTTC: number;

  /** Droit de Timbre (TND) */
  @Prop({ default: 0 })
  timbreFiscal: number;

  /** Retenue à la source */
  @Prop({ default: 0 })
  withholdingAmount: number;

  /** Net à Payer = TTC + Timbre - RS */
  @Prop({ default: 0 })
  netAPayer: number;

  // ─── AVOIR / REMAINING BALANCE ────────────────────────────────
  /** Total of all avoirs (credit notes) linked to this invoice */
  @Prop({ default: 0 })
  totalAvoirAmount: number;

  /** Remaining balance = amountTTC - totalAvoirAmount */
  @Prop({ default: null })
  remainingBalance: number;

  /** True if at least one avoir exists for this invoice */
  @Prop({ default: false })
  hasAvoirs: boolean;

  @Prop({ default: 'TND' })
  currency: string;

  @Prop({ default: 0 })
  deposit: number;

  @Prop()
  paymentTerms?: string;

  @Prop()
  notes?: string;

  @Prop({
    enum: ['draft', 'pending', 'validated', 'paid', 'archived', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop()
  extractionConfidence?: number;

  @Prop({ type: String, ref: 'CreditNote' })
  linkedCreditNoteId?: string;

  @Prop()
  linkedCreditNoteNumber?: string;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: [{ type: String, ref: 'Project' }], default: [] })
  projectIds: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ tenantId: 1, number: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, date: -1 });