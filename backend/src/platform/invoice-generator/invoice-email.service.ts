import { Injectable, Logger } from '@nestjs/common';
import { PlatformInvoiceDocument } from '../schemas/platform-invoice.schema';
import { PlatformSettingsDocument } from '../schemas/platform-settings.schema';
import { TenantDocument } from '../../tenants/schemas/tenant.schema';
import { sendBrevoEmail, isBrevoConfigured } from '../../common/mailer/brevo-mailer.util';

@Injectable()
export class InvoiceEmailService {
  private readonly logger = new Logger(InvoiceEmailService.name);

  async sendAdminNewTenantAlert(tenantName: string, tenantEmail: string, plan: string) {
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
    if (!adminEmail || !isBrevoConfigured()) {
      this.logger.warn('Brevo API or PLATFORM_ADMIN_EMAIL not configured - skipping alert');
      return;
    }
    try {
      await sendBrevoEmail({
        to: adminEmail,
        fromName: 'Invoicia Platform',
        subject: `Nouveau client en attente - ${tenantName}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7ff; padding: 32px; border-radius: 12px;">
            <h2 style="color: #6366f1; margin-bottom: 8px;">Invoicia - Nouvelle inscription</h2>
            <hr style="border: none; border-top: 1px solid #e0e0f0; margin: 16px 0;" />
            <p style="color: #333; font-size: 15px;">Un nouveau client vient de s'inscrire et attend votre validation :</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; background: #ede9fe; border-radius: 6px; color: #4f46e5; font-weight: 600; width: 140px;">Societe</td>
                <td style="padding: 8px 12px; color: #333;">${tenantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #4f46e5; font-weight: 600;">Email</td>
                <td style="padding: 8px 12px; color: #333;">${tenantEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #ede9fe; border-radius: 6px; color: #4f46e5; font-weight: 600;">Plan</td>
                <td style="padding: 8px 12px; color: #333;">${plan}</td>
              </tr>
            </table>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/platform/tenants"
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              Voir dans le tableau de bord
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">Invoicia Platform - alerte automatique</p>
          </div>
        `,
      });
      this.logger.log(`Alert sent to ${adminEmail} for: ${tenantName}`);
    } catch (err) {
      this.logger.error('Failed to send admin alert', err);
    }
  }

  async sendAdminPaymentClaimedAlert(tenantName: string, amount: number, plan: string, tenantId: string) {
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
    if (!adminEmail || !isBrevoConfigured()) {
      this.logger.warn('Brevo API not configured - skipping payment claimed alert');
      return;
    }
    try {
      await sendBrevoEmail({
        to: adminEmail,
        fromName: 'Invoicia Platform',
        subject: `Paiement declare - ${tenantName}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7ff; padding: 32px; border-radius: 12px;">
            <h2 style="color: #6366f1; margin-bottom: 8px;">Invoicia - Paiement declare</h2>
            <hr style="border: none; border-top: 1px solid #e0e0f0; margin: 16px 0;" />
            <p style="color: #333; font-size: 15px;">Un client declare avoir effectue son virement bancaire :</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; background: #ede9fe; border-radius: 6px; color: #4f46e5; font-weight: 600; width: 140px;">Societe</td>
                <td style="padding: 8px 12px; color: #333;">${tenantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #4f46e5; font-weight: 600;">Montant declare</td>
                <td style="padding: 8px 12px; color: #333; font-weight: 700;">${amount} TND</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #ede9fe; border-radius: 6px; color: #4f46e5; font-weight: 600;">Plan</td>
                <td style="padding: 8px 12px; color: #333;">${plan}</td>
              </tr>
            </table>
            <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px; margin: 16px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">Verifiez votre compte bancaire avant d'approuver l'acces.</p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/platform/tenants"
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              Approuver dans le tableau de bord
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">Invoicia Platform - alerte automatique</p>
          </div>
        `,
      });
      this.logger.log(`Payment claimed alert sent for: ${tenantName}`);
    } catch (err) {
      this.logger.error('Failed to send payment claimed alert', err);
    }
  }

  async sendInvoiceEmail(
    invoice: PlatformInvoiceDocument,
    tenant: TenantDocument,
    platformSettings: PlatformSettingsDocument,
    pdfPath: string,
  ): Promise<void> {
    const recipientEmail = tenant.adminEmail || tenant.email;
    if (!recipientEmail || !isBrevoConfigured()) {
      this.logger.warn(`No email or Brevo API config for tenant ${tenant._id}`);
      return;
    }
    const companyName = platformSettings.invoiceCompanyName || platformSettings.companyName || 'Invoicia';
    const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}${invoice.pdfUrl}`;
    try {
      await sendBrevoEmail({
        to: recipientEmail,
        fromName: companyName,
        subject: `Votre facture d'abonnement ${invoice.invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1>Votre Facture d'Abonnement</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>Bonjour,</p>
              <p>Votre facture <strong>${invoice.invoiceNumber}</strong> est disponible.</p>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td style="padding:8px; font-weight:bold; border-bottom:1px solid #eee;">Numero</td><td style="padding:8px; border-bottom:1px solid #eee;">${invoice.invoiceNumber}</td></tr>
                <tr><td style="padding:8px; font-weight:bold; border-bottom:1px solid #eee;">Date</td><td style="padding:8px; border-bottom:1px solid #eee;">${new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}</td></tr>
                <tr><td style="padding:8px; font-weight:bold; border-bottom:1px solid #eee;">Plan</td><td style="padding:8px; border-bottom:1px solid #eee;">${invoice.planName}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Montant</td><td style="padding:8px;"><strong>${invoice.totalAmount.toFixed(2)} ${invoice.currency}</strong></td></tr>
              </table>
              <p style="text-align:center;">
                <a href="${downloadUrl}" style="display:inline-block; padding:12px 30px; background:#667eea; color:white; text-decoration:none; border-radius:5px; margin:20px 0;">Telecharger PDF</a>
              </p>
              <p>Cordialement,<br>L'equipe ${companyName}</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Invoice email sent to ${recipientEmail}`);
    } catch (err) {
      this.logger.error('Failed to send invoice email', err);
    }
  }
}
