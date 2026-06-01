export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "disabled" | "error";
  secret: string;
  createdAt: Date;
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: "success" | "error";
  statusCode?: number;
  payload: any;
  response?: any;
  error?: string;
  timestamp: Date;
  duration: number;
}

export const AVAILABLE_EVENTS = [
  { id: "invoice.created", name: "Facture créée", category: "invoices" },
  { id: "invoice.paid", name: "Facture payée", category: "invoices" },
  { id: "invoice.overdue", name: "Facture en retard", category: "invoices" },
  { id: "invoice.cancelled", name: "Facture annulée", category: "invoices" },
  
  { id: "payment.received", name: "Paiement reçu", category: "payments" },
  { id: "payment.failed", name: "Paiement échoué", category: "payments" },
  { id: "payment.refunded", name: "Paiement remboursé", category: "payments" },
  
  { id: "client.created", name: "Client créé", category: "clients" },
  { id: "client.updated", name: "Client modifié", category: "clients" },
  { id: "client.deleted", name: "Client supprimé", category: "clients" },
  
  { id: "cra.submitted", name: "CRA soumis", category: "cra" },
  { id: "cra.validated", name: "CRA validé", category: "cra" },
  { id: "cra.rejected", name: "CRA rejeté", category: "cra" },
  
  { id: "absence.requested", name: "Absence demandée", category: "hr" },
  { id: "absence.approved", name: "Absence approuvée", category: "hr" },
  { id: "absence.rejected", name: "Absence refusée", category: "hr" },
];

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: "wh-1",
    name: "Stripe - Paiements",
    url: "https://api.stripe.com/v1/webhooks",
    events: ["payment.received", "payment.failed", "invoice.paid"],
    status: "active",
    secret: "whsec_1234567890abcdef",
    createdAt: new Date(2025, 0, 15),
    lastTriggered: new Date(2025, 10, 8),
    successCount: 245,
    errorCount: 3,
  },
  {
    id: "wh-2",
    name: "SEPA - Virements",
    url: "https://api.sepa.example.com/webhook",
    events: ["payment.received"],
    status: "active",
    secret: "whsec_abcdef1234567890",
    createdAt: new Date(2025, 1, 10),
    lastTriggered: new Date(2025, 10, 7),
    successCount: 89,
    errorCount: 0,
  },
  {
    id: "wh-3",
    name: "Slack - Notifications",
    url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX",
    events: ["invoice.overdue", "payment.failed", "cra.submitted"],
    status: "active",
    secret: "whsec_slack123456",
    createdAt: new Date(2025, 2, 5),
    lastTriggered: new Date(2025, 10, 9),
    successCount: 156,
    errorCount: 1,
  },
];

export const MOCK_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: "log-1",
    webhookId: "wh-1",
    event: "payment.received",
    status: "success",
    statusCode: 200,
    payload: {
      amount: 2450,
      currency: "EUR",
      invoiceId: "INV-001",
    },
    response: { received: true },
    timestamp: new Date(2025, 10, 8, 14, 30),
    duration: 245,
  },
  {
    id: "log-2",
    webhookId: "wh-1",
    event: "invoice.paid",
    status: "success",
    statusCode: 200,
    payload: {
      invoiceId: "INV-001",
      amount: 2450,
    },
    response: { received: true },
    timestamp: new Date(2025, 10, 8, 14, 31),
    duration: 198,
  },
  {
    id: "log-3",
    webhookId: "wh-3",
    event: "cra.submitted",
    status: "success",
    statusCode: 200,
    payload: {
      employeeId: "emp-1",
      month: "2025-11",
      hours: 152,
    },
    timestamp: new Date(2025, 10, 7, 16, 45),
    duration: 523,
  },
  {
    id: "log-4",
    webhookId: "wh-1",
    event: "payment.failed",
    status: "error",
    statusCode: 500,
    payload: {
      invoiceId: "INV-004",
      error: "Insufficient funds",
    },
    error: "Internal Server Error",
    timestamp: new Date(2025, 10, 6, 10, 15),
    duration: 1024,
  },
];

export function generateWebhookSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function getWebhookById(id: string): Webhook | undefined {
  return MOCK_WEBHOOKS.find(w => w.id === id);
}

export function getLogsForWebhook(webhookId: string): WebhookLog[] {
  return MOCK_WEBHOOK_LOGS.filter(log => log.webhookId === webhookId);
}
