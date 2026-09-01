/**
 * Sends transactional email via Brevo's HTTPS API (not SMTP).
 * Used instead of raw SMTP because most free hosting providers (Render, Vercel, etc.)
 * block outbound SMTP ports (25/465/587), which breaks nodemailer-based sending in production.
 * The Brevo API works over standard HTTPS, so it isn't affected by that restriction.
 *
 * Required env vars:
 *   BREVO_API_KEY     - from Brevo dashboard > Parametres de l'API
 *   BREVO_SENDER_EMAIL - a sender verified in your Brevo account
 */
export async function sendBrevoEmail(params: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  fromName?: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    throw new Error('BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant dans les variables d\'environnement');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: params.fromName || 'Invoicia', email: senderEmail },
      to: [{ email: params.to, name: params.toName || params.to }],
      subject: params.subject,
      htmlContent: params.html,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur API Brevo (${response.status}): ${errText}`);
  }
}

/** True when Brevo API sending is configured. */
export function isBrevoConfigured(): boolean {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}
