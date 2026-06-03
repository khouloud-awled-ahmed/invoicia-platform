import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InvoiceItem, InvoiceItemSchema } from '../../billing/sales/schemas/invoice-item.schema';

export type CreditNoteDocument = CreditNote & Document;

@Schema({ timestamps: true })
export class CreditNote {
  @Prop({ required: true })
  number: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: false, type: String, ref: 'Invoice' })
  relatedInvoiceId?: string;

  @Prop()
  relatedInvoiceNumber?: string;

  @Prop({ required: true, type: String, ref: 'Client' })
  clientId: string;

  @Prop({ required: true })
  client: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ type: [InvoiceItemSchema], default: [] })
  items: InvoiceItem[];

  @Prop({ required: true, default: 0 })
  amountHT: number;

  @Prop({ required: true, default: 0 })
  amountTVA: number;

  @Prop({ required: true, default: 0 })
  amountTTC: number;

  @Prop({ default: 20 })
  tvaRate: number;

  @Prop()
  reason?: string;

  @Prop({
    enum: ['draft', 'pending', 'validated', 'archived'],
    default: 'draft',
  })
  status: string;
}

export const CreditNoteSchema = SchemaFactory.createForClass(CreditNote);
// Index unique composé : le numéro d'avoir doit être unique par tenant (pas globalement)
CreditNoteSchema.index({ tenantId: 1, number: 1 }, { unique: true });
CreditNoteSchema.index({ tenantId: 1, relatedInvoiceId: 1 });
