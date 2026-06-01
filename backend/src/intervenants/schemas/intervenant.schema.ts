import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntervenantDocument = Intervenant & Document;

@Schema({ timestamps: true })
export class Intervenant {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({
    enum: ['salarie', 'externe'],
    required: true,
  })
  type: string;

  // Si salarié : référence à Employee
  @Prop({ type: String, ref: 'Employee' })
  employeeId?: string;

  // Si externe : référence à Supplier
  @Prop({ type: String, ref: 'Supplier' })
  supplierId?: string;

  @Prop()
  supplierName?: string;

  @Prop()
  position?: string;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  // Informations pour accès CRA
  @Prop({ default: false })
  canSubmitCRA: boolean;

  @Prop()
  craAccessToken?: string; // Token pour authentification externe

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const IntervenantSchema = SchemaFactory.createForClass(Intervenant);
IntervenantSchema.index({ tenantId: 1, email: 1 });
IntervenantSchema.index({ tenantId: 1, type: 1 });
IntervenantSchema.index({ tenantId: 1, employeeId: 1 });
IntervenantSchema.index({ tenantId: 1, supplierId: 1 });
