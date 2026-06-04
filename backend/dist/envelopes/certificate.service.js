"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CertificateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const common_1 = require("@nestjs/common");
const envelope_schema_1 = require("./schemas/envelope.schema");
const pdf_lib_1 = require("pdf-lib");
const fs = require("fs/promises");
const path = require("path");
let CertificateService = CertificateService_1 = class CertificateService {
    constructor() {
        this.logger = new common_1.Logger(CertificateService_1.name);
        this.certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');
        this.signedDocumentsDir = path.join(process.cwd(), 'uploads', 'signed-documents');
    }
    async generateCertificate(envelope) {
        try {
            await fs.mkdir(this.certificatesDir, { recursive: true });
            const pdfDoc = await pdf_lib_1.PDFDocument.create();
            const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const helveticaBoldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const timesRomanFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
            const page = pdfDoc.addPage([595, 842]);
            const { width, height } = page.getSize();
            let yPosition = height - 50;
            page.drawText('CERTIFICAT DE SIGNATURE ELECTRONIQUE', {
                x: 50,
                y: yPosition,
                size: 20,
                font: helveticaBoldFont,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            yPosition -= 50;
            page.drawLine({
                start: { x: 50, y: yPosition },
                end: { x: width - 50, y: yPosition },
                thickness: 2,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            yPosition -= 40;
            page.drawText('Informations du Document', {
                x: 50,
                y: yPosition,
                size: 16,
                font: helveticaBoldFont,
            });
            yPosition -= 30;
            page.drawText('Titre : ' + envelope.title, {
                x: 70,
                y: yPosition,
                size: 12,
                font: helveticaFont,
            });
            yPosition -= 25;
            const createdAtDate = envelope.createdAt instanceof Date
                ? envelope.createdAt
                : new Date(envelope.createdAt);
            page.drawText('Date de creation : ' + createdAtDate.toLocaleString('fr-FR'), {
                x: 70,
                y: yPosition,
                size: 12,
                font: helveticaFont,
            });
            yPosition -= 25;
            const completedAtDate = envelope.completedAt instanceof Date
                ? envelope.completedAt
                : envelope.completedAt
                    ? new Date(envelope.completedAt)
                    : null;
            page.drawText('Date de completion : ' +
                (completedAtDate ? completedAtDate.toLocaleString('fr-FR') : 'N/A'), { x: 70, y: yPosition, size: 12, font: helveticaFont });
            yPosition -= 25;
            page.drawText('Statut : ' + envelope.status, {
                x: 70,
                y: yPosition,
                size: 12,
                font: helveticaFont,
            });
            yPosition -= 40;
            page.drawText('Signataires', { x: 50, y: yPosition, size: 16, font: helveticaBoldFont });
            yPosition -= 30;
            const signers = envelope.recipients
                .filter((r) => r.status === envelope_schema_1.RecipientStatus.SIGNED || r.role === envelope_schema_1.RecipientRole.SIGNER)
                .sort((a, b) => a.routingOrder - b.routingOrder);
            for (const recipient of signers) {
                const signedStatus = recipient.status === envelope_schema_1.RecipientStatus.SIGNED
                    ? 'Signe'
                    : recipient.status === envelope_schema_1.RecipientStatus.REFUSED
                        ? 'Refuse'
                        : 'En attente';
                const statusColor = recipient.status === envelope_schema_1.RecipientStatus.SIGNED
                    ? (0, pdf_lib_1.rgb)(0, 0.5, 0)
                    : recipient.status === envelope_schema_1.RecipientStatus.REFUSED
                        ? (0, pdf_lib_1.rgb)(0.8, 0, 0)
                        : (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5);
                page.drawText(recipient.routingOrder + '. ' + recipient.name + ' (' + recipient.email + ')', { x: 70, y: yPosition, size: 12, font: helveticaFont });
                yPosition -= 18;
                page.drawText('   Statut : ' + signedStatus, {
                    x: 90,
                    y: yPosition,
                    size: 10,
                    font: helveticaFont,
                    color: statusColor,
                });
                yPosition -= 18;
                if (recipient.signedAt) {
                    const signedAtDate = recipient.signedAt instanceof Date ? recipient.signedAt : new Date(recipient.signedAt);
                    page.drawText('   Signe le : ' + signedAtDate.toLocaleString('fr-FR'), {
                        x: 90,
                        y: yPosition,
                        size: 9,
                        font: timesRomanFont,
                        color: (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3),
                    });
                    yPosition -= 18;
                }
                if (recipient.ipAddress) {
                    page.drawText('   Adresse IP : ' + recipient.ipAddress, {
                        x: 90,
                        y: yPosition,
                        size: 9,
                        font: timesRomanFont,
                        color: (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3),
                    });
                    yPosition -= 18;
                }
                const sigField = envelope.fields.find((f) => f.type === envelope_schema_1.FieldType.SIGNATURE &&
                    f.assignedRecipientId === recipient.id &&
                    f.signatureData);
                if (sigField && sigField.signatureData) {
                    page.drawText('   Signature :', {
                        x: 90,
                        y: yPosition,
                        size: 9,
                        font: helveticaBoldFont,
                        color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
                    });
                    yPosition -= 18;
                    page.drawText('   ' + sigField.signatureData, {
                        x: 90,
                        y: yPosition,
                        size: 20,
                        font: timesRomanFont,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0.6),
                        maxWidth: width - 180,
                    });
                    yPosition -= 20;
                    page.drawLine({
                        start: { x: 90, y: yPosition },
                        end: { x: 350, y: yPosition },
                        thickness: 0.5,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0.6),
                    });
                    yPosition -= 15;
                }
                yPosition -= 10;
            }
            yPosition -= 20;
            page.drawText("Piste d'audit (Historique complet)", {
                x: 50,
                y: yPosition,
                size: 16,
                font: helveticaBoldFont,
            });
            yPosition -= 30;
            const auditEvents = [...envelope.auditTrail].reverse();
            for (const auditEvent of auditEvents) {
                if (yPosition < 100) {
                    const newPage = pdfDoc.addPage([595, 842]);
                    yPosition = height - 50;
                }
                const eventDate = auditEvent.timestamp instanceof Date
                    ? auditEvent.timestamp
                    : new Date(auditEvent.timestamp);
                page.drawText(eventDate.toLocaleString('fr-FR') + ' - ' + this.getActionLabel(auditEvent.action), { x: 70, y: yPosition, size: 10, font: helveticaFont, maxWidth: width - 140 });
                yPosition -= 20;
                if (auditEvent.actorEmail || auditEvent.actorName) {
                    page.drawText('   Par : ' + (auditEvent.actorName || auditEvent.actorEmail), {
                        x: 90,
                        y: yPosition,
                        size: 9,
                        font: timesRomanFont,
                        color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
                        maxWidth: width - 180,
                    });
                    yPosition -= 18;
                }
                if (auditEvent.ipAddress) {
                    page.drawText('   IP : ' + auditEvent.ipAddress, {
                        x: 90,
                        y: yPosition,
                        size: 9,
                        font: timesRomanFont,
                        color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
                    });
                    yPosition -= 18;
                }
                if (auditEvent.metadata && Object.keys(auditEvent.metadata).length > 0) {
                    const metadataText = '   Details : ' + JSON.stringify(auditEvent.metadata, null, 2);
                    const truncatedText = metadataText.length > 100 ? metadataText.substring(0, 100) + '...' : metadataText;
                    page.drawText(truncatedText, {
                        x: 90,
                        y: yPosition,
                        size: 8,
                        font: timesRomanFont,
                        color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
                    });
                    yPosition -= 18;
                }
                yPosition -= 8;
            }
            const certFileName = 'certificate-' + envelope._id + '.pdf';
            const certFilePath = path.join(this.certificatesDir, certFileName);
            const pdfBytes = await pdfDoc.save();
            await fs.writeFile(certFilePath, pdfBytes);
            page.drawText('Certificat genere le ' +
                new Date().toLocaleString('fr-FR') +
                ' - Invoicia - Signature Electronique', { x: 50, y: 30, size: 8, font: helveticaFont, color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5) });
            const finalBytes = await pdfDoc.save();
            await fs.writeFile(certFilePath, finalBytes);
            return '/uploads/certificates/' + certFileName;
        }
        catch (error) {
            this.logger.error('Erreur lors de la generation du certificat : ' + error.message);
            throw error;
        }
    }
    async mergeSignaturesToDocument(envelope) {
        try {
            await fs.mkdir(this.signedDocumentsDir, { recursive: true });
            const firstDocument = envelope.documents[0];
            if (!firstDocument)
                throw new Error('Aucun document trouve');
            let existingPdfBytes;
            if (firstDocument.fileUrl.startsWith('/api/')) {
                const axios = require('axios');
                const response = await axios.get('http://localhost:3001' + firstDocument.fileUrl, {
                    responseType: 'arraybuffer',
                });
                existingPdfBytes = Buffer.from(response.data);
            }
            else {
                const isAbsolute = firstDocument.fileUrl.startsWith('/') || /^[A-Za-z]:\\/.test(firstDocument.fileUrl);
                const filePath = isAbsolute
                    ? firstDocument.fileUrl
                    : path.join(process.cwd(), firstDocument.fileUrl.replace(/^\//, ''));
                existingPdfBytes = await fs.readFile(filePath);
            }
            const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            for (const field of envelope.fields) {
                if (!field.signatureData && !field.value)
                    continue;
                const page = pages[field.pageNumber - 1];
                if (!page)
                    continue;
                const { width, height } = page.getSize();
                if (field.type === envelope_schema_1.FieldType.SIGNATURE) {
                    try {
                        const timesFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRomanItalic);
                        page.drawRectangle({
                            x: field.xPosition,
                            y: height - field.yPosition - field.height,
                            width: field.width,
                            height: field.height,
                            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0.8),
                            borderWidth: 1,
                        });
                        page.drawText(field.signatureData || '[Signature]', {
                            x: field.xPosition + 5,
                            y: height - field.yPosition - field.height / 2,
                            size: 16,
                            font: timesFont,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0.8),
                            maxWidth: field.width - 10,
                        });
                    }
                    catch (error) {
                        this.logger.warn('Erreur signature: ' + error.message);
                    }
                }
                else if (field.type === envelope_schema_1.FieldType.TEXT || field.type === envelope_schema_1.FieldType.DATE) {
                    page.drawText(field.value || '', {
                        x: field.xPosition + 5,
                        y: height - field.yPosition - field.height + 5,
                        size: 10,
                        font: helveticaFont,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        maxWidth: field.width - 10,
                    });
                }
                else if (field.type === envelope_schema_1.FieldType.INITIALS) {
                    page.drawText(field.value || '[Initiales]', {
                        x: field.xPosition + 5,
                        y: height - field.yPosition - field.height + 5,
                        size: 10,
                        font: helveticaFont,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        maxWidth: field.width - 10,
                    });
                }
            }
            if (envelope.certificateUrl) {
                try {
                    const certPath = path.join(process.cwd(), envelope.certificateUrl.replace(/^\//, ''));
                    const certBytes = await fs.readFile(certPath);
                    const certPdf = await pdf_lib_1.PDFDocument.load(certBytes);
                    const certPages = await pdfDoc.copyPages(certPdf, certPdf.getPageIndices());
                    certPages.forEach((p) => pdfDoc.addPage(p));
                }
                catch (error) {
                    this.logger.warn("Impossible d'ajouter le certificat: " + error.message);
                }
            }
            const signedPdfBytes = await pdfDoc.save();
            const fileName = 'signed-' + envelope._id + '-' + Date.now() + '.pdf';
            const filePath = path.join(this.signedDocumentsDir, fileName);
            await fs.writeFile(filePath, signedPdfBytes);
            return '/uploads/signed-documents/' + fileName;
        }
        catch (error) {
            this.logger.error('Erreur lors de la generation du document signe : ' + error.message);
            throw error;
        }
    }
    getActionLabel(action) {
        const labels = {
            ENVELOPE_CREATED: 'Enveloppe creee',
            FIELDS_ADDED: 'Champs ajoutes',
            ENVELOPE_SENT: 'Enveloppe envoyee',
            ENVELOPE_SIGNED: 'Enveloppe signee',
            ENVELOPE_COMPLETED: 'Enveloppe completee',
            ENVELOPE_REFUSED: 'Enveloppe refusee',
        };
        return labels[action] || action;
    }
};
exports.CertificateService = CertificateService;
exports.CertificateService = CertificateService = CertificateService_1 = __decorate([
    (0, common_1.Injectable)()
], CertificateService);
//# sourceMappingURL=certificate.service.js.map