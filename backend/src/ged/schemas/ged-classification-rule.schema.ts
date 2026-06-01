import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GEDClassificationRuleDocument = GEDClassificationRule & Document;

@Schema({ timestamps: true })
export class GEDClassificationRule {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

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
    ],
    required: true,
  })
  documentType: string;

  @Prop({ required: true, type: String, ref: 'GEDFolder' })
  targetFolderId: string;

  @Prop({ type: [String], default: [] })
  keywords: string[]; // Mots-clés pour détection automatique

  @Prop({ type: [String], default: [] })
  fileExtensions: string[]; // Extensions de fichiers (ex: ['.pdf', '.jpg'])

  @Prop({ type: Object })
  conditions?: {
    entityType?: string; // Si lié à une entité spécifique
    minSize?: number; // Taille minimale
    maxSize?: number; // Taille maximale
    [key: string]: any;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  priority: number; // Priorité de la règle (plus élevé = appliqué en premier)
}

export const GEDClassificationRuleSchema = SchemaFactory.createForClass(GEDClassificationRule);
GEDClassificationRuleSchema.index({ tenantId: 1, documentType: 1 });
GEDClassificationRuleSchema.index({ tenantId: 1, isActive: 1 });
