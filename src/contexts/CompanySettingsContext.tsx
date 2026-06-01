import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client-backend';
import { Tenant } from '../lib/tenants';
import { toast } from 'sonner';

interface CompanySettingsContextType {
  tenant: Tenant | null;
  loading: boolean;
  updateCompanyInfo: (data: {
    siren?: string;
    tvaNumber?: string;
    isVatSubject?: boolean;
    legalForm?: string;
    capital?: number;
    rcs?: string;
    address?: {
      line1: string;
      line2?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    email?: string;
    phone?: string;
  }) => Promise<void>;
  updateBankAccount: (data: {
    bankName: string;
    bankAddress: string;
    iban: string;
    bic: string;
  }) => Promise<void>;
  updateInvoiceSettings: (data: {
    prefix?: string;
    nextNumber?: string;
    footerText?: string;
  }) => Promise<void>;
  updateNotificationPreferences: (data: {
    [key: string]: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  }) => Promise<void>;
  updateSecuritySettings: (data: {
    mfaRequired?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: {
      minLength: number;
      requireSpecialChar: boolean;
    };
  }) => Promise<void>;
  updateLogo: (logoUrl: string | null) => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentTenantId = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // PLATFORM_ADMIN n'a pas de tenantId
        if (user.role === 'PLATFORM_ADMIN') {
          return null;
        }
        const tenantId = user.tenantId;
        // Vérifier que tenantId existe, n'est pas vide, et n'est pas 'tenant-1' (valeur obsolète)
        if (tenantId && tenantId.trim() !== '' && tenantId !== 'tenant-1') {
          return tenantId;
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const refreshTenant = async () => {
    const tenantId = getCurrentTenantId();
    if (!tenantId || tenantId.trim() === '' || tenantId === 'tenant-1') {
      setLoading(false);
      setTenant(null);
      return;
    }

    try {
      setLoading(true);
      const tenantData = await apiClient.getTenant(tenantId);
      setTenant(tenantData);
      
      // Rediriger vers onboarding si statut INCOMPLETE
      if (tenantData.subscriptionStatus === 'INCOMPLETE' && window.location.pathname !== '/onboarding') {
        window.location.href = '/onboarding';
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du tenant:', error);
      // Si erreur 404, nettoyer le localStorage car le tenant n'existe plus
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        console.warn('Tenant introuvable, nettoyage du localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        toast.error('Erreur lors du chargement des paramètres de la société');
      }
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTenant();
  }, []);

  const updateCompanyInfo = async (data: {
    siren?: string;
    tvaNumber?: string;
    isVatSubject?: boolean;
    legalForm?: string;
    capital?: number;
    rcs?: string;
    address?: {
      line1: string;
      line2?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    email?: string;
    phone?: string;
  }) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Aucun tenant trouvé');
    }

    try {
      const updatedTenant = await apiClient.updateTenantCompanyInfo(tenantId, data);
      setTenant(updatedTenant);
      toast.success('Informations de la société mises à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error?.message || 'Erreur lors de la mise à jour des informations');
      throw error;
    }
  };

  const updateBankAccount = async (data: {
    bankName: string;
    bankAddress: string;
    iban: string;
    bic: string;
  }) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Aucun tenant trouvé');
    }

    try {
      const updatedTenant = await apiClient.updateTenantBankAccount(tenantId, data);
      setTenant(updatedTenant);
      toast.success('Compte bancaire mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error?.message || 'Erreur lors de la mise à jour du compte bancaire');
      throw error;
    }
  };

  const updateInvoiceSettings = async (data: {
    prefix?: string;
    nextNumber?: string;
    footerText?: string;
  }) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Aucun tenant trouvé');
    }

    try {
      const updatedTenant = await apiClient.updateTenantInvoiceSettings(tenantId, data);
      setTenant(updatedTenant);
      toast.success('Paramètres de facturation mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error?.message || 'Erreur lors de la mise à jour des paramètres de facturation');
      throw error;
    }
  };

  const updateNotificationPreferences = async (data: {
    [key: string]: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  }) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Aucun tenant trouvé');
    }

    try {
      const updatedTenant = await apiClient.updateTenantNotificationPreferences(tenantId, data);
      setTenant(updatedTenant);
      toast.success('Préférences de notifications mises à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error?.message || 'Erreur lors de la mise à jour des préférences');
      throw error;
    }
  };

  const updateSecuritySettings = async (data: {
    mfaRequired?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: {
      minLength: number;
      requireSpecialChar: boolean;
    };
  }) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Aucun tenant trouvé');
    }

    try {
      const updatedTenant = await apiClient.updateTenantSecuritySettings(tenantId, data);
      setTenant(updatedTenant);
      toast.success('Paramètres de sécurité mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error?.message || 'Erreur lors de la mise à jour des paramètres de sécurité');
      throw error;
    }
  };

  const updateLogo = async (logoUrl: string | null) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Aucun tenant trouvé');
    }

    try {
      const updatedTenant = await apiClient.updateTenant(tenantId, { logo: logoUrl });
      setTenant(updatedTenant);
      if (logoUrl) {
        toast.success('Logo mis à jour');
      } else {
        toast.success('Logo supprimé');
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du logo:', error);
      toast.error(error?.message || 'Erreur lors de la mise à jour du logo');
      throw error;
    }
  };

  return (
    <CompanySettingsContext.Provider
      value={{
        tenant,
        loading,
        updateCompanyInfo,
        updateBankAccount,
        updateInvoiceSettings,
        updateNotificationPreferences,
        updateSecuritySettings,
        updateLogo,
        refreshTenant,
      }}
    >
      {children}
    </CompanySettingsContext.Provider>
  );
}

export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
}

