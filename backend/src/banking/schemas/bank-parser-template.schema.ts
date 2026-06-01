import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankParserTemplateDocument = BankParserTemplate & Document;

@Schema({ timestamps: true })
export class BankParserTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  signature: string; // Mot-clé unique pour reconnaître le format (ex: "BNP PARIBAS SA")

  @Prop({ type: Object, required: true })
  config: {
    startRow: number; // Numéro de ligne où commencent les données (0-indexed)
    dateColumn: number; // Index de la colonne date
    labelColumn: number; // Index de la colonne libellé
    amountColumn: number; // Index de la colonne montant
    dateFormat: string; // Format de date (ex: "DD/MM/YYYY", "YYYY-MM-DD")
    hasHeader: boolean; // Si la première ligne est un en-tête
    delimiter?: string; // Pour CSV (ex: ";", ",")
    encoding?: string; // Encodage du fichier (ex: "utf-8", "latin1")
  };

  @Prop({ required: true })
  tenantId: string; // Format spécifique au tenant

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  fileType: 'CSV' | 'PDF'; // Type de fichier supporté
}

export const BankParserTemplateSchema = SchemaFactory.createForClass(BankParserTemplate);

// Index pour recherche rapide par signature
BankParserTemplateSchema.index({ tenantId: 1, signature: 1 });
BankParserTemplateSchema.index({ tenantId: 1, isActive: 1 });
