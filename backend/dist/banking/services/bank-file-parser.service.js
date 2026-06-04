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
var BankFileParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankFileParserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bank_parser_template_schema_1 = require("../schemas/bank-parser-template.schema");
const sync_1 = require("csv-parse/sync");
const path = require("path");
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib;
let BankFileParserService = BankFileParserService_1 = class BankFileParserService {
    constructor(templateModel) {
        this.templateModel = templateModel;
        this.logger = new common_1.Logger(BankFileParserService_1.name);
    }
    async analyzeFile(file, tenantId) {
        try {
            const fileType = this.detectFileType(file.originalname, file.mimetype);
            let rawText;
            let rawLines;
            if (fileType === 'PDF') {
                rawText = await this.extractTextFromPDF(file.buffer);
                rawLines = this.textToLines(rawText);
            }
            else {
                rawLines = await this.parseCSV(file.buffer);
                rawText = rawLines.map((line) => line.join(' ')).join('\n');
            }
            const template = await this.findTemplateBySignature(rawText, tenantId);
            if (template) {
                this.logger.log(`Format reconnu: ${template.name} (${template.signature})`);
                const transactions = await this.extractTransactions(rawLines, template.config, fileType);
                return {
                    status: 'SUCCESS',
                    transactions,
                    templateId: template._id.toString(),
                    templateName: template.name,
                    message: `Format "${template.name}" reconnu automatiquement`,
                };
            }
            else {
                this.logger.log(`Format inconnu, retour des données brutes (${rawLines.length} lignes)`);
                return {
                    status: 'UNKNOWN_FORMAT',
                    rawData: rawLines.slice(0, 50),
                    message: 'Format non reconnu. Veuillez configurer le mapping manuellement.',
                };
            }
        }
        catch (error) {
            this.logger.error("Erreur lors de l'analyse du fichier:", error);
            throw new common_1.BadRequestException(`Erreur lors de l'analyse: ${error.message}`);
        }
    }
    async learnFormat(tenantId, templateData) {
        const existing = await this.templateModel.findOne({
            tenantId,
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
    async extractTextFromPDF(buffer) {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        }
        catch (error) {
            this.logger.error("Erreur lors de l'extraction PDF:", error);
            if (error.message?.includes('Cannot find module') || error.message?.includes('pdf-parse')) {
                throw new common_1.BadRequestException('Module pdf-parse non installé. Exécutez: npm install pdf-parse');
            }
            throw new common_1.BadRequestException(`Impossible d'extraire le texte du PDF: ${error.message}`);
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
            if (error.message?.includes('Cannot find module') || error.message?.includes('csv-parse')) {
                throw new common_1.BadRequestException('Module csv-parse non installé. Exécutez: npm install csv-parse');
            }
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
        if (ext === '.pdf' || mimetype === 'application/pdf') {
            return 'PDF';
        }
        if (ext === '.csv' || mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') {
            return 'CSV';
        }
        throw new common_1.BadRequestException(`Type de fichier non supporté: ${ext || mimetype}`);
    }
    async findTemplateBySignature(text, tenantId) {
        const templates = await this.templateModel.find({
            tenantId,
            isActive: true,
        });
        for (const template of templates) {
            if (text.toUpperCase().includes(template.signature.toUpperCase())) {
                return template;
            }
        }
        return null;
    }
    async extractTransactions(rawLines, config, fileType) {
        const transactions = [];
        const startIndex = config.hasHeader ? config.startRow + 1 : config.startRow;
        for (let i = startIndex; i < rawLines.length; i++) {
            const line = rawLines[i];
            const maxColumn = Math.max(config.dateColumn, config.labelColumn, config.amountColumn);
            if (line.length <= maxColumn) {
                continue;
            }
            try {
                const dateStr = line[config.dateColumn]?.trim();
                if (!dateStr)
                    continue;
                const date = this.parseDate(dateStr, config.dateFormat);
                if (!date) {
                    this.logger.warn(`Date invalide à la ligne ${i + 1}: ${dateStr}`);
                    continue;
                }
                const label = line[config.labelColumn]?.trim() || '';
                const amountStr = line[config.amountColumn]?.trim();
                if (!amountStr)
                    continue;
                const amount = this.parseAmount(amountStr);
                transactions.push({
                    date,
                    label,
                    amount,
                    rawLine: line,
                });
            }
            catch (error) {
                this.logger.warn(`Erreur à la ligne ${i + 1}: ${error.message}`);
                continue;
            }
        }
        return transactions;
    }
    parseDate(dateStr, format) {
        try {
            dateStr = dateStr.replace(/\s+/g, ' ').trim();
            if (format === 'DD/MM/YYYY' || format === 'DD-MM-YYYY') {
                const parts = dateStr.split(/[\/\-]/);
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                }
            }
            else if (format === 'YYYY-MM-DD') {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                }
            }
            else if (format === 'DD.MM.YYYY') {
                const parts = dateStr.split('.');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                }
            }
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    parseAmount(amountStr) {
        let cleaned = amountStr.trim();
        cleaned = cleaned.replace(/\u00A0/g, ' ');
        cleaned = cleaned.replace(/\s/g, '');
        if (cleaned.includes(',') && !cleaned.includes('.')) {
            cleaned = cleaned.replace(/\./g, '');
            cleaned = cleaned.replace(',', '.');
        }
        else if (cleaned.includes(',')) {
            cleaned = cleaned.replace(/\./g, '');
            cleaned = cleaned.replace(',', '.');
        }
        cleaned = cleaned.replace(/[€$£]/g, '');
        const amount = parseFloat(cleaned);
        if (isNaN(amount)) {
            throw new Error(`Montant invalide: ${amountStr}`);
        }
        return amount;
    }
    async getTemplates(tenantId) {
        return await this.templateModel.find({ tenantId, isActive: true }).exec();
    }
    async deleteTemplate(templateId, tenantId) {
        const template = await this.templateModel.findOne({
            _id: templateId,
            tenantId,
        });
        if (!template) {
            throw new common_1.BadRequestException('Template non trouvé');
        }
        await this.templateModel.deleteOne({ _id: templateId });
    }
};
exports.BankFileParserService = BankFileParserService;
exports.BankFileParserService = BankFileParserService = BankFileParserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bank_parser_template_schema_1.BankParserTemplate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BankFileParserService);
//# sourceMappingURL=bank-file-parser.service.js.map