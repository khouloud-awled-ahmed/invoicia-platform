import { Injectable, Logger } from '@nestjs/common';
import { PlatformSettings, PlatformSettingsDocument } from '../schemas/platform-settings.schema';
import { PlatformInvoice } from '../schemas/platform-invoice.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class InvoiceGeneratorService {
  private readonly logger = new Logger(InvoiceGeneratorService.name);

  /**
   * Génère un PDF de facture professionnel
   */
  async generateInvoicePDF(
    invoice: PlatformInvoice,
    platformSettings: PlatformSettingsDocument,
    tenant: TenantDocument,
  ): Promise<Buffer> {
    try {
      // Créer un nouveau document PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 en points (210mm x 297mm)
      const { width, height } = page.getSize();

      // Charger les polices
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Couleur principale depuis les settings
      const primaryColor = this.hexToRgb(platformSettings.invoiceColor || '#667eea');
      const primaryColorRgb = rgb(primaryColor.r / 255, primaryColor.g / 255, primaryColor.b / 255);

      let yPosition = height - 50;

      // ==========================================
      // EN-TÊTE avec logo (si disponible)
      // ==========================================
      if (platformSettings.invoiceLogoUrl) {
        try {
          // Si c'est une URL locale, charger l'image
          const logoPath = platformSettings.invoiceLogoUrl.startsWith('http')
            ? null
            : path.join(process.cwd(), 'uploads', platformSettings.invoiceLogoUrl);
          
          if (logoPath && fs.existsSync(logoPath)) {
            const logoBytes = fs.readFileSync(logoPath);
            // Détecter le type d'image
            const isPng = logoPath.toLowerCase().endsWith('.png');
            const isJpg = logoPath.toLowerCase().endsWith('.jpg') || logoPath.toLowerCase().endsWith('.jpeg');
            
            let logoImage;
            if (isPng) {
              logoImage = await pdfDoc.embedPng(logoBytes);
            } else if (isJpg) {
              logoImage = await pdfDoc.embedJpg(logoBytes);
            } else {
              // Essayer PNG par défaut
              try {
                logoImage = await pdfDoc.embedPng(logoBytes);
              } catch {
                // Si ça échoue, essayer JPG
                logoImage = await pdfDoc.embedJpg(logoBytes);
              }
            }
            
            const logoDims = logoImage.scale(0.3);
            page.drawImage(logoImage, {
              x: 50,
              y: yPosition - logoDims.height,
              width: logoDims.width,
              height: logoDims.height,
            });
          }
        } catch (error) {
          this.logger.warn('Impossible de charger le logo:', error.message);
        }
      }

      // Nom de l'entreprise (plateforme)
      const companyName = platformSettings.invoiceCompanyName || platformSettings.companyName || 'Invoicia';
      page.drawText(companyName, {
        x: 50,
        y: yPosition,
        size: 24,
        font: helveticaBoldFont,
        color: primaryColorRgb,
      });

      yPosition -= 30;

      // Adresse de l'entreprise
      if (platformSettings.invoiceCompanyAddress) {
        const addr = platformSettings.invoiceCompanyAddress;
        page.drawText(addr.line1, { x: 50, y: yPosition, size: 10, font: helveticaFont });
        yPosition -= 12;
        if (addr.line2) {
          page.drawText(addr.line2, { x: 50, y: yPosition, size: 10, font: helveticaFont });
          yPosition -= 12;
        }
        page.drawText(`${addr.postalCode} ${addr.city}`, { x: 50, y: yPosition, size: 10, font: helveticaFont });
        yPosition -= 12;
        page.drawText(addr.country, { x: 50, y: yPosition, size: 10, font: helveticaFont });
        yPosition -= 12;
      }

      if (platformSettings.invoiceCompanyVat) {
        page.drawText(`TVA: ${platformSettings.invoiceCompanyVat}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
        yPosition -= 20;
      }

      // ==========================================
      // TITRE FACTURE
      // ==========================================
      yPosition = height - 50;
      page.drawText('FACTURE', {
        x: width - 200,
        y: yPosition,
        size: 32,
        font: helveticaBoldFont,
        color: primaryColorRgb,
      });

      yPosition -= 30;
      page.drawText(`N° ${invoice.invoiceNumber}`, {
        x: width - 200,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
      });

      yPosition -= 20;
      const issuedDate = new Date(invoice.issuedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      page.drawText(`Date d'émission: ${issuedDate}`, {
        x: width - 200,
        y: yPosition,
        size: 10,
        font: helveticaFont,
      });

      if (invoice.dueDate) {
        yPosition -= 15;
        const dueDate = new Date(invoice.dueDate).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        page.drawText(`Date d'échéance: ${dueDate}`, {
          x: width - 200,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
      }

      // ==========================================
      // CLIENT (DESTINATAIRE)
      // ==========================================
      yPosition = height - 250;
      page.drawText('Facturé à:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
      });
      yPosition -= 20;

      const tenantName = invoice.tenantSnapshot?.businessName || invoice.tenantSnapshot?.name || tenant.businessName || tenant.name;
      page.drawText(tenantName, {
        x: 50,
        y: yPosition,
        size: 11,
        font: helveticaBoldFont,
      });
      yPosition -= 15;

      if (invoice.tenantSnapshot?.address) {
        const addr = invoice.tenantSnapshot.address;
        page.drawText(addr.line1, { x: 50, y: yPosition, size: 10, font: helveticaFont });
        yPosition -= 12;
        if (addr.line2) {
          page.drawText(addr.line2, { x: 50, y: yPosition, size: 10, font: helveticaFont });
          yPosition -= 12;
        }
        page.drawText(`${addr.postalCode} ${addr.city}`, { x: 50, y: yPosition, size: 10, font: helveticaFont });
        yPosition -= 12;
        page.drawText(addr.country, { x: 50, y: yPosition, size: 10, font: helveticaFont });
        yPosition -= 12;
      }

      if (invoice.tenantSnapshot?.matriculeFiscal) {
        page.drawText(`MF: ${invoice.tenantSnapshot.matriculeFiscal}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
        yPosition -= 12;
      }

      if (invoice.tenantSnapshot?.vatNumber) {
        page.drawText(`TVA: ${invoice.tenantSnapshot.vatNumber}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
      }

      // ==========================================
      // TABLEAU DES LIGNES DE FACTURE
      // ==========================================
      yPosition = height - 450;
      const tableStartY = yPosition;

      // En-tête du tableau
      page.drawRectangle({
        x: 50,
        y: yPosition - 20,
        width: width - 100,
        height: 25,
        color: primaryColorRgb,
      });

      page.drawText('Description', {
        x: 60,
        y: yPosition - 10,
        size: 11,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText('Quantité', {
        x: width - 250,
        y: yPosition - 10,
        size: 11,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText('Prix unitaire', {
        x: width - 180,
        y: yPosition - 10,
        size: 11,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText('Total', {
        x: width - 100,
        y: yPosition - 10,
        size: 11,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });

      yPosition -= 35;

      // Ligne de facture
      const planName = invoice.planSnapshot?.name || invoice.planName || 'Abonnement';
      const quantity = 1;
      const unitPrice = invoice.subtotal || invoice.amount;
      const lineTotal = unitPrice;

      page.drawText(planName, {
        x: 60,
        y: yPosition,
        size: 10,
        font: helveticaFont,
      });

      page.drawText(quantity.toString(), {
        x: width - 250,
        y: yPosition,
        size: 10,
        font: helveticaFont,
      });

      page.drawText(`${unitPrice.toFixed(2)} ${invoice.currency}`, {
        x: width - 180,
        y: yPosition,
        size: 10,
        font: helveticaFont,
      });

      page.drawText(`${lineTotal.toFixed(2)} ${invoice.currency}`, {
        x: width - 100,
        y: yPosition,
        size: 10,
        font: helveticaFont,
      });

      // Ligne séparatrice
      yPosition -= 20;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });

      // ==========================================
      // TOTAUX
      // ==========================================
      yPosition -= 30;

      if (invoice.subtotal && invoice.subtotal !== invoice.totalAmount) {
        page.drawText('Sous-total:', {
          x: width - 200,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
        page.drawText(`${invoice.subtotal.toFixed(2)} ${invoice.currency}`, {
          x: width - 100,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
        yPosition -= 20;
      }

      if (invoice.discountAmount && invoice.discountAmount > 0) {
        page.drawText(`Réduction${invoice.promoCode ? ` (${invoice.promoCode})` : ''}:`, {
          x: width - 200,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0.6, 0),
        });
        page.drawText(`-${invoice.discountAmount.toFixed(2)} ${invoice.currency}`, {
          x: width - 100,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0.6, 0),
        });
        yPosition -= 20;
      }

      if (invoice.taxAmount && invoice.taxAmount > 0) {
        page.drawText('TVA:', {
          x: width - 200,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
        page.drawText(`${invoice.taxAmount.toFixed(2)} ${invoice.currency}`, {
          x: width - 100,
          y: yPosition,
          size: 10,
          font: helveticaFont,
        });
        yPosition -= 20;
      }

      // Total final
      page.drawRectangle({
        x: width - 220,
        y: yPosition - 15,
        width: 170,
        height: 30,
        color: primaryColorRgb,
      });

      page.drawText('TOTAL', {
        x: width - 210,
        y: yPosition - 5,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText(`${invoice.totalAmount.toFixed(2)} ${invoice.currency}`, {
        x: width - 110,
        y: yPosition - 5,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });

      // ==========================================
      // PIED DE PAGE
      // ==========================================
      if (platformSettings.invoiceFooterText) {
        yPosition = 100;
        const footerLines = platformSettings.invoiceFooterText.split('\n');
        footerLines.forEach((line) => {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 8,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
          });
          yPosition -= 12;
        });
      }

      // ==========================================
      // NOTES
      // ==========================================
      if (invoice.notes) {
        yPosition = 50;
        page.drawText('Notes:', {
          x: 50,
          y: yPosition,
          size: 9,
          font: helveticaBoldFont,
        });
        yPosition -= 15;
        const noteLines = invoice.notes.split('\n');
        noteLines.forEach((line) => {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 9,
            font: helveticaFont,
          });
          yPosition -= 12;
        });
      }

      // Générer le PDF
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      this.logger.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  /**
   * Convertit une couleur hex en RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 102, g: 126, b: 234 }; // Couleur par défaut
  }
}
