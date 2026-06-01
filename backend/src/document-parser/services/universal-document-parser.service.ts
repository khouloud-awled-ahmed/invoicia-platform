import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParsingTemplate, ParsingTemplateDocument, DocumentType } from '../schemas/parsing-template.schema';
import { parse as csvParse } from 'csv-parse/sync';
import * as path from 'path';
import * as mammoth from 'mammoth';

export interface ParsedBankTransaction {
  date: Date;
  label: string;
  amount: number;
  rawLine?: string[];
}

export interface ParsedInvoice {
  invoiceNumber?: string;
  date?: Date;
  dueDate?: Date;
  supplierName?: string;
  supplierAddress?: string;
  supplierSIRET?: string;
  supplierVAT?: string;
  totalHT?: number;
  totalTVA?: number;
  totalTTC?: number;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    totalHT: number;
  }>;
  rawText?: string;
}

export interface ParsedCV {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experiences?: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    year?: string;
  }>;
  rawText?: string;
}

export interface AnalyzeFileResult {
  status: 'SUCCESS' | 'UNKNOWN_FORMAT' | 'LEARNING_NEEDED';
  documentId?: string;
  data?: ParsedBankTransaction[] | ParsedInvoice | ParsedCV;
  rawData?: string[][];
  rawText?: string;
  templateId?: string;
  templateName?: string;
  message?: string;
  confidence?: number;
}

@Injectable()
export class UniversalDocumentParserService {
  private readonly logger = new Logger(UniversalDocumentParserService.name);

  constructor(
    @InjectModel(ParsingTemplate.name)
    private templateModel: Model<ParsingTemplateDocument>,
  ) {}

