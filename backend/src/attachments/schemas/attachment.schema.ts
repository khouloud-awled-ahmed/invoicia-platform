import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttachmentDocument = Attachment & Document;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, enum: ['invoice', 'purchase_invoice', 'credit_note', 'tenant_logo', 'ged'] })
  entityType: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  gridFsFileId: string; // ID du fichier dans GridFS

  @Prop()
  uploadedBy?: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

// Index pour les requêtes fréquentes
AttachmentSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });
AttachmentSchema.index({ tenantId: 1, gridFsFileId: 1 });
