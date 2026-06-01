import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface InvoiceSettings {
  // Fonctionnalités avancées
  enableDuplication: boolean;
  enableBulkEdit: boolean;
  enableAutoNumbering: boolean;
  
  // Validation et sécurité
  requireAdminValidation: boolean;
  
  // Préfixes et formats
  invoicePrefix: string;
  creditNotePrefix: string;
  
  // Paramètres de paiement
  defaultPaymentTerms: number; // en jours
  defaultPenaltyRate: string;
  defaultRecoveryFee: string;
}

interface InvoiceSettingsContextType {
  settings: InvoiceSettings;
  updateSettings: (newSettings: Partial<InvoiceSettings>) => void;
  isFeatureEnabled: (feature: keyof InvoiceSettings) => boolean;
}

const defaultSettings: InvoiceSettings = {
  enableDuplication: false,
  enableBulkEdit: false,
  enableAutoNumbering: true,
  requireAdminValidation: true,
  invoicePrefix: "FA",
  creditNotePrefix: "AV",
  defaultPaymentTerms: 30,
  defaultPenaltyRate: "10.00",
  defaultRecoveryFee: "40",
};

const InvoiceSettingsContext = createContext<InvoiceSettingsContextType | undefined>(undefined);

export function InvoiceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings);

  // Charger les paramètres depuis localStorage au montage
  useEffect(() => {
    const savedSettings = localStorage.getItem("invoiceSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      }
    }
  }, []);

  // Sauvegarder les paramètres dans localStorage à chaque modification
  const updateSettings = (newSettings: Partial<InvoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("invoiceSettings", JSON.stringify(updated));
  };

  const isFeatureEnabled = (feature: keyof InvoiceSettings): boolean => {
    return Boolean(settings[feature]);
  };

  return (
    <InvoiceSettingsContext.Provider value={{ settings, updateSettings, isFeatureEnabled }}>
      {children}
    </InvoiceSettingsContext.Provider>
  );
}

export function useInvoiceSettings() {
  const context = useContext(InvoiceSettingsContext);
  if (context === undefined) {
    throw new Error("useInvoiceSettings doit être utilisé dans un InvoiceSettingsProvider");
  }
  return context;
}
