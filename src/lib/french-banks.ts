export interface FrenchBank {
  id: string;
  name: string;
  logo: string;
  type: "traditional" | "online" | "neobank";
  apiProvider: "bridge" | "plaid" | "tink" | "direct";
  features: string[];
  avgConnectionTime: number; // en secondes
  psd2Compliant: boolean;
  popular: boolean;
}

export const FRENCH_BANKS: FrenchBank[] = [
  // Banques traditionnelles - Grand public
  {
    id: "bnp-paribas",
    name: "BNP Paribas",
    logo: "🏦",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes courants", "Épargne", "Prêts", "Cartes"],
    avgConnectionTime: 15,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "credit-agricole",
    name: "Crédit Agricole",
    logo: "🌾",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes courants", "Épargne", "Assurance vie"],
    avgConnectionTime: 12,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "societe-generale",
    name: "Société Générale",
    logo: "🔴",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes pro", "Épargne", "Bourse"],
    avgConnectionTime: 14,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "banque-populaire",
    name: "Banque Populaire",
    logo: "🔵",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes pro", "Épargne", "Crédit"],
    avgConnectionTime: 13,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "caisse-epargne",
    name: "Caisse d'Épargne",
    logo: "🐿️",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Épargne", "Comptes courants", "Crédit immobilier"],
    avgConnectionTime: 13,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "lcl",
    name: "LCL (Crédit Lyonnais)",
    logo: "🦁",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes courants", "Pro", "Épargne"],
    avgConnectionTime: 12,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "la-banque-postale",
    name: "La Banque Postale",
    logo: "📮",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes courants", "Livret A", "Services publics"],
    avgConnectionTime: 14,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "credit-mutuel",
    name: "Crédit Mutuel",
    logo: "🤝",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes courants", "Épargne", "Assurances"],
    avgConnectionTime: 11,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "cic",
    name: "CIC",
    logo: "💼",
    type: "traditional",
    apiProvider: "bridge",
    features: ["Comptes pro", "Épargne", "Services entreprises"],
    avgConnectionTime: 12,
    psd2Compliant: true,
    popular: false,
  },
  {
    id: "hsbc",
    name: "HSBC France",
    logo: "🌍",
    type: "traditional",
    apiProvider: "tink",
    features: ["Comptes internationaux", "Multi-devises", "Pro"],
    avgConnectionTime: 16,
    psd2Compliant: true,
    popular: false,
  },

  // Banques en ligne
  {
    id: "boursorama",
    name: "Boursorama Banque",
    logo: "📈",
    type: "online",
    apiProvider: "bridge",
    features: ["Gratuit", "Bourse", "Comptes courants", "Cartes"],
    avgConnectionTime: 8,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "hello-bank",
    name: "Hello bank!",
    logo: "👋",
    type: "online",
    apiProvider: "bridge",
    features: ["BNP Paribas", "Sans frais", "Application mobile"],
    avgConnectionTime: 9,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "fortuneo",
    name: "Fortuneo",
    logo: "🍀",
    type: "online",
    apiProvider: "bridge",
    features: ["Crédit Mutuel Arkéa", "Bourse", "Sans frais"],
    avgConnectionTime: 8,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "monabanq",
    name: "Monabanq",
    logo: "🏧",
    type: "online",
    apiProvider: "bridge",
    features: ["Crédit Mutuel", "Conseiller dédié"],
    avgConnectionTime: 10,
    psd2Compliant: true,
    popular: false,
  },
  {
    id: "ing",
    name: "ING Direct",
    logo: "🦁",
    type: "online",
    apiProvider: "tink",
    features: ["Épargne Orange", "Sans frais"],
    avgConnectionTime: 9,
    psd2Compliant: true,
    popular: false,
  },
  {
    id: "orange-bank",
    name: "Orange Bank",
    logo: "🍊",
    type: "online",
    apiProvider: "bridge",
    features: ["Offres Orange", "Application mobile"],
    avgConnectionTime: 10,
    psd2Compliant: true,
    popular: false,
  },

  // Néobanques
  {
    id: "n26",
    name: "N26",
    logo: "💳",
    type: "neobank",
    apiProvider: "tink",
    features: ["100% mobile", "International", "Sans agence"],
    avgConnectionTime: 5,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "revolut",
    name: "Revolut",
    logo: "🚀",
    type: "neobank",
    apiProvider: "plaid",
    features: ["Multi-devises", "Crypto", "Trading"],
    avgConnectionTime: 6,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "qonto",
    name: "Qonto",
    logo: "💼",
    type: "neobank",
    apiProvider: "bridge",
    features: ["Pro uniquement", "Comptabilité", "Factures"],
    avgConnectionTime: 7,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "shine",
    name: "Shine",
    logo: "✨",
    type: "neobank",
    apiProvider: "bridge",
    features: ["Auto-entrepreneurs", "Comptabilité", "Factures"],
    avgConnectionTime: 7,
    psd2Compliant: true,
    popular: true,
  },
  {
    id: "nickel",
    name: "Nickel",
    logo: "🎯",
    type: "neobank",
    apiProvider: "bridge",
    features: ["Buralistes", "RIB français", "Accessible"],
    avgConnectionTime: 8,
    psd2Compliant: true,
    popular: false,
  },
  {
    id: "bunq",
    name: "bunq",
    logo: "🌱",
    type: "neobank",
    apiProvider: "tink",
    features: ["Écologique", "Multi-comptes", "API ouverte"],
    avgConnectionTime: 6,
    psd2Compliant: true,
    popular: false,
  },
  {
    id: "lydia",
    name: "Lydia",
    logo: "💚",
    type: "neobank",
    apiProvider: "bridge",
    features: ["Paiement mobile", "Cagnottes", "Jeune"],
    avgConnectionTime: 5,
    psd2Compliant: true,
    popular: false,
  },

  // Banques professionnelles
  {
    id: "memo-bank",
    name: "Memo Bank",
    logo: "📝",
    type: "neobank",
    apiProvider: "bridge",
    features: ["PME uniquement", "Conseiller dédié", "Crédit"],
    avgConnectionTime: 10,
    psd2Compliant: true,
    popular: false,
  },
  {
    id: "blank",
    name: "Blank",
    logo: "⚪",
    type: "neobank",
    apiProvider: "bridge",
    features: ["Startups", "Levée de fonds", "Notes de frais"],
    avgConnectionTime: 8,
    psd2Compliant: true,
    popular: false,
  },
];

