import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnvelopeDocument = Envelope & Document;

export enum EnvelopeStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VOIDED = 'VOIDED',
  EXPIRED = 'EXPIRED',
}

export enum RecipientStatus {
  WAITING = 'WAITING',
  SENT = 'SENT',
  SIGNED = 'SIGNED',
  REFUSED = 'REFUSED',
}

export enum RecipientRole {
  SIGNER = 'SIGNER',
  VIEWER = 'VIEWER',
}

export enum FieldType {
  SIGNATURE = 'SIGNATURE',
  INITIALS = 'INITIALS',
  DATE = 'DATE',
  TEXT = 'TEXT',
  CHECKBOX = 'CHECKBOX',
}

@Schema({ _id: false })
export class AuditEvent {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  action: string;

  @Prop()
  actorEmail?: string;

  @Prop()
  actorName?: string;

  @Prop()
  ipAddress?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);

@Schema({ _id: false })
export class Field {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: FieldType })
  type: FieldType;

  @Prop({ required: false, min: 1 })
  pageNumber: number;

  @Prop({ required: false, min: 0 })
  xPosition: number;

  @Prop({ required: false, min: 0 })
  yPosition: number;

  @Prop({ required: true, min: 1 })
  width: number;

  @Prop({ required: true, min: 1 })
  height: number;

  @Prop({ required: false })
  assignedRecipientId: string;

  @Prop({ required: false })
  linkedDocumentId: string;

  @Prop({ default: true })
  required: boolean;

  @Prop()
  label?: string;

  @Prop()
  value?: string;

  @Prop()
  defaultValue?: boolean; // Pour les checkboxes

  @Prop()
  signedAt?: Date;

  @Prop()
  signedBy?: string;

  @Prop()
  signatureData?: string; // Image base64 de la signature pour les champs SIGNATURE
}

export const FieldSchema = SchemaFactory.createForClass(Field);

@Schema({ _id: false })
export class EnvelopeDocumentFile {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop()
  fileSize?: number;

  @Prop()
  mimeType?: string;

  @Prop({ required: true })
  order: number;

  @Prop()
  signedFileUrl?: string;
}

export const EnvelopeDocumentFileSchema = SchemaFactory.createForClass(EnvelopeDocumentFile);

@Schema({ _id: false })
export class Recipient {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, enum: RecipientRole })
  role: RecipientRole;

  @Prop({ required: true })
  routingOrder: number;

  @Prop({ required: true, enum: RecipientStatus, default: RecipientStatus.WAITING })
  status: RecipientStatus;

  @Prop()
  securityCode?: string;

  @Prop()
  signedAt?: Date;

  @Prop()
  refusedAt?: Date;

  @Prop()
  refusalReason?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  color?: string;

  @Prop()
  userAgent?: string; // Navigateur utilisé lors de la signature
}

export const RecipientSchema = SchemaFactory.createForClass(Recipient);

@Schema({ timestamps: true })
export class Envelope {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: EnvelopeStatus, default: EnvelopeStatus.DRAFT })
  status: EnvelopeStatus;

  @Prop({ required: true, default: 1 })
  currentRoutingOrder: number;

  @Prop({ type: [RecipientSchema], default: [] })
  recipients: Recipient[];

  @Prop({ type: [EnvelopeDocumentFileSchema], default: [] })
  documents: EnvelopeDocumentFile[];

  @Prop({ type: [FieldSchema], default: [] })
  fields: Field[];

  @Prop({ type: [AuditEventSchema], default: [] })
  auditTrail: AuditEvent[];

  @Prop()
  message?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop()
  certificateUrl?: string;

  @Prop()
  completedAt?: Date;
}

export const EnvelopeSchema = SchemaFactory.createForClass(Envelope);

EnvelopeSchema.index({ tenantId: 1, createdAt: -1 });
EnvelopeSchema.index({ 'recipients.email': 1 });
EnvelopeSchema.index({ status: 1 });
EnvelopeSchema.index({ expiresAt: 1 });



