export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  balance: number;
  currency: string;
  type: "checking" | "savings" | "business";
  connected: boolean;
  lastSync?: Date;
  provider?: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category?: string;
  balance: number;
  matched: boolean;
  matchedWith?: {
    type: "invoice" | "creditNote" | "expense" | "payment" | "salary";
    id: string;
    reference: string;
  };
  reconciliationStatus: "unmatched" | "suggested" | "matched" | "ignored";
}

export interface ReconciliationSuggestion {
  transactionId: string;
  matches: {
    type: "invoice" | "creditNote" | "expense" | "payment" | "salary";
    id: string;
    reference: string;
    amount: number;
    date: Date;
    confidence: number;
    reason: string;
  }[];
}

export interface BankProvider {
  id: string;
  name: string;
  logo: string;
  type: "api" | "manual";
  countries: string[];
  features: string[];
}

export const BANK_PROVIDERS: BankProvider[] = [
  {
    id: "plaid",
    name: "Plaid (Open Banking EU)",
    logo: "🏦",
    type: "api",
    countries: ["FR", "DE", "ES", "IT"],
    features: ["Auto-sync", "Temps réel", "Toutes banques"],
  },
  {
    id: "bridge",
    name: "Bridge API",
    logo: "🌉",
    type: "api",
    countries: ["FR"],
    features: ["Auto-sync", "Banques françaises"],
  },
  {
    id: "tink",
    name: "Tink Open Banking",
    logo: "🔗",
    type: "api",
    countries: ["FR", "DE", "ES", "IT", "UK"],
    features: ["Auto-sync", "Multi-pays", "Sécurisé"],
  },
  {
    id: "manual",
    name: "Import manuel (CSV/PDF)",
    logo: "📄",
    type: "manual",
    countries: ["*"],
    features: ["CSV", "PDF", "Excel"],
  },
];

// MOCK_BANK_ACCOUNTS supprimé - Les comptes sont chargés depuis l'API via apiClient.getBankAccounts()
// MOCK_TRANSACTIONS supprimé - Les transactions sont chargées depuis l'API
// MOCK_SUGGESTIONS supprimé - Les suggestions doivent être calculées côté backend

export function getBankAccountById(id: string, accounts: BankAccount[]): BankAccount | undefined {
  return accounts.find(acc => acc.id === id);
}

export function getTransactionsByAccount(accountId: string, transactions: BankTransaction[]): BankTransaction[] {
  return transactions.filter(tx => tx.accountId === accountId);
}

// getSuggestionsForTransaction supprimé - Doit être implémenté côté backend

export function parseCSV(content: string): BankTransaction[] {
  // Simulation de parsing CSV
  return [];
}