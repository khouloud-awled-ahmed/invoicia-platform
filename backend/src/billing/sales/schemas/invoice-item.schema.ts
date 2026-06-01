import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class InvoiceItem {
  @Prop({ required: false, default: 'Article' })
  article: string;

  @Prop()
  description: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  discount: number;

  /** Taux TVA Tunisie: 19, 13 ou 7 */
  @Prop({ required: true, default: 19 })
  vatRate: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);
