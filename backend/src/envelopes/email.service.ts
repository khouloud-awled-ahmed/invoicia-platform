import { Injectable, Logger } from '@nestjs/common';
import { EnvelopeDocument, Recipient } from './schemas/envelope.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendSignatureRequestEmail(envelope: EnvelopeDocument, recipient: Recipient): Promise<void> {
    const signUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/sign/${envelope._id}?email=${encodeURIComponent(recipient.email)}${recipient.securityCode ? `&code=${recipient.securityCode}` : ''}`;

    const emailContent = {
      to: recipient.email,
      subject: `Signature requise : ${envelope.title}`,
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Signature Électronique Requise</h1>
            </div>
            <div class="content">
              <p>Bonjour ${recipient.name},</p>
              <p>Vous avez été désigné pour signer le document : <strong>${envelope.title}</strong></p>
              ${envelope.message ? `<p><em>${envelope.message}</em></p>` : ''}
              ${envelope.expiresAt ? `<p><strong>Date d'expiration :</strong> ${new Date(envelope.expiresAt).toLocaleDateString('fr-FR')}</p>` : ''}
              <p style="text-align: center;">
                <a href="${signUrl}" class="button">Signer le document</a>
              </p>
              ${recipient.securityCode ? `<p><strong>Code de sécurité :</strong> ${recipient.securityCode}</p>` : ''}
              <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #667eea;">${signUrl}</p>
            </div>
            <div class="footer">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // TODO: Implémenter l'envoi réel d'email (nodemailer, SendGrid, etc.)
    this.logger.log(`Email de demande de signature envoyé à ${recipient.email}`);
    this.logger.debug(`URL de signature: ${signUrl}`);

    // Pour l'instant, on log seulement
    // await this.sendEmail(emailContent);
  }

  async sendEnvelopeCompletedEmail(
    envelope: EnvelopeDocument,
    recipient: Recipient,
  ): Promise<void> {
    const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/envelopes/${envelope._id}/download`;

    const emailContent = {
      to: recipient.email,
      subject: `Document signé : ${envelope.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Document Signé avec Succès</h1>
            </div>
            <div class="content">
              <p>Bonjour ${recipient.name},</p>
              <p>Le document <strong>${envelope.title}</strong> a été signé par tous les signataires.</p>
              <p>Vous pouvez maintenant télécharger le document signé ainsi que le certificat de signature.</p>
              <p style="text-align: center;">
                <a href="${downloadUrl}" class="button">Télécharger le document</a>
              </p>
              <p><strong>Date de complétion :</strong> ${envelope.completedAt ? new Date(envelope.completedAt).toLocaleString('fr-FR') : 'N/A'}</p>
            </div>
            <div class="footer">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    this.logger.log(`Email de complétion envoyé à ${recipient.email}`);
    // await this.sendEmail(emailContent);
  }

  async sendEnvelopeRefusedEmail(
    envelope: EnvelopeDocument,
    recipient: Recipient,
    refusingRecipient: Recipient,
  ): Promise<void> {
    const emailContent = {
      to: recipient.email,
      subject: `Document refusé : ${envelope.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Document Refusé</h1>
            </div>
            <div class="content">
              <p>Bonjour ${recipient.name},</p>
              <p>Le document <strong>${envelope.title}</strong> a été refusé par <strong>${refusingRecipient.name}</strong>.</p>
              ${refusingRecipient.refusalReason ? `<p><strong>Motif du refus :</strong> ${refusingRecipient.refusalReason}</p>` : ''}
              <p>L'enveloppe a été annulée et n'est plus en cours de traitement.</p>
            </div>
            <div class="footer">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    this.logger.log(`Email de refus envoyé à ${recipient.email}`);
    // await this.sendEmail(emailContent);
  }

  async sendEnvelopeRefusedNotificationToCreator(
    envelope: EnvelopeDocument,
    refusingRecipient: Recipient,
  ): Promise<void> {
    // Récupérer l'email du créateur depuis le système d'utilisateurs
    // Pour l'instant, on log seulement
    this.logger.log(`Notification de refus envoyée au créateur de l'enveloppe ${envelope._id}`);
  }
}
