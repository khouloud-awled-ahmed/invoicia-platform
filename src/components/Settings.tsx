import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Building2, Shield, Webhook, CreditCard, Landmark, FileText, Bell, Eye, Package } from "lucide-react";
import { MFASetup } from "./MFASetup";
import { SSOConfiguration } from "./SSOConfiguration";
import { WebhookManagement } from "./WebhookManagement";
import { BankAccountManagement } from "./BankAccountManagement";
import { InvoiceTemplateSettings } from "./InvoiceTemplateSettings";
import { CompanySettingsEnhanced } from "./CompanySettingsEnhanced";
import { NotificationSettings } from "./NotificationSettings";
import { InvoicePreview } from "./InvoicePreview";
import { toast } from "sonner";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { useInvoiceTemplate } from "../utils/invoiceTemplateContext";

export function Settings() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const { tenant, loading, updateInvoiceSettings } = useCompanySettings();
  const { templateConfig } = useInvoiceTemplate();
  const [showPreview, setShowPreview] = useState(false);
  
  // État local pour les paramètres de facturation (synchronisé avec tenant.invoiceSettings)
  const [billingSettings, setBillingSettings] = useState({
    invoicePrefix: "FA",
    nextInvoiceNumber: "001",
    footerText: "Merci de votre confiance !\nPaiement par virement bancaire.\nEn cas de retard de paiement, pénalités de 3x le taux d'intérêt légal.",
  });

  // Synchroniser avec tenant.invoiceSettings quand le tenant est chargé
  useEffect(() => {
    if (tenant?.invoiceSettings) {
      setBillingSettings({
        invoicePrefix: tenant.invoiceSettings.prefix || "FA",
        nextInvoiceNumber: tenant.invoiceSettings.nextNumber || "001",
        footerText: tenant.invoiceSettings.footerText || "",
      });
    }
  }, [tenant]);

  const handleSaveBillingSettings = async () => {
    try {
      await updateInvoiceSettings({
        prefix: billingSettings.invoicePrefix,
        nextNumber: billingSettings.nextInvoiceNumber,
        footerText: billingSettings.footerText,
      });
      toast.success('Paramètres de facturation enregistrés avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error?.message || 'Erreur lors de la sauvegarde des paramètres');
    }
  };

  // Préparer les données de la société pour l'aperçu
  const getCompanyDataForPreview = () => {
    if (!tenant) {
      return {
        legalName: "Ma Société",
        siret: "123 456 789 00012",
        address: "123 Rue de la Facturation, 75001 Paris",
        email: "contact@masociete.fr",
        phone: "+33 1 23 45 67 89",
        logo: null,
      };
    }

    const addressStr = typeof tenant.address === 'string' 
      ? tenant.address 
      : tenant.address 
        ? `${tenant.address.line1}${tenant.address.line2 ? `, ${tenant.address.line2}` : ''}, ${tenant.address.postalCode} ${tenant.address.city}, ${tenant.address.country}`
        : '';

    return {
      legalName: tenant.businessName || tenant.name,
      siret: tenant.siret,
      address: addressStr,
      email: tenant.email,
      phone: tenant.phone || "",
      logo: tenant.logo || null,
    };
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1>Paramètres</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1>Paramètres</h1>
        <p className="text-muted-foreground">Gérez les paramètres de votre compte</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Modules (App Store)</p>
              <p className="text-sm text-muted-foreground">Activer ou désactiver les fonctionnalités visibles dans le menu</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => (window.location.href = "/settings/modules")}>
            Gérer les modules
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="w-4 h-4 mr-2" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="invoice-templates">
            <FileText className="w-4 h-4 mr-2" />
            Modèles de Facture
          </TabsTrigger>
          <TabsTrigger value="bank-accounts">
            <Landmark className="w-4 h-4 mr-2" />
            Comptes bancaires
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Facturation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanySettingsEnhanced />
        </TabsContent>

        <TabsContent value="invoice-templates">
          <InvoiceTemplateSettings />
        </TabsContent>

        <TabsContent value="bank-accounts" className="space-y-6">
          <BankAccountManagement />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <MFASetup isEnabled={mfaEnabled} onToggle={setMfaEnabled} />
          <SSOConfiguration />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <WebhookManagement />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de facturation</CardTitle>
              <CardDescription>
                Configurez les paramètres généraux de vos factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Paramètres de numérotation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Numérotation des factures</h3>
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
                  <Input
                    id="invoicePrefix"
                    value={billingSettings.invoicePrefix}
                    onChange={(e) => setBillingSettings({ ...billingSettings, invoicePrefix: e.target.value })}
                    placeholder="Ex: FA-"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ce préfixe sera ajouté avant le numéro de facture (ex: FA-2025-001)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextInvoiceNumber">Prochain numéro de facture</Label>
                  <Input
                    id="nextInvoiceNumber"
                    type="text"
                    value={billingSettings.nextInvoiceNumber}
                    onChange={(e) => setBillingSettings({ ...billingSettings, nextInvoiceNumber: e.target.value })}
                    placeholder="001"
                  />
                  <p className="text-sm text-muted-foreground">
                    Numéro de la prochaine facture à créer
                  </p>
                </div>
              </div>

              <Separator />

              {/* Conditions par défaut */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conditions par défaut</h3>
                <div className="space-y-2">
                  <Label htmlFor="footerText">Texte du pied de page par défaut</Label>
                  <Textarea
                    id="footerText"
                    value={billingSettings.footerText}
                    onChange={(e) => setBillingSettings({ ...billingSettings, footerText: e.target.value })}
                    rows={4}
                    placeholder="Merci de votre confiance !"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ce texte apparaîtra en bas de chaque facture (utilisez \n pour les retours à la ligne)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu de facture */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aperçu de facture</CardTitle>
                  <CardDescription>
                    Visualisez l'apparence de vos factures avec les paramètres actuels
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Masquer' : 'Afficher'} l'aperçu
                </Button>
              </div>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <InvoicePreview
                  data={{
                    invoiceNumber: `${billingSettings.invoicePrefix}-2025-${billingSettings.nextInvoiceNumber}`,
                    date: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    client: "Client Exemple",
                    clientAddress: "123 Rue de l'Exemple, 75001 Paris",
                    clientEmail: "client@exemple.fr",
                    items: [
                      {
                        description: "Prestation de service",
                        quantity: 10,
                        unitPrice: 100,
                        discount: 0,
                        vatRate: 20,
                      },
                      {
                        description: "Frais annexes",
                        quantity: 1,
                        unitPrice: 50,
                        discount: 10,
                        vatRate: 20,
                      },
                    ],
                    notes: billingSettings.footerText.replace(/\\n/g, '\n'),
                  }}
                  companyData={getCompanyDataForPreview()}
                  templateConfig={{
                    primaryColor: templateConfig.primaryColor,
                    secondaryColor: templateConfig.secondaryColor,
                    fontFamily: templateConfig.fontFamily,
                    layout: templateConfig.layout,
                  }}
                />
              </CardContent>
            )}
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Annuler
            </Button>
            <Button onClick={handleSaveBillingSettings}>
              Enregistrer les modifications
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
