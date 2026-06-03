import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BankParserTemplate,
  BankParserTemplateDocument,
} from '../schemas/bank-parser-template.schema';
import { parse as csvParse } from 'csv-parse/sync';
import * as path from 'path';

// Import pdf-parse (CommonJS)
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib;

export interface ParsedTransaction {
  date: Date;
  label: string;
  amount: number;
  rawLine?: string[];
}

export interface AnalyzeFileResult {
  status: 'SUCCESS' | 'UNKNOWN_FORMAT';
  transactions?: ParsedTransaction[];
  rawData?: string[][];
  templateId?: string;
  templateName?: string;
  message?: string;
}

@Injectable()
export class BankFileParserService {
  private readonly logger = new Logger(BankFileParserService.name);

  constructor(
    @InjectModel(BankParserTemplate.name)
    private templateModel: Model<BankParserTemplateDocument>,
  ) {}

  /**
   * Analyse un fichier bancaire (PDF ou CSV)
   * Retourne soit les transactions extraites, soit les données brutes si format inconnu
   */
  async analyzeFile(
    file: any, // Express.Multer.File
    tenantId: string,
  ): Promise<AnalyzeFileResult> {
    try {
      // Déterminer le type de fichier
      const fileType = this.detectFileType(file.originalname, file.mimetype);

      // Extraire le texte brut
      let rawText: string;
      let rawLines: string[][];

      if (fileType === 'PDF') {
        rawText = await this.extractTextFromPDF(file.buffer);
        rawLines = this.textToLines(rawText);
      } else {
        // CSV
        rawLines = await this.parseCSV(file.buffer);
        rawText = rawLines.map((line) => line.join(' ')).join('\n');
      }

      // Chercher une signature connue
      const template = await this.findTemplateBySignature(rawText, tenantId);

      if (template) {
        // Format connu : extraire automatiquement
        this.logger.log(`Format reconnu: ${template.name} (${template.signature})`);
        const transactions = await this.extractTransactions(rawLines, template.config, fileType);

        return {
          status: 'SUCCESS',
          transactions,
          templateId: template._id.toString(),
          templateName: template.name,
          message: `Format "${template.name}" reconnu automatiquement`,
        };
      } else {
        // Format inconnu : retourner les données brutes pour mapping manuel
        this.logger.log(`Format inconnu, retour des données brutes (${rawLines.length} lignes)`);
        return {
          status: 'UNKNOWN_FORMAT',
          rawData: rawLines.slice(0, 50), // Limiter à 50 lignes pour l'UI
          message: 'Format non reconnu. Veuillez configurer le mapping manuellement.',
        };
      }
    } catch (error) {
      this.logger.error("Erreur lors de l'analyse du fichier:", error);
      throw new BadRequestException(`Erreur lors de l'analyse: ${error.message}`);
    }
  }

  /**
   * Apprend un nouveau format à partir de la configuration utilisateur
   */
  async learnFormat(
    tenantId: string,
    templateData: {
      name: string;
      signature: string;
      config: BankParserTemplate['config'];
      fileType: 'CSV' | 'PDF';
    },
  ): Promise<BankParserTemplateDocument> {
    // Vérifier qu'un template avec cette signature n'existe pas déjà
    const existing = await this.templateModel.findOne({
      tenantId,
      signature: templateData.signature,
    });

    if (existing) {
      // Mettre à jour le template existant
      existing.name = templateData.name;
      existing.config = templateData.config;
      existing.fileType = templateData.fileType;
      return await existing.save();
    }

    // Créer un nouveau template
    const template = new this.templateModel({
      ...templateData,
      tenantId,
      isActive: true,
    });

    return await template.save();
  }

