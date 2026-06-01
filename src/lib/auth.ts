export interface User {
  id: string;
  name: string;
  email: string;
  role: "PLATFORM_ADMIN" | "TENANT_ADMIN" | "USER" | "super_admin" | "admin" | "manager" | "consultant" | "rh"; // Support anciens rôles pour compatibilité
  tenantId?: string;
  avatar?: string;
  mfaEnabled: boolean;
}

// Fonction pour obtenir le tenantId depuis localStorage
function getTenantIdFromStorage(): string | undefined {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.tenantId || undefined;
    }
  } catch (e) {
    console.warn('Erreur lors de la lecture du tenantId depuis localStorage', e);
  }
  return undefined;
}

export const MOCK_USER: User = {
  id: "user-1",
  name: "Jean Dupont",
  email: "jean.dupont@techconsult.fr",
  role: "TENANT_ADMIN",
  tenantId: getTenantIdFromStorage(),
  avatar: "JD",
  mfaEnabled: true,
};

// Super Admin pour la démo
export const SUPER_ADMIN_USER: User = {
  id: "super-admin-1",
  name: "Admin Plateforme",
  email: "admin@invoicia.fr",
  role: "PLATFORM_ADMIN",
  avatar: "AP",
  mfaEnabled: true,
};

export const ROLES = {
  PLATFORM_ADMIN: {
    name: "Administrateur Plateforme",
    permissions: ["platform:*"],
  },
  TENANT_ADMIN: {
    name: "Administrateur Tenant",
    permissions: ["*"],
  },
  USER: {
    name: "Utilisateur",
    permissions: ["read:own", "write:cra", "write:absences"],
  },
  // Anciens rôles pour compatibilité
  super_admin: {
    name: "Super Administrateur",
    permissions: ["platform:*"],
  },
  admin: {
    name: "Administrateur",
    permissions: ["*"],
  },
  manager: {
    name: "Manager",
    permissions: ["read:*", "write:cra", "write:absences", "validate:cra", "validate:absences"],
  },
  consultant: {
    name: "Consultant",
    permissions: ["read:own", "write:cra", "write:absences"],
  },
  rh: {
    name: "RH",
    permissions: ["read:*", "write:absences", "write:employees", "validate:absences"],
  },
};

export function hasPermission(user: User, permission: string): boolean {
  const rolePermissions = ROLES[user.role as keyof typeof ROLES]?.permissions || [];
  return rolePermissions.includes("*") || rolePermissions.includes("platform:*") || rolePermissions.includes(permission);
}

export function isSuperAdmin(user: User): boolean {
  return user.role === "PLATFORM_ADMIN" || user.role === "super_admin";
}
