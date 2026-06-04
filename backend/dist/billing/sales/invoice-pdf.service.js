"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InvoicePdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePdfService = void 0;
const common_1 = require("@nestjs/common");
const pdf_lib_1 = require("pdf-lib");
const QRCode = require("qrcode");
function buildFatooraPayload(mfEmetteur, date, totalTTC, totalTVA, mfClient) {
    return [mfEmetteur, date, totalTTC.toFixed(3), totalTVA.toFixed(3), mfClient || ''].join('|');
}
let InvoicePdfService = InvoicePdfService_1 = class InvoicePdfService {
    constructor() {
        this.logger = new common_1.Logger(InvoicePdfService_1.name);
    }
    async generateSalesInvoicePdf(invoice, tenant, client) {
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        let y = height - 50;
        page.drawText(tenant.businessName || tenant.name, {
            x: 50,
            y,
            size: 18,
            font: helveticaBoldFont,
        });
        y -= 20;
        if (tenant.matriculeFiscal) {
            page.drawText(`MF: ${tenant.matriculeFiscal}`, { x: 50, y, size: 10, font: helveticaFont });
            y -= 14;
        }
        if (tenant.address) {
            const addr = tenant.address;
            page.drawText([addr.line1, addr.line2, `${addr.postalCode} ${addr.city}`, addr.country]
                .filter(Boolean)
                .join(', '), {
                x: 50,
                y,
                size: 9,
                font: helveticaFont,
            });
            y -= 14;
        }
        y -= 20;
        page.drawText(`Facture n° ${invoice.number}`, { x: 50, y, size: 14, font: helveticaBoldFont });
        y -= 20;
        page.drawText(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, {
            x: 50,
            y,
            size: 10,
            font: helveticaFont,
        });
        y -= 14;
        page.drawText(`Client: ${invoice.client}`, { x: 50, y, size: 10, font: helveticaFont });
        y -= 30;
        page.drawText('Désignation', { x: 50, y, size: 10, font: helveticaBoldFont });
        page.drawText('Qté', { x: 350, y, size: 10, font: helveticaBoldFont });
        page.drawText('P.U.', { x: 400, y, size: 10, font: helveticaBoldFont });
        page.drawText('Montant', { x: 500, y, size: 10, font: helveticaBoldFont });
        y -= 18;
        for (const item of invoice.items || []) {
            const lineTotal = (item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discount || 0) / 100);
            page.drawText((item.description || item.article || '').slice(0, 50), {
                x: 50,
                y,
                size: 9,
                font: helveticaFont,
            });
            page.drawText(String(item.quantity ?? 1), { x: 350, y, size: 9, font: helveticaFont });
            page.drawText(Number(item.unitPrice || 0).toFixed(3), {
                x: 400,
                y,
                size: 9,
                font: helveticaFont,
            });
            page.drawText(lineTotal.toFixed(3), { x: 500, y, size: 9, font: helveticaFont });
            y -= 14;
        }
        y -= 15;
        page.drawText(`Total HT: ${Number(invoice.amountHT || 0).toFixed(3)} TND`, {
            x: 400,
            y,
            size: 10,
            font: helveticaFont,
        });
        y -= 14;
        page.drawText(`TVA: ${Number(invoice.amountTVA || 0).toFixed(3)} TND`, {
            x: 400,
            y,
            size: 10,
            font: helveticaFont,
        });
        y -= 14;
        page.drawText(`Total TTC: ${Number(invoice.amountTTC || 0).toFixed(3)} TND`, {
            x: 400,
            y,
            size: 10,
            font: helveticaBoldFont,
        });
        const timbre = invoice.timbreFiscal ?? 1;
        y -= 14;
        page.drawText(`Timbre: ${Number(timbre).toFixed(3)} TND`, {
            x: 400,
            y,
            size: 10,
            font: helveticaFont,
        });
        y -= 14;
        const netAPayer = invoice.netAPayer ?? Number(invoice.amountTTC || 0) + timbre;
        page.drawText(`Net à payer: ${Number(netAPayer).toFixed(3)} TND`, {
            x: 400,
            y,
            size: 10,
            font: helveticaBoldFont,
        });
        const mfEmetteur = tenant.matriculeFiscal || '';
        const dateStr = new Date(invoice.date).toISOString().slice(0, 10);
        const totalTTC = Number(invoice.amountTTC || 0);
        const totalTVA = Number(invoice.amountTVA || 0);
        const mfClient = client && client.matriculeFiscal ? client.matriculeFiscal : '';
        const qrPayload = buildFatooraPayload(mfEmetteur, dateStr, totalTTC, totalTVA, mfClient);
        try {
            const qrPng = await QRCode.toBuffer(qrPayload, { type: 'png', width: 120, margin: 1 });
            const qrImage = await pdfDoc.embedPng(qrPng);
            const qrSize = 80;
            page.drawImage(qrImage, {
                x: width / 2 - qrSize / 2,
                y: 60,
                width: qrSize,
                height: qrSize,
            });
            page.drawText('El Fatoora', {
                x: width / 2 - 24,
                y: 48,
                size: 8,
                font: helveticaFont,
                color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
            });
        }
        catch (err) {
            this.logger.warn('QR El Fatoora non généré: ' + err.message);
        }
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
};
exports.InvoicePdfService = InvoicePdfService;
exports.InvoicePdfService = InvoicePdfService = InvoicePdfService_1 = __decorate([
    (0, common_1.Injectable)()
], InvoicePdfService);
//# sourceMappingURL=invoice-pdf.service.js.map