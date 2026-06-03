import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true })
  name: string;

  @Prop()
  businessName?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  /** Matricule Fiscal fournisseur (Tunisie) */
  matriculeFiscal?: string;

  @Prop()
  vatNumber?: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  // Intervenants externes rattachés à ce fournisseur
  @Prop({ type: [{ type: String, ref: 'Intervenant' }], default: [] })
  intervenantIds: string[];

  // Email pour recevoir les factures
  @Prop()
  invoiceEmail?: string;

  @Prop({ default: false })
  canSendInvoiceByEmail: boolean;

  // Token pour authentification email (si facturation par email)
  @Prop()
  emailInvoiceToken?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.index({ tenantId: 1, name: 1 });
