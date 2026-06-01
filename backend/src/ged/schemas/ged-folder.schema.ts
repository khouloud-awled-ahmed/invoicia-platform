import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GEDFolderDocument = GEDFolder & Document;

@Schema({ timestamps: true })
export class GEDFolder {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: 'GEDFolder' })
  parentId?: string;

  @Prop({ default: 'root' })
  path: string; // Chemin complet du dossier (ex: "/Factures/2025")

  @Prop({ default: 0 })
  documentCount: number;

  @Prop({ default: 0 })
  totalSize: number; // Taille totale en octets

  @Prop({
    enum: [
      'root',
      'factures',
      'depenses',
      'avoirs',
      'devis',
      'documents_fournisseurs',
      'documents_clients',
      'contrats',
      'documents_societe',
      'autre',
    ],
    default: 'autre',
  })
  documentType?: string; // Type de document pour classement automatique

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  metadata?: {
    color?: string;
    icon?: string;
    [key: string]: any;
  };
}

export const GEDFolderSchema = SchemaFactory.createForClass(GEDFolder);
GEDFolderSchema.index({ tenantId: 1, parentId: 1 });
GEDFolderSchema.index({ tenantId: 1, path: 1 });
GEDFolderSchema.index({ tenantId: 1, documentType: 1 });