export interface BankConnectionStep {
  step: number;
  title: string;
  description: string;
  type: "info" | "credentials" | "accounts" | "consent" | "success";
}

export const CONNECTION_STEPS: BankConnectionStep[] = [
  {
    step: 1,
    title: "Informations",
    description: "Présentation de la connexion sécurisée",
    type: "info",
  },
  {
    step: 2,
    title: "Authentification",
    description: "Saisissez vos identifiants bancaires",
    type: "credentials",
  },
  {
    step: 3,
    title: "Sélection des comptes",
    description: "Choisissez les comptes à synchroniser",
    type: "accounts",
  },
  {
    step: 4,
    title: "Consentement PSD2",
    description: "Autorisez l'accès à vos données",
    type: "consent",
  },
  {
    step: 5,
    title: "Connexion réussie",
    description: "Votre banque est connectée",
    type: "success",
  },
];

export function getBankById(id: string): FrenchBank | undefined {
  return FRENCH_BANKS.find(bank => bank.id === id);
}

export function searchBanks(query: string): FrenchBank[] {
  const lowerQuery = query.toLowerCase();
  return FRENCH_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(lowerQuery)
  );
}

export function getBanksByType(type: FrenchBank["type"]): FrenchBank[] {
  return FRENCH_BANKS.filter(bank => bank.type === type);
}

export function getPopularBanks(): FrenchBank[] {
  return FRENCH_BANKS.filter(bank => bank.popular);
}