  /**
   * Extrait le texte d'un PDF
   */
  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error: any) {
      this.logger.error("Erreur lors de l'extraction PDF:", error);
      if (error.message?.includes('Cannot find module') || error.message?.includes('pdf-parse')) {
        throw new BadRequestException(
          'Module pdf-parse non installé. Exécutez: npm install pdf-parse',
        );
      }
      throw new BadRequestException(`Impossible d'extraire le texte du PDF: ${error.message}`);
    }
  }

  /**
   * Parse un fichier CSV
   */
  private async parseCSV(buffer: Buffer): Promise<string[][]> {
    try {
      const text = buffer.toString('utf-8');
      // Détecter le délimiteur (semicolon ou comma)
      const delimiter = text.includes(';') ? ';' : ',';

      const records = csvParse(text, {
        delimiter,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      });

      return records as string[][];
    } catch (error: any) {
      this.logger.error('Erreur lors du parsing CSV:', error);
      if (error.message?.includes('Cannot find module') || error.message?.includes('csv-parse')) {
        throw new BadRequestException(
          'Module csv-parse non installé. Exécutez: npm install csv-parse',
        );
      }
      throw new BadRequestException(`Impossible de parser le fichier CSV: ${error.message}`);
    }
  }

  /**
   * Convertit le texte brut en lignes (pour PDF)
   */
  private textToLines(text: string): string[][] {
    return text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(/\s{2,}|\t/).filter((cell) => cell.trim().length > 0));
  }

  /**
   * Détecte le type de fichier
   */
  private detectFileType(filename: string, mimetype: string): 'PDF' | 'CSV' {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      return 'PDF';
    }
    if (ext === '.csv' || mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') {
      return 'CSV';
    }
    throw new BadRequestException(`Type de fichier non supporté: ${ext || mimetype}`);
  }

  /**
   * Trouve un template par signature dans le texte
   */
  private async findTemplateBySignature(
    text: string,
    tenantId: string,
  ): Promise<BankParserTemplateDocument | null> {
    const templates = await this.templateModel.find({
      tenantId,
      isActive: true,
    });

    for (const template of templates) {
      // Rechercher la signature dans le texte (insensible à la casse)
      if (text.toUpperCase().includes(template.signature.toUpperCase())) {
        return template;
      }
    }

    return null;
  }

  /**
   * Extrait les transactions selon la configuration du template
   */
  private async extractTransactions(
    rawLines: string[][],
    config: BankParserTemplate['config'],
    fileType: 'CSV' | 'PDF',
  ): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];
    const startIndex = config.hasHeader ? config.startRow + 1 : config.startRow;

    for (let i = startIndex; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Vérifier que la ligne a assez de colonnes
      const maxColumn = Math.max(config.dateColumn, config.labelColumn, config.amountColumn);
      if (line.length <= maxColumn) {
        continue; // Ligne incomplète, ignorer
      }

      try {
        // Extraire la date
        const dateStr = line[config.dateColumn]?.trim();
        if (!dateStr) continue;

        const date = this.parseDate(dateStr, config.dateFormat);
        if (!date) {
          this.logger.warn(`Date invalide à la ligne ${i + 1}: ${dateStr}`);
          continue;
        }

        // Extraire le libellé
        const label = line[config.labelColumn]?.trim() || '';

        // Extraire le montant
        const amountStr = line[config.amountColumn]?.trim();
        if (!amountStr) continue;

        const amount = this.parseAmount(amountStr);

        transactions.push({
          date,
          label,
          amount,
          rawLine: line,
        });
      } catch (error) {
        this.logger.warn(`Erreur à la ligne ${i + 1}: ${error.message}`);
        continue;
      }
    }

    return transactions;
  }

  /**
   * Parse une date selon le format spécifié
   */
  private parseDate(dateStr: string, format: string): Date | null {
    try {
      // Nettoyer la chaîne
      dateStr = dateStr.replace(/\s+/g, ' ').trim();

      // Formats supportés
      if (format === 'DD/MM/YYYY' || format === 'DD-MM-YYYY') {
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      } else if (format === 'YYYY-MM-DD') {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      } else if (format === 'DD.MM.YYYY') {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }

      // Fallback : essayer de parser avec Date native
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse un montant (supporte les formats français et internationaux)
   */
  private parseAmount(amountStr: string): number {
    // Nettoyer la chaîne
    let cleaned = amountStr.trim();

    // Remplacer les espaces insécables
    cleaned = cleaned.replace(/\u00A0/g, ' ');

    // Supprimer les espaces
    cleaned = cleaned.replace(/\s/g, '');

    // Gérer les formats français (virgule comme séparateur décimal)
    if (cleaned.includes(',') && !cleaned.includes('.')) {
      cleaned = cleaned.replace(/\./g, ''); // Supprimer les points de milliers
      cleaned = cleaned.replace(',', '.'); // Remplacer virgule par point
    } else if (cleaned.includes(',')) {
      // Format mixte : point pour milliers, virgule pour décimales
      cleaned = cleaned.replace(/\./g, '');
      cleaned = cleaned.replace(',', '.');
    }

    // Supprimer le symbole € ou autres devises
    cleaned = cleaned.replace(/[€$£]/g, '');

    const amount = parseFloat(cleaned);
    if (isNaN(amount)) {
      throw new Error(`Montant invalide: ${amountStr}`);
    }

    return amount;
  }

  /**
   * Liste tous les templates d'un tenant
   */
  async getTemplates(tenantId: string): Promise<BankParserTemplateDocument[]> {
    return await this.templateModel.find({ tenantId, isActive: true }).exec();
  }

  /**
   * Supprime un template
   */
  async deleteTemplate(templateId: string, tenantId: string): Promise<void> {
    const template = await this.templateModel.findOne({
      _id: templateId,
      tenantId,
    });

    if (!template) {
      throw new BadRequestException('Template non trouvé');
    }

    await this.templateModel.deleteOne({ _id: templateId });
  }
}
