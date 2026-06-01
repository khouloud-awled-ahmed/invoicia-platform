export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  logo?: string;
  primaryColor: string;
  matriculeFiscal: string;
  registreCommerce?: string;
  codeDouane?: string;
  affiliationCNSS?: string;
  email: string;
  phone?: string;
  address?: string | {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  tvaNumber?: string;
  isVatSubject?: boolean;
  legalForm?: string;
  capital?: number;
  // Coordonnées bancaires par défaut
  defaultBankAccount?: {
    bankName: string;
    bankAddress: string;
    iban: string;
    bic: string;
  };
  // Conditions générales de vente
  defaultTerms?: {
    penaltyRate: number;
    penaltyDescription: string;
    recoveryFee: number;
    discountPolicy: string;
    paymentTermsDefault: number;
  };
  // Paramètres de facturation
  invoiceSettings?: {
    prefix: string;
    nextNumber: string;
    footerText: string;
  };
  // Paramètres de notifications
  notificationPreferences?: {
    [key: string]: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  };
  // Paramètres de sécurité
  securitySettings?: {
    mfaRequired: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChar: boolean;
    };
  };
  pack: "essential" | "business" | "premium";
  createdAt: string;
  modules: string[];
  maxUsers: number;
  currentUsers: number;
  status: "active" | "trial" | "suspended" | "pending";
  features: string[];
  metadata?: {
    notes?: string;
    trialEndsAt?: string;
    lastLogin?: string;
    [key: string]: string | undefined;
  };
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  modules: string[];
  features: string[];
}

export const AVAILABLE_PACKS: Pack[] = [
  {
    id: "essential",
    name: "Pack Essentiel",
    price: 49,
    modules: ["dashboard", "invoices", "credit-notes", "clients", "settings"],
    features: [
      "Gestion des factures",
      "Gestion des clients",
      "Tableau de bord basique",
      "Support email",
    ],
  },
  {
    id: "business",
    name: "Pack Business",
    price: 99,
    modules: ["dashboard", "invoices", "credit-notes", "clients", "cra", "hr", "ged", "payments", "suppliers", "settings"],
    features: [
      "Toutes les fonctionnalités Essentiel",
      "Gestion des CRA",
      "Suivi des paiements",
      "Support prioritaire",
      "Rapports avancés",
    ],
  },
  {
    id: "premium",
    name: "Pack Premium",
    price: 199,
    modules: ["dashboard", "invoices", "credit-notes", "clients", "cra", "hr", "ged", "payments", "banking", "suppliers", "monitor", "settings"],
    features: [
      "Toutes les fonctionnalités Business",
      "Module RH (Absences)",
      "GED - Gestion documentaire",
      "Module Bancaire & Rapprochement",
      "Gestion des fournisseurs",
      "IA - Lecture automatique de factures",
      "Support dédié 24/7",
      "API personnalisée",
    ],
  },
];


// TENANTS export removed - use API instead

export function getTenantById(id: string, tenants: Tenant[]): Tenant | undefined {
  return tenants.find(t => t.id === id);
}

export function getPackForTenant(tenant: Tenant): Pack | undefined {
  return AVAILABLE_PACKS.find(p => p.id === tenant.pack);
}

export function hasModule(tenant: Tenant, moduleId: string): boolean {
  return tenant.modules.includes(moduleId);
}
