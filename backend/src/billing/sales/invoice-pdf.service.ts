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

  /**
   * Génère le PDF de la facture client avec QR Code El Fatoora en bas de page.
   */
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

    // En-tête
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
      page.drawText([addr.line1, addr.line2, `${addr.postalCode} ${addr.city}`, addr.country].filter(Boolean).join(', '), {
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
    page.drawText(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, { x: 50, y, size: 10, font: helveticaFont });
    y -= 14;
    page.drawText(`Client: ${invoice.client}`, { x: 50, y, size: 10, font: helveticaFont });
    y -= 30;

    // Lignes
    page.drawText('Désignation', { x: 50, y, size: 10, font: helveticaBoldFont });
    page.drawText('Qté', { x: 350, y, size: 10, font: helveticaBoldFont });
    page.drawText('P.U.', { x: 400, y, size: 10, font: helveticaBoldFont });
    page.drawText('Montant', { x: 500, y, size: 10, font: helveticaBoldFont });
    y -= 18;

    for (const item of invoice.items || []) {
      const lineTotal = (item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discount || 0) / 100);
      page.drawText((item.description || item.article || '').slice(0, 50), { x: 50, y, size: 9, font: helveticaFont });
      page.drawText(String(item.quantity ?? 1), { x: 350, y, size: 9, font: helveticaFont });
      page.drawText(Number(item.unitPrice || 0).toFixed(3), { x: 400, y, size: 9, font: helveticaFont });
      page.drawText(lineTotal.toFixed(3), { x: 500, y, size: 9, font: helveticaFont });
      y -= 14;
    }

    y -= 15;
    page.drawText(`Total HT: ${Number(invoice.amountHT || 0).toFixed(3)} TND`, { x: 400, y, size: 10, font: helveticaFont });
    y -= 14;
    page.drawText(`TVA: ${Number(invoice.amountTVA || 0).toFixed(3)} TND`, { x: 400, y, size: 10, font: helveticaFont });
    y -= 14;
    page.drawText(`Total TTC: ${Number(invoice.amountTTC || 0).toFixed(3)} TND`, { x: 400, y, size: 10, font: helveticaBoldFont });
    const timbre = (invoice as any).timbreFiscal ?? 1;
    y -= 14;
    page.drawText(`Timbre: ${Number(timbre).toFixed(3)} TND`, { x: 400, y, size: 10, font: helveticaFont });
    y -= 14;
    const netAPayer = (invoice as any).netAPayer ?? Number(invoice.amountTTC || 0) + timbre;
    page.drawText(`Net à payer: ${Number(netAPayer).toFixed(3)} TND`, { x: 400, y, size: 10, font: helveticaBoldFont });

    // ----- El Fatoora QR en bas de page -----
    const mfEmetteur = tenant.matriculeFiscal || '';
    const dateStr = new Date(invoice.date).toISOString().slice(0, 10);
    const totalTTC = Number(invoice.amountTTC || 0);
    const totalTVA = Number(invoice.amountTVA || 0);
    const mfClient = client && (client as any).matriculeFiscal ? (client as any).matriculeFiscal : '';

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
      this.logger.warn('QR El Fatoora non généré: ' + (err as Error).message);
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
