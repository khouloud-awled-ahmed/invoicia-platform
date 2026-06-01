// Données pour la gestion d'Invoicia

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  activeUsers: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number;
  newTenantsThisMonth: number;
  canceledThisMonth: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  features: string[];
  maxUsers: number;
  maxInvoicesPerMonth: number;
  modules: string[];
  status: "active" | "inactive";
  tenantsCount: number;
  description: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "platform_admin" | "support";
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  apiResponseTime: number;
  databaseResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  lastBackup?: string;
}

export const MOCK_PLATFORM_STATS: PlatformStats = {
  totalTenants: 127,
  activeTenants: 115,
  trialTenants: 8,
  suspendedTenants: 4,
  totalUsers: 856,
  activeUsers: 723,
  mrr: 12450,
  arr: 149400,
  churnRate: 2.3,
  newTenantsThisMonth: 12,
  canceledThisMonth: 3,
};

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "essential",
    name: "Pack Essentiel",
    price: 49,
    billingPeriod: "monthly",
    description: "Pour les petites structures démarrant leur activité",
    features: [
      "Gestion des factures",
      "Gestion des clients",
      "Tableau de bord basique",
      "Support email",
    ],
    maxUsers: 5,
    maxInvoicesPerMonth: 50,
    modules: ["dashboard", "invoices", "credit-notes", "clients", "settings"],
    status: "active",
    tenantsCount: 45,
  },
  {
    id: "business",
    name: "Pack Business",
    price: 99,
    billingPeriod: "monthly",
    description: "Pour les entreprises en croissance",
    features: [
      "Toutes les fonctionnalités Essentiel",
      "Gestion des CRA",
      "Suivi des paiements",
      "Support prioritaire",
      "Rapports avancés",
    ],
    maxUsers: 25,
    maxInvoicesPerMonth: 200,
    modules: ["dashboard", "invoices", "credit-notes", "clients", "cra", "hr", "ged", "payments", "suppliers", "settings"],
    status: "active",
    tenantsCount: 58,
  },
  {
    id: "premium",
    name: "Pack Premium",
    price: 199,
    billingPeriod: "monthly",
    description: "Solution complète pour les grandes ESN",
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
    maxUsers: 100,
    maxInvoicesPerMonth: 1000,
    modules: ["dashboard", "invoices", "credit-notes", "clients", "cra", "hr", "ged", "payments", "banking", "suppliers", "monitor", "settings"],
    status: "active",
    tenantsCount: 24,
  },
];

export const MOCK_PLATFORM_USERS: PlatformUser[] = [
  {
    id: "puser-1",
    name: "Admin Plateforme",
    email: "admin@invoicia.fr",
    role: "super_admin",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2025-11-10T10:30:00",
  },
  {
    id: "puser-2",
    name: "Sophie Martin",
    email: "sophie.martin@invoicia.fr",
    role: "platform_admin",
    status: "active",
    createdAt: "2024-02-15",
    lastLogin: "2025-11-10T09:00:00",
  },
  {
    id: "puser-3",
    name: "Lucas Dubois",
    email: "lucas.dubois@invoicia.fr",
    role: "support",
    status: "active",
    createdAt: "2024-03-20",
    lastLogin: "2025-11-09T16:45:00",
  },
];

export const MOCK_SYSTEM_HEALTH: SystemHealth = {
  status: "healthy",
  uptime: 99.98,
  apiResponseTime: 145,
  databaseResponseTime: 28,
  errorRate: 0.02,
  activeConnections: 342,
  memoryUsage: 68,
  cpuUsage: 42,
  lastBackup: "2025-11-10T02:00:00",
};

export interface RevenueData {
  month: string;
  mrr: number;
  newMrr: number;
  churnedMrr: number;
}

export const MOCK_REVENUE_DATA: RevenueData[] = [
  { month: "Mai", mrr: 10200, newMrr: 1200, churnedMrr: 300 },
  { month: "Juin", mrr: 10800, newMrr: 900, churnedMrr: 300 },
  { month: "Juil", mrr: 11300, newMrr: 800, churnedMrr: 300 },
  { month: "Août", mrr: 11600, newMrr: 600, churnedMrr: 300 },
  { month: "Sept", mrr: 12000, newMrr: 700, churnedMrr: 300 },
  { month: "Oct", mrr: 12450, newMrr: 750, churnedMrr: 300 },
];