  async analyze(
    file: any,
    documentType: DocumentType,
    tenantId: string,
  ): Promise<AnalyzeFileResult> {
    try {
      const fileType = this.detectFileType(file.originalname, file.mimetype);
      
      let rawText: string;
      let rawLines: string[][];

      if (fileType === 'PDF') {
        rawText = await this.extractTextFromPDF(file.buffer);
        rawLines = this.textToLines(rawText);
      } else if (fileType === 'CSV') {
        rawLines = await this.parseCSV(file.buffer);
        rawText = rawLines.map(line => line.join(' ')).join('\n');
      } else if (fileType === 'DOCX') {
        const extracted = await this.extractTextFromDocx(file.buffer);
        rawText = extracted;
        rawLines = this.textToLines(rawText);
      } else {
        throw new BadRequestException(`Type de fichier non supporté pour le parsing: ${fileType}`);
      }

      const template = await this.findTemplateBySignature(rawText, documentType, tenantId);

      if (template) {
        this.logger.log(`Format reconnu: ${template.name} (${template.signature}) pour type ${documentType}`);
        
        let data: any;
        if (documentType === 'BANK') {
          data = await this.extractBankTransactions(rawLines, template, fileType);
        } else if (documentType === 'INVOICE') {
          data = await this.extractInvoiceData(rawText, rawLines, template);
        } else if (documentType === 'CV') {
          data = await this.extractCVData(rawText, template);
        }
        
        return {
          status: 'SUCCESS',
          data,
          templateId: template._id.toString(),
          templateName: template.name,
          message: `Format "${template.name}" reconnu automatiquement`,
          confidence: 0.95,
        };
      } else {
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.logger.log(`Format inconnu pour ${documentType}, documentId: ${documentId}`);
        
        return {
          status: 'LEARNING_NEEDED',
          documentId,
          rawData: rawLines.slice(0, 50),
          rawText: rawText.substring(0, 5000),
          message: `Format non reconnu. Le système peut apprendre à lire ce type de document.`,
        };
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'analyse du document ${documentType}:`, error);
      throw new BadRequestException(`Erreur lors de l'analyse: ${error.message}`);
    }
  }

  async learnFormat(
    tenantId: string,
    templateData: {
      name: string;
      signature: string;
      type: DocumentType;
      config: ParsingTemplate['config'];
      fileType: 'CSV' | 'PDF' | 'DOCX';
    },
  ): Promise<ParsingTemplateDocument> {
    const existing = await this.templateModel.findOne({
      tenantId,
      type: templateData.type,
      signature: templateData.signature,
    });

    if (existing) {
      existing.name = templateData.name;
      existing.config = templateData.config;
      existing.fileType = templateData.fileType;
      return await existing.save();
    }

    const template = new this.templateModel({
      ...templateData,
      tenantId,
      isActive: true,
    });

    return await template.save();
  }

  private async extractBankTransactions(
    rawLines: string[][],
    template: ParsingTemplateDocument,
    fileType: 'CSV' | 'PDF' | 'DOCX',
  ): Promise<ParsedBankTransaction[]> {
    const config = template.config;
    const transactions: ParsedBankTransaction[] = [];
    const startIndex = config.hasHeader ? (config.startRow || 0) + 1 : (config.startRow || 0);

    for (let i = startIndex; i < rawLines.length; i++) {
      const line = rawLines[i];
      
      const maxColumn = Math.max(
        config.dateColumn || 0,
        config.labelColumn || 0,
        config.amountColumn || 0,
      );
      if (line.length <= maxColumn) continue;

      try {
        const dateStr = line[config.dateColumn || 0]?.trim();
        if (!dateStr) continue;

        const date = this.parseDate(dateStr, config.dateFormat || 'DD/MM/YYYY');
        if (!date) continue;

        const label = line[config.labelColumn || 0]?.trim() || '';
        const amountStr = line[config.amountColumn || 0]?.trim();
        if (!amountStr) continue;

        const amount = this.parseAmount(amountStr);

        transactions.push({ date, label, amount, rawLine: line });
      } catch (error) {
        this.logger.warn(`Erreur à la ligne ${i + 1}: ${error.message}`);
        continue;
      }
    }

    return transactions;
  }

  private async extractInvoiceData(
    rawText: string,
    rawLines: string[][],
    template: ParsingTemplateDocument,
  ): Promise<ParsedInvoice> {
    const config = template.config;
    const invoice: ParsedInvoice = { rawText };

    if (config.invoiceNumberPattern) {
      const match = rawText.match(new RegExp(config.invoiceNumberPattern, 'i'));
      if (match) invoice.invoiceNumber = match[1] || match[0];
    } else {
      const invoiceMatch = rawText.match(/(?:facture|invoice|n[°º]|no\.?)\s*:?\s*([A-Z0-9\-]+)/i);
      if (invoiceMatch) invoice.invoiceNumber = invoiceMatch[1];
    }

    if (config.datePattern) {
      const match = rawText.match(new RegExp(config.datePattern, 'i'));
      if (match) {
        const dateStr = match[1] || match[0];
        invoice.date = this.parseDate(dateStr, 'DD/MM/YYYY') || undefined;
      }
    } else {
      const dateMatch = rawText.match(/(?:date|le)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
      if (dateMatch) invoice.date = this.parseDate(dateMatch[1], 'DD/MM/YYYY') || undefined;
    }

    if (config.totalHTPattern) {
      const match = rawText.match(new RegExp(config.totalHTPattern, 'i'));
      if (match) invoice.totalHT = this.parseAmount(match[1] || match[0]);
    } else {
      const htMatch = rawText.match(/(?:total\s*ht|ht\s*total|montant\s*ht)\s*:?\s*([\d\s,\.]+)\s*€?/i);
      if (htMatch) invoice.totalHT = this.parseAmount(htMatch[1]);
    }

    if (config.totalTVAPattern) {
      const match = rawText.match(new RegExp(config.totalTVAPattern, 'i'));
      if (match) invoice.totalTVA = this.parseAmount(match[1] || match[0]);
    } else {
      const tvaMatch = rawText.match(/(?:tva|t\.v\.a\.?)\s*:?\s*([\d\s,\.]+)\s*€?/i);
      if (tvaMatch) invoice.totalTVA = this.parseAmount(tvaMatch[1]);
    }

    if (config.totalTTCPattern) {
      const match = rawText.match(new RegExp(config.totalTTCPattern, 'i'));
      if (match) invoice.totalTTC = this.parseAmount(match[1] || match[0]);
    } else {
      const ttcMatch = rawText.match(/(?:total\s*ttc|ttc\s*total|montant\s*ttc)\s*:?\s*([\d\s,\.]+)\s*€?/i);
      if (ttcMatch) invoice.totalTTC = this.parseAmount(ttcMatch[1]);
    }

    if (config.supplierPattern) {
      const match = rawText.match(new RegExp(config.supplierPattern, 'i'));
      if (match) invoice.supplierName = match[1] || match[0];
    } else {
      for (let i = 0; i < Math.min(10, rawLines.length); i++) {
        const line = rawLines[i].join(' ');
        if (line.length > 10 && line.length < 100) {
          invoice.supplierName = line.trim();
          break;
        }
      }
    }

    return invoice;
  }

  private async extractCVData(
    rawText: string,
    template: ParsingTemplateDocument,
  ): Promise<ParsedCV> {
    const config = template.config;
    const cv: ParsedCV = { rawText };

    if (config.emailPattern) {
      const match = rawText.match(new RegExp(config.emailPattern, 'i'));
      if (match) cv.email = match[1] || match[0];
    } else {
      const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) cv.email = emailMatch[1];
    }

    if (config.phonePattern) {
      const match = rawText.match(new RegExp(config.phonePattern, 'i'));
      if (match) cv.phone = match[1] || match[0];
    } else {
      const phoneMatch = rawText.match(/(?:\+216|\+33|0)[1-9](?:[\.\s\-]?\d{2}){4}/);
      if (phoneMatch) cv.phone = phoneMatch[0];
    }

    const lines = rawText.split('\n').slice(0, 5);
    for (const line of lines) {
      const nameMatch = line.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
      if (nameMatch && nameMatch[1].length > 2 && nameMatch[2].length > 2) {
        cv.firstName = nameMatch[1];
        cv.lastName = nameMatch[2];
        break;
      }
    }

    if (config.skillsKeywords && config.skillsKeywords.length > 0) {
      cv.skills = [];
      const textLower = rawText.toLowerCase();
      for (const keyword of config.skillsKeywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          cv.skills.push(keyword);
        }
      }
    }

    const titleMatch = rawText.match(/(?:titre|position|poste)\s*:?\s*(.+)/i);
    if (titleMatch) cv.title = titleMatch[1].trim();

    return cv;
  }

