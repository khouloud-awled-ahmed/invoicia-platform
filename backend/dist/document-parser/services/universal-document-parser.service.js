"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UniversalDocumentParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalDocumentParserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parsing_template_schema_1 = require("../schemas/parsing-template.schema");
const sync_1 = require("csv-parse/sync");
const path = require("path");
const mammoth = require("mammoth");
let UniversalDocumentParserService = UniversalDocumentParserService_1 = class UniversalDocumentParserService {
    constructor(templateModel) {
        this.templateModel = templateModel;
        this.logger = new common_1.Logger(UniversalDocumentParserService_1.name);
    }
    async analyze(file, documentType, tenantId) {
        try {
            const fileType = this.detectFileType(file.originalname, file.mimetype);
            let rawText;
            let rawLines;
            if (fileType === 'PDF') {
                rawText = await this.extractTextFromPDF(file.buffer);
                rawLines = this.textToLines(rawText);
            }
            else if (fileType === 'CSV') {
                rawLines = await this.parseCSV(file.buffer);
                rawText = rawLines.map((line) => line.join(' ')).join('\n');
            }
            else if (fileType === 'DOCX') {
                const extracted = await this.extractTextFromDocx(file.buffer);
                rawText = extracted;
                rawLines = this.textToLines(rawText);
            }
            else {
                throw new common_1.BadRequestException(`Type de fichier non supporté pour le parsing: ${fileType}`);
            }
            const template = await this.findTemplateBySignature(rawText, documentType, tenantId);
            if (template) {
                this.logger.log(`Format reconnu: ${template.name} (${template.signature}) pour type ${documentType}`);
                let data;
                if (documentType === 'BANK') {
                    data = await this.extractBankTransactions(rawLines, template, fileType);
                }
                else if (documentType === 'INVOICE') {
                    data = await this.extractInvoiceData(rawText, rawLines, template);
                }
                else if (documentType === 'CV') {
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
            }
            else {
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
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'analyse du document ${documentType}:`, error);
            throw new common_1.BadRequestException(`Erreur lors de l'analyse: ${error.message}`);
        }
    }
    async learnFormat(tenantId, templateData) {
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
    async extractBankTransactions(rawLines, template, fileType) {
        const config = template.config;
        const transactions = [];
        const startIndex = config.hasHeader ? (config.startRow || 0) + 1 : config.startRow || 0;
        for (let i = startIndex; i < rawLines.length; i++) {
            const line = rawLines[i];
            const maxColumn = Math.max(config.dateColumn || 0, config.labelColumn || 0, config.amountColumn || 0);
            if (line.length <= maxColumn)
                continue;
            try {
                const dateStr = line[config.dateColumn || 0]?.trim();
                if (!dateStr)
                    continue;
                const date = this.parseDate(dateStr, config.dateFormat || 'DD/MM/YYYY');
                if (!date)
                    continue;
                const label = line[config.labelColumn || 0]?.trim() || '';
                const amountStr = line[config.amountColumn || 0]?.trim();
                if (!amountStr)
                    continue;
                const amount = this.parseAmount(amountStr);
                transactions.push({ date, label, amount, rawLine: line });
            }
            catch (error) {
                this.logger.warn(`Erreur à la ligne ${i + 1}: ${error.message}`);
                continue;
            }
        }
        return transactions;
    }
    async extractInvoiceData(rawText, rawLines, template) {
        const config = template.config;
        const invoice = { rawText };
        if (config.invoiceNumberPattern) {
            const match = rawText.match(new RegExp(config.invoiceNumberPattern, 'i'));
            if (match)
                invoice.invoiceNumber = match[1] || match[0];
        }
        else {
            const invoiceMatch = rawText.match(/(?:facture|invoice|n[°º]|no\.?)\s*:?\s*([A-Z0-9\-]+)/i);
            if (invoiceMatch)
                invoice.invoiceNumber = invoiceMatch[1];
        }
        if (config.datePattern) {
            const match = rawText.match(new RegExp(config.datePattern, 'i'));
            if (match) {
                const dateStr = match[1] || match[0];
                invoice.date = this.parseDate(dateStr, 'DD/MM/YYYY') || undefined;
            }
        }
        else {
            const dateMatch = rawText.match(/(?:date|le)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
            if (dateMatch)
                invoice.date = this.parseDate(dateMatch[1], 'DD/MM/YYYY') || undefined;
        }
        if (config.totalHTPattern) {
            const match = rawText.match(new RegExp(config.totalHTPattern, 'i'));
            if (match)
                invoice.totalHT = this.parseAmount(match[1] || match[0]);
        }
        else {
            const htMatch = rawText.match(/(?:total\s*ht|ht\s*total|montant\s*ht)\s*:?\s*([\d\s,\.]+)\s*€?/i);
            if (htMatch)
                invoice.totalHT = this.parseAmount(htMatch[1]);
        }
        if (config.totalTVAPattern) {
            const match = rawText.match(new RegExp(config.totalTVAPattern, 'i'));
            if (match)
                invoice.totalTVA = this.parseAmount(match[1] || match[0]);
        }
        else {
            const tvaMatch = rawText.match(/(?:tva|t\.v\.a\.?)\s*:?\s*([\d\s,\.]+)\s*€?/i);
            if (tvaMatch)
                invoice.totalTVA = this.parseAmount(tvaMatch[1]);
        }
        if (config.totalTTCPattern) {
            const match = rawText.match(new RegExp(config.totalTTCPattern, 'i'));
            if (match)
                invoice.totalTTC = this.parseAmount(match[1] || match[0]);
        }
        else {
            const ttcMatch = rawText.match(/(?:total\s*ttc|ttc\s*total|montant\s*ttc)\s*:?\s*([\d\s,\.]+)\s*€?/i);
            if (ttcMatch)
                invoice.totalTTC = this.parseAmount(ttcMatch[1]);
        }
        if (config.supplierPattern) {
            const match = rawText.match(new RegExp(config.supplierPattern, 'i'));
            if (match)
                invoice.supplierName = match[1] || match[0];
        }
        else {
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
    async extractCVData(rawText, template) {
        const config = template.config;
        const cv = { rawText };
        if (config.emailPattern) {
            const match = rawText.match(new RegExp(config.emailPattern, 'i'));
            if (match)
                cv.email = match[1] || match[0];
        }
        else {
            const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/);
            if (emailMatch)
                cv.email = emailMatch[1];
        }
        if (config.phonePattern) {
            const match = rawText.match(new RegExp(config.phonePattern, 'i'));
            if (match)
                cv.phone = match[1] || match[0];
        }
        else {
            const phoneMatch = rawText.match(/(?:\+216|\+33|0)[1-9](?:[\.\s\-]?\d{2}){4}/);
            if (phoneMatch)
                cv.phone = phoneMatch[0];
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
        if (titleMatch)
            cv.title = titleMatch[1].trim();
        return cv;
    }
    async extractTextFromPDF(buffer) {
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
            try {
                fs.unlinkSync(tmpIn);
                fs.unlinkSync(tmpOut);
            }
            catch { }
            if (text && text.trim().length > 0)
                return text;
            throw new Error('Empty text extracted');
        }
        catch (error) {
            this.logger.error('Erreur extraction PDF:', error.message);
            throw new common_1.BadRequestException(`Impossible d'extraire le texte du PDF: ${error.message}`);
        }
    }
    async extractTextFromDocx(buffer) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            const rawText = result.value;
            if (typeof rawText !== 'string') {
                throw new Error("Extraction Word invalide: le résultat n'est pas une chaîne");
            }
            return rawText;
        }
        catch (error) {
            this.logger.error("Erreur lors de l'extraction Word (.docx):", error);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException('Impossible de lire ce fichier Word.');
        }
    }
    async parseCSV(buffer) {
        try {
            const text = buffer.toString('utf-8');
            const delimiter = text.includes(';') ? ';' : ',';
            const records = (0, sync_1.parse)(text, {
                delimiter,
                skip_empty_lines: true,
                relax_column_count: true,
                trim: true,
            });
            return records;
        }
        catch (error) {
            this.logger.error('Erreur lors du parsing CSV:', error);
            throw new common_1.BadRequestException(`Impossible de parser le fichier CSV: ${error.message}`);
        }
    }
    textToLines(text) {
        return text
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((line) => line.split(/\s{2,}|\t/).filter((cell) => cell.trim().length > 0));
    }
    detectFileType(filename, mimetype) {
        const ext = path.extname(filename).toLowerCase();
        if (ext === '.pdf' || mimetype === 'application/pdf')
            return 'PDF';
        if (ext === '.csv' || mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel')
            return 'CSV';
        if (ext === '.docx' ||
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            return 'DOCX';
        throw new common_1.BadRequestException(`Type de fichier non supporté: ${ext || mimetype}`);
    }
    async findTemplateBySignature(text, documentType, tenantId) {
        const templates = await this.templateModel.find({
            tenantId,
            type: documentType,
            isActive: true,
        });
        for (const template of templates) {
            if (text.toUpperCase().includes(template.signature.toUpperCase()))
                return template;
        }
        return null;
    }
    parseDate(dateStr, format) {
        try {
            dateStr = dateStr.replace(/\s+/g, ' ').trim();
            if (format === 'DD/MM/YYYY' || format === 'DD-MM-YYYY') {
                const parts = dateStr.split(/[\/\-]/);
                if (parts.length === 3) {
                    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                }
            }
            else if (format === 'YYYY-MM-DD') {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                }
            }
            const date = new Date(dateStr);
            if (!isNaN(date.getTime()))
                return date;
            return null;
        }
        catch {
            return null;
        }
    }
    parseAmount(amountStr) {
        let cleaned = amountStr
            .trim()
            .replace(/\u00A0/g, ' ')
            .replace(/\s/g, '');
        if (cleaned.includes(',') && !cleaned.includes('.')) {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        }
        else if (cleaned.includes(',')) {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        }
        cleaned = cleaned.replace(/[€$£]/g, '');
        const amount = parseFloat(cleaned);
        if (isNaN(amount))
            throw new Error(`Montant invalide: ${amountStr}`);
        return amount;
    }
    async getTemplates(tenantId, type) {
        const query = { tenantId, isActive: true };
        if (type)
            query.type = type;
        return await this.templateModel.find(query).exec();
    }
    async deleteTemplate(templateId, tenantId) {
        const template = await this.templateModel.findOne({ _id: templateId, tenantId });
        if (!template)
            throw new common_1.BadRequestException('Template non trouvé');
        await this.templateModel.deleteOne({ _id: templateId });
    }
};
exports.UniversalDocumentParserService = UniversalDocumentParserService;
exports.UniversalDocumentParserService = UniversalDocumentParserService = UniversalDocumentParserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parsing_template_schema_1.ParsingTemplate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UniversalDocumentParserService);
//# sourceMappingURL=universal-document-parser.service.js.map