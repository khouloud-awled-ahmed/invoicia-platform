import { createContext, useContext, useState, ReactNode } from 'react';

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logo?: string;
  customFields: CustomField[];
  showFooter: boolean;
  footerText: string;
  showBankDetails: boolean;
  showQRCode: boolean;
  layout: "classic" | "modern" | "minimal";
}

const DEFAULT_TEMPLATE: TemplateConfig = {
  id: "classic",
  name: "Classique",
  description: "Modèle traditionnel avec toutes les informations",
  primaryColor: "#1e40af",
  secondaryColor: "#60a5fa",
  fontFamily: "Arial",
  customFields: [
    {
      id: "field-order",
      label: "Numéro de commande",
      type: "text",
      required: false,
    },
    {
      id: "field-engagement",
      label: "ID d'engagement",
      type: "text",
      required: false,
    },
  ],
  showFooter: true,
  footerText: "Merci pour votre confiance",
  showBankDetails: true,
  showQRCode: false,
  layout: "classic",
};

interface InvoiceTemplateContextType {
  templateConfig: TemplateConfig;
  setTemplateConfig: (config: TemplateConfig) => void;
  updateLogo: (logoUrl: string | undefined) => void;
}

const InvoiceTemplateContext = createContext<InvoiceTemplateContextType | undefined>(undefined);

export function InvoiceTemplateProvider({ children }: { children: ReactNode }) {
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(() => {
    // Tenter de charger depuis localStorage
    const saved = localStorage.getItem('invoiceTemplateConfig');
    const loaded = saved ? JSON.parse(saved) : DEFAULT_TEMPLATE;
    
    // Si pas de logo dans le config, essayer de charger depuis le tenant
    if (!loaded.logo) {
      // On chargera le logo du tenant via useEffect dans Settings
      // Pour l'instant, on retourne la config chargée
    }
    
    return loaded;
  });

  const updateTemplateConfig = (config: TemplateConfig) => {
    setTemplateConfig(config);
    localStorage.setItem('invoiceTemplateConfig', JSON.stringify(config));
  };
  
  // Fonction pour mettre à jour uniquement le logo
  const updateLogo = (logoUrl: string | undefined) => {
    setTemplateConfig(prev => {
      const updated = { ...prev, logo: logoUrl };
      localStorage.setItem('invoiceTemplateConfig', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <InvoiceTemplateContext.Provider value={{ templateConfig, setTemplateConfig: updateTemplateConfig, updateLogo }}>
      {children}
    </InvoiceTemplateContext.Provider>
  );
}

export function useInvoiceTemplate() {
  const context = useContext(InvoiceTemplateContext);
  if (!context) {
    throw new Error('useInvoiceTemplate must be used within InvoiceTemplateProvider');
  }
  return context;
}
