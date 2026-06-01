export interface CreditNote {
  id: string;
  number: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: Date;
  dueDate?: Date;
  status: "draft" | "issued" | "applied" | "cancelled";
  reason: "error" | "return" | "discount" | "cancellation" | "other";
  reasonDetails: string;
  items: CreditNoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  appliedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CreditNoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export const CREDIT_NOTE_REASONS = [
  { value: "error", label: "Erreur de facturation", icon: "⚠️" },
  { value: "return", label: "Retour de marchandise", icon: "↩️" },
  { value: "discount", label: "Remise commerciale", icon: "💰" },
  { value: "cancellation", label: "Annulation de commande", icon: "❌" },
  { value: "other", label: "Autre", icon: "📝" },
];

export const CREDIT_NOTE_STATUS = [
  { value: "draft", label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  { value: "issued", label: "Émis", color: "bg-blue-100 text-blue-800" },
  { value: "applied", label: "Appliqué", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Annulé", color: "bg-red-100 text-red-800" },
];

// MOCK_CREDIT_NOTES supprimé - Les avoirs sont chargés depuis l'API via apiClient.getCreditNotes()
// MOCK_INVOICES_FOR_CREDIT supprimé - Les factures sont chargées depuis l'API

export function calculateCreditNoteTotal(items: CreditNoteItem[]): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = items.reduce(
    (sum, item) => sum + (item.total * item.vatRate) / 100,
    0
  );
  const total = subtotal + vatAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function getNextCreditNoteNumber(creditNotes: CreditNote[]): string {
  const year = new Date().getFullYear();
  const count = creditNotes.length + 1;
  return `AV-${year}-${String(count).padStart(3, "0")}`;
}

export function getCreditNotesByInvoice(invoiceId: string, creditNotes: CreditNote[]): CreditNote[] {
  return creditNotes.filter((cn) => cn.invoiceId === invoiceId);
}

export function getTotalCreditForInvoice(invoiceId: string, creditNotes: CreditNote[]): number {
  return creditNotes.filter(
    (cn) => cn.invoiceId === invoiceId && cn.status === "applied"
  ).reduce((sum, cn) => sum + cn.total, 0);
}

export function getStatusBadgeClass(status: CreditNote["status"]): string {
  const statusConfig = CREDIT_NOTE_STATUS.find((s) => s.value === status);
  return statusConfig?.color || "bg-gray-100 text-gray-800";
}

export function getReasonLabel(reason: CreditNote["reason"]): string {
  const reasonConfig = CREDIT_NOTE_REASONS.find((r) => r.value === reason);
  return reasonConfig?.label || reason;
}

export function getReasonIcon(reason: CreditNote["reason"]): string {
  const reasonConfig = CREDIT_NOTE_REASONS.find((r) => r.value === reason);
  return reasonConfig?.icon || "📝";
}
