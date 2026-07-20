import { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Save, CreditCard, Mail, Building2, FileText } from 'lucide-react';

const ink = '#0F172A';
const slateMid = '#64748B';
const slateLight = '#94A3B8';
const border = '#E2E8F0';
const indigo = '#4F46E5';

interface PlatformSettings {
  paymentMethods?: {
    iban?: { iban: string; bic: string; bankName: string; accountHolder: string; };
    stripe?: { publicKey: string; };
    paypal?: { clientId: string; };
  };
  supportEmail?: string;
  supportPhone?: string;
  companyName?: string;
  address?: { line1: string; line2?: string; postalCode: string; country: string; };
  invoiceLogoUrl?: string;
  invoiceCompanyName?: string;
  invoiceCompanyAddress?: { line1: string; line2?: string; postalCode: string; city: string; country: string; };
  invoiceCompanyVat?: string;
  invoiceFooterText?: string;
  invoiceColor?: string;
  invoicePrefix?: string;
}

type TabId = 'payment' | 'company' | 'support' | 'invoice';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'payment', label: 'Moyens de Paiement', icon: CreditCard },
  { id: 'company', label: 'Informations Entreprise', icon: Building2 },
  { id: 'support', label: 'Support', icon: Mail },
  { id: 'invoice', label: 'Modèle de Facture', icon: FileText },
];

