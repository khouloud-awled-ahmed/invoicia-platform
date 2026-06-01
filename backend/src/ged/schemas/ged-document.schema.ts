import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GEDDocumentDocument = GEDDocument & Document;

@Schema({ timestamps: true })
export class GEDDocument {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: 'GEDFolder' })
  folderId?: string;

  @Prop({ default: '/' })
  path: string; // Chemin complet du document

  @Prop({ required: true })
  fileName: string; // Nom original du fichier

  @Prop({ required: true })
  fileSize: number; // Taille en octets

  @Prop({ required: true })
  fileType: string; // MIME type

  @Prop({ required: true })
  gridFsFileId: string; // ID du fichier dans GridFS

  @Prop({
    enum: [
      'facture',
      'depense',
      'avoir',
      'devis',
      'document_fournisseur',
      'document_client',
      'contrat',
      'document_societe',
      'autre',
    ],
    default: 'autre',
  })
  documentType: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  description?: string;

  @Prop({ type: String, ref: 'User' })
  uploadedBy?: string;

  @Prop({ default: false })
  archived: boolean;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Object })
  metadata?: {
    year?: number;
    month?: number;
    entityId?: string; // ID de l'entité liée (facture, dépense, etc.)
    entityType?: string; // Type d'entité liée
    supplierName?: string; // Pour les documents fournisseurs
    clientName?: string; // Pour les documents clients
    [key: string]: any;
  };
}

export const GEDDocumentSchema = SchemaFactory.createForClass(GEDDocument);
GEDDocumentSchema.index({ tenantId: 1, folderId: 1 });
GEDDocumentSchema.index({ tenantId: 1, documentType: 1 });
GEDDocumentSchema.index({ tenantId: 1, path: 1 });
GEDDocumentSchema.index({ tenantId: 1, archived: 1 });
GEDDocumentSchema.index({ tenantId: 1, 'metadata.entityId': 1 });
