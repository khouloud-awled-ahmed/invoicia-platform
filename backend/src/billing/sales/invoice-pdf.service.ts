import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { InvoiceDocument } from './schemas/invoice.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ClientDocument } from '../../clients/schemas/client.schema';

/** El Fatoora (Tunisie) : contenu du QR Code */
function buildFatooraPayload(
  mfEmetteur: string,
  date: string,
  totalTTC: number,
  totalTVA: number,
  mfClient: string,
): string {
  return [mfEmetteur, date, totalTTC.toFixed(3), totalTVA.toFixed(3), mfClient || ''].join('|');
}

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  async generateSalesInvoicePdf(
    invoice: InvoiceDocument,
    tenant: TenantDocument,
    client: ClientDocument | null,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;

    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 2,
    });

    const status = (invoice as any).status || 'pending';
    const statusLabel = status === 'paid' ? 'PAYEE' : status === 'overdue' ? 'EN RETARD' : 'EN ATTENTE';
    const statusColor = status === 'paid' ? rgb(0.13, 0.55, 0.13) : status === 'overdue' ? rgb(0.8, 0.1, 0.1) : rgb(0.9, 0.6, 0.1);
    page.drawRectangle({ x: width - 130, y: height - 72, width: 100, height: 20, color: statusColor });
    page.drawText(statusLabel, { x: width - 125, y: height - 67, size: 9, font: helveticaBoldFont, color: rgb(1,1,1) });

    const hexToRgb = (hex: string) => {
      const cleaned = (hex || '#000000').replace('#', '');
      const r = parseInt(cleaned.substring(0, 2), 16) / 255;
      const g = parseInt(cleaned.substring(2, 4), 16) / 255;
      const b = parseInt(cleaned.substring(4, 6), 16) / 255;
      return rgb(r, g, b);
    };
    const templateConfig = (tenant as any).invoiceTemplateConfig || {};
    const primaryColor = hexToRgb(templateConfig.primaryColor || '#000000');
    const secondaryColor = hexToRgb(templateConfig.secondaryColor || '#666666');

    // En-tete
    page.drawText("FACTURE", { x: width - 130, y: height - 45, size: 20, font: helveticaBoldFont, color: primaryColor });
    page.drawText(tenant.businessName || tenant.name, {
      x: 50,
      y,
      size: 18,
      font: helveticaBoldFont,
      color: primaryColor,
    });
    y -= 20;

    if (tenant.matriculeFiscal) {
      page.drawText(`MF: ${tenant.matriculeFiscal}`, { x: 50, y, size: 10, font: helveticaFont });
      y -= 14;
    }
    if (tenant.address) {
      const addr = tenant.address;
      page.drawText(
        [addr.line1, addr.line2, `${addr.postalCode} ${addr.city}`, addr.country]
          .filter(Boolean)
          .join(', '),
        {
          x: 50,
          y,
          size: 9,
          font: helveticaFont,
        },
      );
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
    y -= 30;

    // FACTURER A
    page.drawText('FACTURER A', { x: 50, y, size: 11, font: helveticaBoldFont, color: secondaryColor });
    y -= 16;
    page.drawText(String(invoice.client || ''), { x: 50, y, size: 10, font: helveticaBoldFont });
    y -= 14;
    if (client && (client as any).address) {
      page.drawText(String((client as any).address).slice(0, 70), {
        x: 50,
        y,
        size: 9,
        font: helveticaFont,
      });
      y -= 14;
    }
    if (client && (client as any).email) {
      page.drawText(String((client as any).email), { x: 50, y, size: 9, font: helveticaFont });
      y -= 14;
    }

    y -= 16;

    // Lignes
    page.drawRectangle({ x: 45, y: y - 5, width: width - 90, height: 20, color: primaryColor });
    page.drawText('Designation', { x: 50, y, size: 10, font: helveticaBoldFont, color: rgb(1, 1, 1) });
    page.drawText('Qte', { x: 350, y, size: 10, font: helveticaBoldFont, color: rgb(1, 1, 1) });
    page.drawText('P.U.', { x: 400, y, size: 10, font: helveticaBoldFont, color: rgb(1, 1, 1) });
    page.drawText('Montant', { x: 500, y, size: 10, font: helveticaBoldFont, color: rgb(1, 1, 1) });
    y -= 18;

    for (const item of invoice.items || []) {
      const lineTotal =
        (item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discount || 0) / 100);
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
    const timbre = (invoice as any).timbreFiscal ?? 1;
    y -= 14;
    page.drawText(`Timbre: ${Number(timbre).toFixed(3)} TND`, {
      x: 400,
      y,
      size: 10,
      font: helveticaFont,
    });
    y -= 18;
    const netAPayer = (invoice as any).netAPayer ?? Number(invoice.amountTTC || 0) + timbre;
    page.drawRectangle({ x: 395, y: y - 4, width: 150, height: 20, color: primaryColor });
    page.drawText(`Net a payer: ${Number(netAPayer).toFixed(3)} TND`, {
      x: 400,
      y,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    });
    y -= 30;

    // Coordonnees bancaires
    const bank = (tenant as any).defaultBankAccount;
    let bankBoxBottom = y;
    if (bank && (bank.iban || bank.bankName)) {
      page.drawRectangle({ x: 45, y: y - 60, width: 250, height: 70, color: rgb(0.96, 0.96, 0.96) });
      let by = y - 15;
      page.drawText('COORDONNEES BANCAIRES', {
        x: 55,
        y: by,
        size: 10,
        font: helveticaBoldFont,
        color: secondaryColor,
      });
      by -= 16;
      if (bank.bankName) {
        page.drawText(`Banque: ${bank.bankName}`, { x: 55, y: by, size: 8, font: helveticaFont });
        by -= 12;
      }
      if (bank.iban) {
        page.drawText(`IBAN: ${bank.iban}`, { x: 55, y: by, size: 8, font: helveticaFont });
        by -= 12;
      }
      if (bank.bic) {
        page.drawText(`BIC: ${bank.bic}`, { x: 55, y: by, size: 8, font: helveticaFont });
      }
      bankBoxBottom = y - 70;
      y -= 80;
    }

    // Mentions legales (CGV par defaut du tenant)
    const terms = (tenant as any).defaultTerms;
    if (terms) {
      y -= 10;
      page.drawLine({
        start: { x: 50, y: y + 8 },
        end: { x: width - 50, y: y + 8 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 6;
      if (terms.penaltyRate !== undefined) {
        page.drawText(`Penalites de retard (taux annuel) : ${Number(terms.penaltyRate).toFixed(2)} %`, {
          x: 50,
          y,
          size: 8,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
        });
        y -= 11;
      }
      if (terms.discountPolicy) {
        page.drawText(String(terms.discountPolicy), {
          x: 50,
          y,
          size: 8,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
        });
        y -= 11;
      }
      if (terms.recoveryFee !== undefined) {
        page.drawText(
          `Indemnite forfaitaire pour frais de recouvrement en cas de retard de paiement : ${Number(terms.recoveryFee).toFixed(2)} TND`,
          { x: 50, y, size: 8, font: helveticaFont, color: rgb(0.4, 0.4, 0.4) },
        );
        y -= 11;
      }
      if (terms.paymentTermsDefault !== undefined && invoice.date) {
        const dueDate = new Date(invoice.date);
        dueDate.setDate(dueDate.getDate() + Number(terms.paymentTermsDefault || 0));
        page.drawText(`Date limite de paiement: ${dueDate.toLocaleDateString('fr-FR')}`, {
          x: 50,
          y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 11;
      }
    }

    // ----- El Fatoora QR en bas de page -----
    const mfEmetteur = tenant.matriculeFiscal || '';
    const dateStr = new Date(invoice.date).toISOString().slice(0, 10);
    const totalTTC = Number(invoice.amountTTC || 0);
    const totalTVA = Number(invoice.amountTVA || 0);
    const mfClient =
      client && (client as any).matriculeFiscal ? (client as any).matriculeFiscal : '';

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
        color: rgb(0.5, 0.5, 0.5),
      });
    } catch (err) {
      this.logger.warn('QR El Fatoora non genere: ' + (err as Error).message);
    }

    // Footer
    page.drawText('Merci pour votre confiance !', {
      x: width / 2 - 60,
      y: 25,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
