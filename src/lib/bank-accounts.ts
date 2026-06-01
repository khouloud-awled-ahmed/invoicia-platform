export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  iban: string;
  bic: string;
  accountType: "current" | "savings" | "business";
  currency: string;
  balance?: number;
  isDefault: boolean;
  status: "active" | "inactive" | "closed";
  openingDate?: Date;
  description?: string;
  color?: string;
}

export const ACCOUNT_TYPES = [
  { value: "current", label: "Compte courant", icon: "💳" },
  { value: "savings", label: "Compte épargne", icon: "💰" },
  { value: "business", label: "Compte professionnel", icon: "🏢" },
];

export const ACCOUNT_STATUS = [
  { value: "active", label: "Actif", color: "bg-green-100 text-green-800" },
  { value: "inactive", label: "Inactif", color: "bg-yellow-100 text-yellow-800" },
  { value: "closed", label: "Fermé", color: "bg-red-100 text-red-800" },
];

export const CURRENCIES = [
  { value: "TND", label: "TND - Dinar Tunisien", symbol: "DT" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "USD", label: "USD - Dollar", symbol: "$" },
  { value: "GBP", label: "GBP - Livre Sterling", symbol: "£" },
  { value: "CHF", label: "CHF - Franc Suisse", symbol: "CHF" },
];

export const ACCOUNT_COLORS = [
  { value: "#3b82f6", label: "Bleu" },
  { value: "#10b981", label: "Vert" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Rose" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#64748b", label: "Gris" },
];

// MOCK_BANK_ACCOUNTS supprimé - Les comptes sont chargés depuis l'API via apiClient.getBankAccounts()
// Constantes pour les types de comptes (maintenues car ce sont des enums, pas des données)

export function formatIBAN(iban: string): string {
  // Remove spaces and uppercase
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  // Add space every 4 characters
  return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
}

export function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  return cleaned.length >= 15 && cleaned.length <= 34 && /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleaned);
}

export function validateBIC(bic: string): boolean {
  const cleaned = bic.replace(/\s/g, "").toUpperCase();
  return cleaned.length >= 8 && cleaned.length <= 11 && /^[A-Z0-9]+$/.test(cleaned);
}
export function getAccountTypeLabel(type: BankAccount["accountType"]): string {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label || type;
}

export function getAccountTypeIcon(type: BankAccount["accountType"]): string {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.icon || "💳";
}

export function getStatusBadgeClass(status: BankAccount["status"]): string {
  return ACCOUNT_STATUS.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-800";
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCIES.find((c) => c.value === currency)?.symbol || currency;
}

export function setDefaultAccount(accounts: BankAccount[], accountId: string): BankAccount[] {
  return accounts.map((acc) => ({
    ...acc,
    isDefault: acc.id === accountId,
  }));
}

