"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InvoiceEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEmailService = void 0;
const common_1 = require("@nestjs/common");
let InvoiceEmailService = InvoiceEmailService_1 = class InvoiceEmailService {
    constructor() {
        this.logger = new common_1.Logger(InvoiceEmailService_1.name);
    }
    async sendInvoiceEmail(invoice, tenant, platformSettings, pdfPath) {
        const recipientEmail = tenant.adminEmail || tenant.email;
        if (!recipientEmail) {
            this.logger.warn(`Aucun email trouvé pour le tenant ${tenant._id}`);
            return;
        }
        const companyName = platformSettings.invoiceCompanyName || platformSettings.companyName || 'Invoicia';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
        const downloadUrl = `${frontendUrl}${invoice.pdfUrl}`;
        const emailContent = {
            to: recipientEmail,
            subject: `Votre facture d'abonnement ${invoice.invoiceNumber}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
            .invoice-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .invoice-details table { width: 100%; border-collapse: collapse; }
            .invoice-details td { padding: 8px; border-bottom: 1px solid #eee; }
            .invoice-details td:first-child { font-weight: bold; width: 40%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Votre Facture d'Abonnement</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Votre facture d'abonnement <strong>${invoice.invoiceNumber}</strong> est disponible.</p>
              
              <div class="invoice-details">
                <table>
                  <tr>
                    <td>Numéro de facture:</td>
                    <td>${invoice.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td>Date d'émission:</td>
                    <td>${new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                  <tr>
                    <td>Plan:</td>
                    <td>${invoice.planName}</td>
                  </tr>
                  <tr>
                    <td>Montant:</td>
                    <td><strong>${invoice.totalAmount.toFixed(2)} ${invoice.currency}</strong></td>
                  </tr>
                  <tr>
                    <td>Méthode de paiement:</td>
                    <td>${invoice.paymentMethod === 'CARD' ? 'Carte bancaire' : 'Virement bancaire'}</td>
                  </tr>
                </table>
              </div>

              <p style="text-align: center;">
                <a href="${downloadUrl}" class="button">Télécharger la facture PDF</a>
              </p>

              <p>Vous pouvez également consulter toutes vos factures dans votre espace client.</p>
              
              <p>Cordialement,<br>L'équipe ${companyName}</p>
            </div>
            <div class="footer">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        this.logger.log(`[EMAIL] Facture ${invoice.invoiceNumber} envoyée à ${recipientEmail}`);
        this.logger.debug(`URL de téléchargement: ${downloadUrl}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
};
exports.InvoiceEmailService = InvoiceEmailService;
exports.InvoiceEmailService = InvoiceEmailService = InvoiceEmailService_1 = __decorate([
    (0, common_1.Injectable)()
], InvoiceEmailService);
//# sourceMappingURL=invoice-email.service.js.map