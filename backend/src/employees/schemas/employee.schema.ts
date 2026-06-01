import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ type: Date })
  hireDate?: Date;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop()
  position?: string;

  @Prop()
  department?: string;

  @Prop({ default: 0 })
  salary?: number;

  /** Matricule CNSS (Assuré) - Tunisie */
  @Prop()
  matriculeCNSS?: string;

  /** Carte d'identité nationale */
  @Prop()
  cin?: string;

  @Prop({ type: Date })
  cinDeliveryDate?: Date;

  /** Chef de famille (pour calcul IRPP) */
  @Prop({ default: false })
  chefDeFamille?: boolean;

  /** Nombre d'enfants à charge (pour calcul IRPP) */
  @Prop({ default: 0 })
  enfantsACharge?: number;

  @Prop({
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active',
  })
  status: string;

  @Prop({ type: String, ref: 'User' })
  userId?: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ tenantId: 1, email: 1 });
EmployeeSchema.index({ tenantId: 1, status: 1 });

