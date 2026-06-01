import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClientContact, ClientContactSchema } from './client-contact.schema';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  name: string;

  @Prop()
  businessName?: string;

  @Prop()
  email?: string; // Email principal (déprécié, utiliser contacts)

  @Prop()
  phone?: string; // Téléphone principal (déprécié, utiliser contacts)

  @Prop()
  address?: string;

  /** Matricule Fiscal client (Tunisie) */
  @Prop()
  matriculeFiscal?: string;

  @Prop()
  vatNumber?: string;

  /** Retenue à la source (RS) - Boolean ou taux pour calcul Net à Payer */
  @Prop({ default: false })
  withholdingTax?: boolean;

  @Prop()
  withholdingTaxRate?: number;

  // Contacts (principal + multiples)
  @Prop({ type: [ClientContactSchema], default: [] })
  contacts: ClientContact[];

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
ClientSchema.index({ tenantId: 1, name: 1 });
ClientSchema.index({ tenantId: 1, email: 1 });