export function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('payment');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPlatformSettings();
      setSettings(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    try {
      setIsSaving(true);
      await apiClient.updatePlatformSettings(settings);
      toast.success('Paramètres enregistrés');
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setIsSaving(false);
    }
  };

  const section = (title: string, desc: string, children: React.ReactNode) => (
    <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
        <p style={{ fontSize: '13.5px', fontWeight: 600, color: ink, margin: 0 }}>{title}</p>
        <p style={{ fontSize: '12px', color: slateMid, margin: '2px 0 0' }}>{desc}</p>
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  );

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: ink, marginBottom: '5px' }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: slateLight, margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );

  const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{ width: '100%', fontSize: '13px', color: ink, background: '#F8FAFC', border: `1px solid ${border}`, borderRadius: '7px', padding: '8px 10px', outline: 'none', boxSizing: 'border-box' as const, ...props.style }} />
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: `3px solid ${border}`, borderTopColor: indigo, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: slateMid, fontSize: '13px' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`.ps-tab{transition:all 0.15s ease}.ps-tab:hover{color:#0F172A}.ps-save:hover{background:#4338CA}`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: ink, margin: 0 }}>Paramètres Plateforme</h1>
          <p style={{ fontSize: '13px', color: slateMid, margin: '4px 0 0' }}>Configuration globale de la plateforme SaaS</p>
        </div>
        <button
          className="ps-save"
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', background: indigo, border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', transition: 'background 0.15s ease', opacity: isSaving ? 0.7 : 1 }}
        >
          <Save style={{ width: '14px', height: '14px' }} />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: '#F1F5F9', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className="ps-tab"
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: isActive ? 600 : 500, color: isActive ? ink : slateMid, background: isActive ? '#fff' : 'transparent', border: 'none', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer', boxShadow: isActive ? '0 1px 3px rgba(15,23,42,0.08)' : 'none' }}
            >
              <Icon style={{ width: '13px', height: '13px' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Payment */}
      {activeTab === 'payment' && (
        <div>
          {section('IBAN (Virements)', 'Coordonnées bancaires pour recevoir les paiements par virement', (
            <div>
              {field('IBAN', inp({ value: settings.paymentMethods?.iban?.iban || '', onChange: (e) => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, iban: { ...settings.paymentMethods?.iban, iban: e.target.value, bic: settings.paymentMethods?.iban?.bic || '', bankName: settings.paymentMethods?.iban?.bankName || '', accountHolder: settings.paymentMethods?.iban?.accountHolder || '' } } }), placeholder: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX' }))}
              {field('BIC', inp({ value: settings.paymentMethods?.iban?.bic || '', onChange: (e) => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, iban: { ...settings.paymentMethods?.iban, iban: settings.paymentMethods?.iban?.iban || '', bic: e.target.value, bankName: settings.paymentMethods?.iban?.bankName || '', accountHolder: settings.paymentMethods?.iban?.accountHolder || '' } } }), placeholder: 'ABCDEFGH' }))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {field('Nom de la banque', inp({ value: settings.paymentMethods?.iban?.bankName || '', onChange: (e) => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, iban: { ...settings.paymentMethods?.iban, iban: settings.paymentMethods?.iban?.iban || '', bic: settings.paymentMethods?.iban?.bic || '', bankName: e.target.value, accountHolder: settings.paymentMethods?.iban?.accountHolder || '' } } }), placeholder: 'Banque Populaire' }))}
                {field('Titulaire du compte', inp({ value: settings.paymentMethods?.iban?.accountHolder || '', onChange: (e) => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, iban: { ...settings.paymentMethods?.iban, iban: settings.paymentMethods?.iban?.iban || '', bic: settings.paymentMethods?.iban?.bic || '', bankName: settings.paymentMethods?.iban?.bankName || '', accountHolder: e.target.value } } }), placeholder: 'Invoicia SAS' }))}
              </div>
            </div>
          ))}
          {section('Stripe', 'Configuration Stripe pour les paiements en ligne', (
            field('Clé publique Stripe', inp({ value: settings.paymentMethods?.stripe?.publicKey || '', onChange: (e) => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, stripe: { publicKey: e.target.value } } }), placeholder: 'pk_test_...' }))
          ))}
          {section('PayPal', 'Configuration PayPal pour les paiements en ligne', (
            field('Client ID PayPal', inp({ value: settings.paymentMethods?.paypal?.clientId || '', onChange: (e) => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, paypal: { clientId: e.target.value } } }), placeholder: 'AaBbCcDd...' }))
          ))}
        </div>
      )}

      {/* Company */}
      {activeTab === 'company' && (
        <div>
          {section('Informations générales', 'Nom et adresse principale de votre entreprise', (
            <div>
              {field('Nom de l\'entreprise', inp({ value: settings.companyName || '', onChange: (e) => setSettings({ ...settings, companyName: e.target.value }), placeholder: 'Invoicia SAS' }))}
              {field('Adresse ligne 1', inp({ value: settings.address?.line1 || '', onChange: (e) => setSettings({ ...settings, address: { ...settings.address, line1: e.target.value, postalCode: settings.address?.postalCode || '', country: settings.address?.country || '' } }), placeholder: '123 Rue Example' }))}
              {field('Adresse ligne 2 (optionnel)', inp({ value: settings.address?.line2 || '', onChange: (e) => setSettings({ ...settings, address: { ...settings.address, line1: settings.address?.line1 || '', line2: e.target.value, postalCode: settings.address?.postalCode || '', country: settings.address?.country || '' } }), placeholder: 'Bâtiment A' }))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {field('Code postal', inp({ value: settings.address?.postalCode || '', onChange: (e) => setSettings({ ...settings, address: { ...settings.address, line1: settings.address?.line1 || '', postalCode: e.target.value, country: settings.address?.country || '' } }), placeholder: '75001' }))}
                {field('Pays', inp({ value: settings.address?.country || '', onChange: (e) => setSettings({ ...settings, address: { ...settings.address, line1: settings.address?.line1 || '', postalCode: settings.address?.postalCode || '', country: e.target.value } }), placeholder: 'France' }))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support */}
      {activeTab === 'support' && (
        <div>
          {section('Coordonnées support', 'Email et téléphone affichés aux clients', (
            <div>
              {field('Email de support', inp({ type: 'email', value: settings.supportEmail || '', onChange: (e) => setSettings({ ...settings, supportEmail: e.target.value }), placeholder: 'support@invoicia.io' }))}
              {field('Téléphone de support', inp({ value: settings.supportPhone || '', onChange: (e) => setSettings({ ...settings, supportPhone: e.target.value }), placeholder: '+33 1 23 45 67 89' }))}
            </div>
          ))}
        </div>
      )}

      {/* Invoice */}
      {activeTab === 'invoice' && (
        <div>
          {section('Apparence & numérotation', 'Couleur et préfixe des factures générées', (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {field('Préfixe des numéros de facture', inp({ value: settings.invoicePrefix || '', onChange: (e) => setSettings({ ...settings, invoicePrefix: e.target.value }), placeholder: 'INV' }), `Format: ${settings.invoicePrefix || 'INV'}-2024-001`)}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: ink, marginBottom: '5px' }}>Couleur principale</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={settings.invoiceColor || '#667eea'} onChange={(e) => setSettings({ ...settings, invoiceColor: e.target.value })} style={{ width: '38px', height: '36px', border: `1px solid ${border}`, borderRadius: '7px', cursor: 'pointer', padding: '2px' }} />
                    {inp({ value: settings.invoiceColor || '#667eea', onChange: (e) => setSettings({ ...settings, invoiceColor: e.target.value }), placeholder: '#667eea', style: { flex: 1 } })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {section('Informations Entreprise (sur facture)', 'Ces informations apparaissent sur les factures générées', (
            <div>
              {field('Nom de l\'entreprise', inp({ value: settings.invoiceCompanyName || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyName: e.target.value }), placeholder: 'Invoicia SAS' }), 'Si vide, utilise le nom de l\'entreprise général')}
              {field('Adresse ligne 1', inp({ value: settings.invoiceCompanyAddress?.line1 || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyAddress: { ...settings.invoiceCompanyAddress, line1: e.target.value, postalCode: settings.invoiceCompanyAddress?.postalCode || '', city: settings.invoiceCompanyAddress?.city || '', country: settings.invoiceCompanyAddress?.country || '' } }), placeholder: '123 Rue Example' }))}
              {field('Adresse ligne 2 (optionnel)', inp({ value: settings.invoiceCompanyAddress?.line2 || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyAddress: { ...settings.invoiceCompanyAddress, line1: settings.invoiceCompanyAddress?.line1 || '', line2: e.target.value, postalCode: settings.invoiceCompanyAddress?.postalCode || '', city: settings.invoiceCompanyAddress?.city || '', country: settings.invoiceCompanyAddress?.country || '' } }), placeholder: 'Bâtiment A' }))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {field('Code postal', inp({ value: settings.invoiceCompanyAddress?.postalCode || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyAddress: { ...settings.invoiceCompanyAddress, line1: settings.invoiceCompanyAddress?.line1 || '', postalCode: e.target.value, city: settings.invoiceCompanyAddress?.city || '', country: settings.invoiceCompanyAddress?.country || '' } }), placeholder: '75001' }))}
                {field('Ville', inp({ value: settings.invoiceCompanyAddress?.city || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyAddress: { ...settings.invoiceCompanyAddress, line1: settings.invoiceCompanyAddress?.line1 || '', postalCode: settings.invoiceCompanyAddress?.postalCode || '', city: e.target.value, country: settings.invoiceCompanyAddress?.country || '' } }), placeholder: 'Paris' }))}
                {field('Pays', inp({ value: settings.invoiceCompanyAddress?.country || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyAddress: { ...settings.invoiceCompanyAddress, line1: settings.invoiceCompanyAddress?.line1 || '', postalCode: settings.invoiceCompanyAddress?.postalCode || '', city: settings.invoiceCompanyAddress?.city || '', country: e.target.value } }), placeholder: 'France' }))}
              </div>
              {field('Numéro de TVA intracommunautaire', inp({ value: settings.invoiceCompanyVat || '', onChange: (e) => setSettings({ ...settings, invoiceCompanyVat: e.target.value }), placeholder: 'FR12345678901' }))}
            </div>
          ))}
          {section('Pied de page', 'Mentions légales affichées en bas de chaque facture', (
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: ink, marginBottom: '5px' }}>Pied de page (Mentions légales)</label>
              <textarea
                style={{ width: '100%', minHeight: '90px', fontSize: '13px', color: ink, background: '#F8FAFC', border: `1px solid ${border}`, borderRadius: '7px', padding: '8px 10px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }}
                value={settings.invoiceFooterText || ''}
                onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                placeholder="Capital social: 10 000€ - RCS Paris B 123 456 789"
              />
              <p style={{ fontSize: '11px', color: slateLight, margin: '4px 0 0' }}>Mentions légales, capital social, RCS, etc.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}