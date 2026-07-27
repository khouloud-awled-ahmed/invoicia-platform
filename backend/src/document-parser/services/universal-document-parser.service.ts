import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ParsingTemplate,
  ParsingTemplateDocument,
  DocumentType,
} from '../schemas/parsing-template.schema';
import { parse as csvParse } from 'csv-parse/sync';
import * as path from 'path';
import * as mammoth from 'mammoth';
import * as nodemailer from 'nodemailer';

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
  yearsOfExperience?: number;
  seniorityLevel?: string;
  isManager?: boolean;
  skills?: string[];
  experiences?: Array<{
    title?: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
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
        rawText = rawLines.map((line) => line.join(' ')).join('\n');
      } else if (fileType === 'DOCX') {
        const extracted = await this.extractTextFromDocx(file.buffer);
        rawText = extracted;
        rawLines = this.textToLines(rawText);
      } else {
        throw new BadRequestException(`Type de fichier non supporte pour le parsing: ${fileType}`);
      }

      // Extraction IA via Groq pour CV et INVOICE (nouveau)
      if ((documentType === 'CV' || documentType === 'INVOICE') && process.env.GROQ_API_KEY) {
        try {
          const groqData = await this.extractWithGroq(rawText, documentType);
          if (groqData) {
            return {
              status: 'SUCCESS',
              data: { ...groqData, rawText },
              message: 'Extraction par intelligence artificielle (Groq)',
              confidence: 0.9,
            };
          }
        } catch (error: any) {
          this.logger.warn(`Extraction Groq echouee, fallback sur le systeme classique: ${error.message}`);
        }
      }

      const template = await this.findTemplateBySignature(rawText, documentType, tenantId);

      if (template) {
        this.logger.log(
          `Format reconnu: ${template.name} (${template.signature}) pour type ${documentType}`,
        );

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
          message: `Format non reconnu. Le systeme peut apprendre a lire ce type de document.`,
        };
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'analyse du document ${documentType}:`, error);
      throw new BadRequestException(`Erreur lors de l'analyse: ${error.message}`);
    }
  }

  private async extractWithGroq(rawText: string, documentType: DocumentType): Promise<any | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const truncatedText = rawText.substring(0, 8000);

    let prompt: string;
    if (documentType === 'CV') {
      prompt = `Tu es un expert en recrutement. Analyse ce CV et retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou apres, sans markdown, avec exactement cette structure:
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "title": "",
  "summary": "",
  "yearsOfExperience": 0,
  "seniorityLevel": "junior|confirme|senior|manager",
  "isManager": false,
  "skills": ["competence1", "competence2"],
  "experiences": [
    {
      "title": "Intitule du poste",
      "company": "Nom entreprise",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM ou null si poste actuel",
      "description": "Resume court",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    { "institution": "", "degree": "", "year": "" }
  ]
}

Regles:
- "isManager" doit etre true si la personne a gere une equipe, encadre des collaborateurs, ou occupe un poste avec "manager", "chef", "lead", "responsable" dans son historique.
- "seniorityLevel" doit etre deduit du nombre d'annees d'experience et du niveau de responsabilite (junior: 0-2 ans, confirme: 3-5 ans, senior: 6+ ans, manager: gere une equipe).
- "yearsOfExperience" doit etre calcule a partir des dates d'experience professionnelle.
- Si une information n'est pas trouvee, laisse une chaine vide, un tableau vide, ou 0.

Voici le texte du CV:
${truncatedText}`;
    } else {
      prompt = `Tu es un expert-comptable. Analyse cette facture et retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou apres, sans markdown, avec exactement cette structure:
{
  "invoiceNumber": "",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "supplierName": "",
  "supplierAddress": "",
  "supplierSIRET": "",
  "supplierVAT": "",
  "totalHT": 0,
  "totalTVA": 0,
  "totalTTC": 0,
  "lineItems": [
    { "description": "", "quantity": 1, "unitPrice": 0, "vatRate": 20, "totalHT": 0 }
  ]
}

Si une information n'est pas trouvee, laisse une chaine vide ou 0.

Voici le texte de la facture:
${truncatedText}`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erreur API Groq (${response.status}): ${errText}`);
    }

    const result: any = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error('Reponse Groq vide');

    const cleaned = content.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Impossible de parser le JSON retourne par Groq');
    }
  }

  async generatePipelinePrioritySummary(opportunities: Array<{
    id: string;
    name: string;
    client: string;
    amount: number;
    probability: number;
    stage: string;
    daysSinceCreated: number;
  }>): Promise<string> {
    if (opportunities.length === 0) return '';
    if (!process.env.GROQ_API_KEY) return '';

    const prompt = `Tu es un directeur commercial experimente. Voici la liste complete des opportunites de vente actives d'une entreprise (format JSON):

${JSON.stringify(opportunities.map(o => ({ nom: o.name, client: o.client, montant: o.amount, probabilite: o.probability, etape: o.stage, joursDepuisCreation: o.daysSinceCreated })))}

Analyse TOUTES ces opportunites ensemble et redige UNE SEULE phrase COURTE (maximum 20 mots), en francais tres simple, sans jargon commercial. Dis juste quelle opportunite regarder en priorite cette semaine et pourquoi en 3-4 mots. Pas de markdown, pas de titre, juste la phrase courte.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 80,
        }),
      });

      if (!response.ok) return '';

      const result: any = await response.json();
      const content = result.choices?.[0]?.message?.content;
      return content ? content.trim() : '';
    } catch {
      return '';
    }
  }

  async generatePipelineActions(opportunities: Array<{
    id: string;
    name: string;
    client: string;
    amount: number;
    probability: number;
    stage: string;
    daysSinceCreated: number;
  }>): Promise<Array<{ id: string; action: string }>> {
    if (opportunities.length === 0) return [];
    if (!process.env.GROQ_API_KEY) return [];

    const prompt = `Tu es un coach commercial expert. Pour CHAQUE opportunite de vente ci-dessous, suggere UNE SEULE action concrete et courte (moins de 10 mots) que le commercial devrait faire maintenant. Sois specifique et actionnable (ex: "Relancer par telephone sous 48h", "Envoyer une proposition detaillee", "Negocier une remise de 5%", "Programmer une demo produit"). Adapte le conseil selon l'etape (stage), le nombre de jours depuis la creation, et la probabilite.

Opportunites (format JSON):
${JSON.stringify(opportunities.map(o => ({ id: o.id, name: o.name, client: o.client, amount: o.amount, probability: o.probability, stage: o.stage, joursDepuisCreation: o.daysSinceCreated })))}

Retourne UNIQUEMENT un tableau JSON valide, sans texte avant ou apres, sans markdown, avec exactement cette structure:
[{"id": "id_exact_fourni", "action": "action courte suggeree"}]`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) return [];

      const result: any = await response.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) return [];

      const cleaned = content.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      const parsed = match ? JSON.parse(match[0]) : JSON.parse(cleaned);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async classifyDocumentForGED(file: any): Promise<{ documentType: string; confidence: number }> {
    const fileType = this.detectFileType(file.originalname, file.mimetype);
    let rawText = '';

    try {
      if (fileType === 'PDF') {
        rawText = await this.extractTextFromPDF(file.buffer);
      } else if (fileType === 'DOCX') {
        rawText = await this.extractTextFromDocx(file.buffer);
      }
    } catch {
      rawText = '';
    }

    if (!rawText || rawText.trim().length < 10 || !process.env.GROQ_API_KEY) {
      return { documentType: 'autre', confidence: 0 };
    }

    const truncatedText = rawText.substring(0, 4000);
    const validTypes = [
      'facture', 'depense', 'avoir', 'devis', 'contrat',
      'document_fournisseur', 'document_client', 'document_societe', 'general', 'autre',
    ];

    const prompt = `Tu es un assistant de classement documentaire. Analyse ce texte extrait d'un document et determine son type EXACT parmi cette liste uniquement: ${validTypes.join(', ')}.

Definitions:
- facture: une facture emise ou recue
- depense: un justificatif de depense/note de frais
- avoir: un avoir ou note de credit
- devis: un devis ou une offre commerciale
- contrat: un contrat ou accord juridique
- document_fournisseur: document lie a un fournisseur (hors facture/devis)
- document_client: document lie a un client (hors facture)
- document_societe: document interne de l'entreprise (statuts, RH, etc.)
- general: document generique
- autre: si aucune categorie ne correspond clairement

Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou apres, sans markdown, avec cette structure exacte:
{"documentType": "un des types ci-dessus", "confidence": 0.9}

Texte du document:
${truncatedText}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 100,
        }),
      });

      if (!response.ok) return { documentType: 'autre', confidence: 0 };

      const result: any = await response.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) return { documentType: 'autre', confidence: 0 };

      const cleaned = content.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : JSON.parse(cleaned);

      if (!validTypes.includes(parsed.documentType)) {
        return { documentType: 'autre', confidence: 0 };
      }

      return {
        documentType: parsed.documentType,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
      };
    } catch {
      return { documentType: 'autre', confidence: 0 };
    }
  }

  async generateBusinessNarrative(stats: {
    totalRevenue: number;
    totalExpenses: number;
    overdueCount: number;
    overdueAmount: number;
    paymentRate: number;
    topClientName: string;
    topClientRevenue: number;
    topExpenseCategory: string;
    topExpenseAmount: number;
  }): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      throw new BadRequestException('GROQ_API_KEY manquant');
    }

    const prompt = `Tu es un analyste financier qui parle simplement, comme a un dirigeant non-expert. Analyse ces indicateurs d'une entreprise tunisienne et redige UN SEUL paragraphe COURT de 2 A 3 phrases maximum, en francais simple et direct, sans jargon technique. Va droit au but: dis ce qui va bien, et le SEUL probleme le plus important a regler en priorite. Pas de markdown, pas de titre, juste le paragraphe court.

Donnees:
- Chiffre d'affaires: ${stats.totalRevenue} TND
- Depenses totales: ${stats.totalExpenses} TND
- Factures en retard: ${stats.overdueCount} (montant: ${stats.overdueAmount} TND)
- Taux de paiement: ${stats.paymentRate}%
- Meilleur client: ${stats.topClientName} (${stats.topClientRevenue} TND)
- Plus grosse categorie de depense: ${stats.topExpenseCategory} (${stats.topExpenseAmount} TND)

Retourne UNIQUEMENT le paragraphe, rien d'autre.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new BadRequestException(`Erreur API Groq (${response.status}): ${errText}`);
    }

    const result: any = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new BadRequestException('Reponse Groq vide');

    return content.trim();
  }

  async sendPaymentReminderEmail(data: {
    clientEmail: string;
    subject: string;
    body: string;
  }): Promise<void> {
    if (!data.clientEmail || !process.env.SMTP_USER) {
      throw new BadRequestException('Email client ou configuration SMTP manquante');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlBody = data.body.replace(/\n/g, '<br>');

    try {
      await transporter.sendMail({
        from: `"Invoicia" <${process.env.SMTP_USER}>`,
        to: data.clientEmail,
        subject: data.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
              ${htmlBody}
            </div>
          </div>
        `,
      });
      this.logger.log(`Relance de paiement envoyee a ${data.clientEmail}`);
    } catch (err: any) {
      this.logger.error('Echec envoi relance', err);
      throw new BadRequestException(`Erreur lors de l'envoi de l'email: ${err.message}`);
    }
  }

  async generatePaymentReminder(invoiceData: {
    clientName: string;
    invoiceNumber: string;
    amountTTC: number;
    dueDate: string;
    daysOverdue: number;
  }): Promise<any> {
    if (!process.env.GROQ_API_KEY) {
      throw new BadRequestException('GROQ_API_KEY manquant');
    }

    const tone = invoiceData.daysOverdue > 30 ? 'ferme mais professionnel' : 'courtois et amical';

    const prompt = `Tu es un assistant comptable professionnel. Redige un email de relance de paiement en francais pour la situation suivante:
- Client: ${invoiceData.clientName}
- Facture N°: ${invoiceData.invoiceNumber}
- Montant: ${invoiceData.amountTTC} TND
- Date d'echeance: ${invoiceData.dueDate}
- Jours de retard: ${invoiceData.daysOverdue}

Le ton doit etre ${tone}, car le retard est de ${invoiceData.daysOverdue} jours.

Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou apres, sans markdown, avec cette structure exacte:
{
  "subject": "Objet de l'email",
  "body": "Corps complet de l'email, avec formule de politesse au debut et signature generique a la fin"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new BadRequestException(`Erreur API Groq (${response.status}): ${errText}`);
    }

    const result: any = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new BadRequestException('Reponse Groq vide');

    const cleaned = content.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new BadRequestException('Impossible de parser le JSON retourne par Groq');
    }
  }

  async generateInvoiceTemplate(description: string): Promise<any> {
    if (!process.env.GROQ_API_KEY) {
      throw new BadRequestException('GROQ_API_KEY manquant');
    }

    const prompt = `Tu es un designer expert en creation de factures professionnelles. Analyse cette description et retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou apres, sans markdown, avec exactement cette structure:
{
  "primaryColor": "#3b82f6",
  "secondaryColor": "#1e40af",
  "fontFamily": "Arial",
  "layout": "modern",
  "customFields": []
}

Regles:
- "primaryColor" et "secondaryColor" doivent etre des codes hexadecimaux coherents avec les couleurs demandees (ex: vert -> #16a34a, bleu -> #3b82f6, violet -> #7c3aed, rouge -> #dc2626, orange -> #ea580c, noir/gris -> #1f2937). Si aucune couleur n'est mentionnee, utilise du bleu par defaut.
- "fontFamily" doit etre "Arial", "Times New Roman", ou "Helvetica" selon le style demande (moderne/epure -> Arial ou Helvetica, classique/traditionnel -> Times New Roman).
- "layout" doit etre exactement "classic", "modern", ou "minimal" selon le style decrit.
- "customFields" est un tableau d'objets {"id": "field_X", "label": "Nom du champ"} pour chaque champ specifique mentionne (ex: numero de commande, code projet, QR code, coordonnees bancaires). Vide si aucun champ specifique n'est mentionne.

Description de l'utilisateur:
${description}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new BadRequestException(`Erreur API Groq (${response.status}): ${errText}`);
    }

    const result: any = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new BadRequestException('Reponse Groq vide');

    const cleaned = content.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new BadRequestException('Impossible de parser le JSON retourne par Groq');
    }
  }

  async scanClientInvoice(file: any, tenantId: string): Promise<any> {
    const fileType = this.detectFileType(file.originalname, file.mimetype);
    let rawText: string;

    if (fileType === 'PDF') {
      rawText = await this.extractTextFromPDF(file.buffer);
    } else if (fileType === 'DOCX') {
      rawText = await this.extractTextFromDocx(file.buffer);
    } else {
      throw new BadRequestException(`Type de fichier non supporte: ${fileType}`);
    }

    if (!process.env.GROQ_API_KEY) {
      throw new BadRequestException('GROQ_API_KEY manquant');
    }

    const truncatedText = rawText.substring(0, 8000);
    const prompt = `Tu es un expert-comptable. Analyse ce document (bon de commande, devis ou facture) et retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou apres, sans markdown, avec exactement cette structure:
{
  "invoiceNumber": "",
  "orderNumber": "",
  "engagementId": "",
  "clientName": "",
  "clientEmail": "",
  "clientAddress": "",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "items": [
    { "article": "", "description": "", "quantity": 1, "unitPrice": 0, "discount": 0, "vatRate": 20 }
  ],
  "notes": ""
}

Si une information n'est pas trouvee, laisse une chaine vide ou 0.

Voici le texte du document:
${truncatedText}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new BadRequestException(`Erreur API Groq (${response.status}): ${errText}`);
    }

    const result: any = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new BadRequestException('Reponse Groq vide');

    const cleaned = content.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new BadRequestException('Impossible de parser le JSON retourne par Groq');
    }
  }

  async analyzeSplitPDF(file: any, tenantId: string): Promise<any[]> {
    const fileType = this.detectFileType(file.originalname, file.mimetype);
    if (fileType !== 'PDF') {
      throw new BadRequestException('Le decoupage necessite un fichier PDF');
    }

    const pageCount = await this.getPDFPageCount(file.buffer);
    const results: any[] = [];

    for (let i = 1; i <= pageCount; i++) {
      try {
        const pageText = await this.extractTextFromPDFPage(file.buffer, i);

        if (!pageText || pageText.trim().length === 0) {
          results.push({ pageNumber: i, status: 'ERROR', message: 'Page vide ou illisible' });
          continue;
        }

        if (process.env.GROQ_API_KEY) {
          try {
            const groqData = await this.extractWithGroq(pageText, 'INVOICE');
            if (groqData) {
              results.push({
                pageNumber: i,
                status: 'SUCCESS',
                data: { ...groqData, rawText: pageText },
                confidence: 0.9,
              });
              continue;
            }
          } catch (error: any) {
            this.logger.warn(`Extraction Groq echouee page ${i}: ${error.message}`);
          }
        }

        results.push({ pageNumber: i, status: 'ERROR', message: 'Extraction impossible pour cette page' });
      } catch (error: any) {
        this.logger.error(`Erreur page ${i}:`, error);
        results.push({ pageNumber: i, status: 'ERROR', message: error.message });
      }
    }

    return results;
  }

  private async getPDFPageCount(buffer: Buffer): Promise<number> {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const tmpIn = path.join(os.tmpdir(), 'split_' + Date.now() + '.pdf');
    fs.writeFileSync(tmpIn, buffer);
    try {
      const output = execSync(`pdfinfo "${tmpIn}"`, { timeout: 15000 }).toString();
      const match = output.match(/Pages:\s+(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    } finally {
      try { fs.unlinkSync(tmpIn); } catch {}
    }
  }

  private async extractTextFromPDFPage(buffer: Buffer, pageNum: number): Promise<string> {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const tmpIn = path.join(os.tmpdir(), 'page_' + Date.now() + '_' + pageNum + '.pdf');
    const tmpOut = path.join(os.tmpdir(), 'page_' + Date.now() + '_' + pageNum + '.txt');
    fs.writeFileSync(tmpIn, buffer);
    try {
      execSync(`pdftotext -f ${pageNum} -l ${pageNum} "${tmpIn}" "${tmpOut}"`, { timeout: 30000 });
      return fs.readFileSync(tmpOut, 'utf8');
    } finally {
      try { fs.unlinkSync(tmpIn); } catch {}
      try { fs.unlinkSync(tmpOut); } catch {}
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
    const startIndex = config.hasHeader ? (config.startRow || 0) + 1 : config.startRow || 0;

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
        this.logger.warn(`Erreur a la ligne ${i + 1}: ${error.message}`);
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
      const dateMatch = rawText.match(
        /(?:date|le)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      );
      if (dateMatch) invoice.date = this.parseDate(dateMatch[1], 'DD/MM/YYYY') || undefined;
    }

    if (config.totalHTPattern) {
      const match = rawText.match(new RegExp(config.totalHTPattern, 'i'));
      if (match) invoice.totalHT = this.parseAmount(match[1] || match[0]);
    } else {
      const htMatch = rawText.match(
        /(?:total\s*ht|ht\s*total|montant\s*ht)\s*:?\s*([\d\s,\.]+)\s*€?/i,
      );
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
      const ttcMatch = rawText.match(
        /(?:total\s*ttc|ttc\s*total|montant\s*ttc)\s*:?\s*([\d\s,\.]+)\s*€?/i,
      );
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

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      const tmpIn = path.join(os.tmpdir(), 'cv_' + Date.now() + '.pdf');
      const tmpOut = path.join(os.tmpdir(), 'cv_' + Date.now() + '.txt');
      fs.writeFileSync(tmpIn, buffer);
      execSync(`pdftotext "${tmpIn}" "${tmpOut}"`, { timeout: 30000 });
      const text = fs.readFileSync(tmpOut, 'utf8');
      try {
        fs.unlinkSync(tmpIn);
        fs.unlinkSync(tmpOut);
      } catch {}
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
        throw new Error("Extraction Word invalide: le resultat n'est pas une chaine");
      }
      return rawText;
    } catch (error: any) {
      this.logger.error("Erreur lors de l'extraction Word (.docx):", error);
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
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(/\s{2,}|\t/).filter((cell) => cell.trim().length > 0));
  }

  private detectFileType(filename: string, mimetype: string): 'PDF' | 'CSV' | 'DOCX' {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf' || mimetype === 'application/pdf') return 'PDF';
    if (ext === '.csv' || mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel')
      return 'CSV';
    if (
      ext === '.docx' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return 'DOCX';
    throw new BadRequestException(`Type de fichier non supporte: ${ext || mimetype}`);
  }

  private async findTemplateBySignature(
    text: string,
    documentType: DocumentType,
    tenantId: string,
  ): Promise<ParsingTemplateDocument | null> {
    const templates = await this.templateModel.find({
      tenantId,
      type: documentType,
      isActive: true,
    });
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
          return new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10),
          );
        }
      } else if (format === 'YYYY-MM-DD') {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10),
          );
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
    let cleaned = amountStr
      .trim()
      .replace(/\u00A0/g, ' ')
      .replace(/\s/g, '');
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
    if (!template) throw new BadRequestException('Template non trouve');
    await this.templateModel.deleteOne({ _id: templateId });
  }
}