  // ── PDF extraction using pdftotext (poppler) ──────────────────────────────
  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const os = require('os');
      const tmpIn = os.tmpdir() + '\\cv_' + Date.now() + '.pdf';
      const tmpOut = os.tmpdir() + '\\cv_' + Date.now() + '.txt';
      fs.writeFileSync(tmpIn, buffer);
      const pop = 'C:\\Users\\k\\Downloads\\Release-26.02.0-0\\poppler-26.02.0\\Library\\bin\\pdftotext.exe';
      execSync(`"${pop}" "${tmpIn}" "${tmpOut}"`, { timeout: 30000 });
      const text = fs.readFileSync(tmpOut, 'utf8');
      try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
      if (text && text.trim().length > 0) return text;
      throw new Error('Empty text extracted');
    } catch (error: any) {
      this.logger.error('Erreur extraction PDF:', error.message);
      throw new BadRequestException(`Impossible d'extraire le texte du PDF: ${error.message}`);
    }
  }

  private async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value;
      if (typeof rawText !== 'string') {
        throw new Error('Extraction Word invalide: le résultat n\'est pas une chaîne');
      }
      return rawText;
    } catch (error: any) {
      this.logger.error('Erreur lors de l\'extraction Word (.docx):', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Impossible de lire ce fichier Word.');
    }
  }

  private async parseCSV(buffer: Buffer): Promise<string[][]> {
    try {
      const text = buffer.toString('utf-8');
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
      throw new BadRequestException(`Impossible de parser le fichier CSV: ${error.message}`);
    }
  }

  private textToLines(text: string): string[][] {
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.split(/\s{2,}|\t/).filter(cell => cell.trim().length > 0));
  }

  private detectFileType(filename: string, mimetype: string): 'PDF' | 'CSV' | 'DOCX' {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf' || mimetype === 'application/pdf') return 'PDF';
    if (ext === '.csv' || mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') return 'CSV';
    if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    throw new BadRequestException(`Type de fichier non supporté: ${ext || mimetype}`);
  }

  private async findTemplateBySignature(
    text: string,
    documentType: DocumentType,
    tenantId: string,
  ): Promise<ParsingTemplateDocument | null> {
    const templates = await this.templateModel.find({ tenantId, type: documentType, isActive: true });
    for (const template of templates) {
      if (text.toUpperCase().includes(template.signature.toUpperCase())) return template;
    }
    return null;
  }

  private parseDate(dateStr: string, format: string): Date | null {
    try {
      dateStr = dateStr.replace(/\s+/g, ' ').trim();
      if (format === 'DD/MM/YYYY' || format === 'DD-MM-YYYY') {
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
      } else if (format === 'YYYY-MM-DD') {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
      }
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
      return null;
    } catch {
      return null;
    }
  }

  private parseAmount(amountStr: string): number {
    let cleaned = amountStr.trim().replace(/\u00A0/g, ' ').replace(/\s/g, '');
    if (cleaned.includes(',') && !cleaned.includes('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    cleaned = cleaned.replace(/[€$£]/g, '');
    const amount = parseFloat(cleaned);
    if (isNaN(amount)) throw new Error(`Montant invalide: ${amountStr}`);
    return amount;
  }

  async getTemplates(tenantId: string, type?: DocumentType): Promise<ParsingTemplateDocument[]> {
    const query: any = { tenantId, isActive: true };
    if (type) query.type = type;
    return await this.templateModel.find(query).exec();
  }

  async deleteTemplate(templateId: string, tenantId: string): Promise<void> {
    const template = await this.templateModel.findOne({ _id: templateId, tenantId });
    if (!template) throw new BadRequestException('Template non trouvé');
    await this.templateModel.deleteOne({ _id: templateId });
  }
}
