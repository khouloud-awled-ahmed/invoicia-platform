import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ParsingTemplateDocument = ParsingTemplate & Document;

export type DocumentType = 'BANK' | 'INVOICE' | 'CV';

@Schema({ timestamps: true })
export class ParsingTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  signature: string; // Mot-clé unique pour reconnaître le format

  @Prop({ required: true, enum: ['BANK', 'INVOICE', 'CV'] })
  type: DocumentType;

  @Prop({ type: Object, required: true })
  config: {
    // Pour BANK (relevés bancaires)
    startRow?: number;
    dateColumn?: number;
    labelColumn?: number;
    amountColumn?: number;
    dateFormat?: string;
    hasHeader?: boolean;
    delimiter?: string;
    encoding?: string;

    // Pour INVOICE (factures)
    invoiceNumberPattern?: string; // Regex pour trouver le numéro
    datePattern?: string; // Regex pour trouver la date
    totalHTPattern?: string; // Regex pour trouver Total HT
    totalTVAPattern?: string; // Regex pour trouver TVA
    totalTTCPattern?: string; // Regex pour trouver Total TTC
    supplierPattern?: string; // Regex pour trouver le fournisseur

    // Pour CV (candidats)
    emailPattern?: string; // Regex pour email
    phonePattern?: string; // Regex pour téléphone
    skillsKeywords?: string[]; // Mots-clés pour détecter compétences
    experienceKeywords?: string[]; // Mots-clés pour détecter expérience
  };

  @Prop({ required: true })
  tenantId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  fileType: 'CSV' | 'PDF' | 'DOCX'; // Type de fichier supporté
}

export const ParsingTemplateSchema = SchemaFactory.createForClass(ParsingTemplate);

// Index pour recherche rapide
ParsingTemplateSchema.index({ tenantId: 1, type: 1, signature: 1 });
ParsingTemplateSchema.index({ tenantId: 1, type: 1, isActive: 1 });
