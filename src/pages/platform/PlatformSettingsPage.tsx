import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Save, CreditCard, Mail, Building2, FileText, Upload } from 'lucide-react';

interface PlatformSettings {
  paymentMethods?: {
    iban?: {
      iban: string;
      bic: string;
      bankName: string;
      accountHolder: string;
    };
    stripe?: {
      publicKey: string;
    };
    paypal?: {
      clientId: string;
    };
  };
  supportEmail?: string;
  supportPhone?: string;
  companyName?: string;
  address?: {
    line1: string;
    line2?: string;
    postalCode: string;
    country: string;
  };
  // Invoice configuration
  invoiceLogoUrl?: string;
  invoiceCompanyName?: string;
  invoiceCompanyAddress?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  invoiceCompanyVat?: string;
  invoiceFooterText?: string;
  invoiceColor?: string;
  invoicePrefix?: string;
}

export function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      setIsSaving(true);
      console.log('Enregistrement des paramètres avec les données:', settings);
      await apiClient.updatePlatformSettings(settings);
      toast.success('Paramètres enregistrés');
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast.error('Erreur lors de l\'enregistrement: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres Plateforme</h1>
          <p className="text-muted-foreground mt-2">
            Configuration globale de la plateforme SaaS
          </p>
        </div>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Moyens de Paiement
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="w-4 h-4 mr-2" />
            Informations Entreprise
          </TabsTrigger>
          <TabsTrigger value="support">
            <Mail className="w-4 h-4 mr-2" />
            Support
          </TabsTrigger>
          <TabsTrigger value="invoice">
            <FileText className="w-4 h-4 mr-2" />
            Modèle de Facture
          </TabsTrigger>
        </TabsList>

        {/* Payment Methods */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IBAN (Virements)</CardTitle>
              <CardDescription>
                Coordonnées bancaires pour recevoir les paiements par virement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={settings.paymentMethods?.iban?.iban || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentMethods: {
                        ...settings.paymentMethods,
                        iban: {
                          ...settings.paymentMethods?.iban,
                          iban: e.target.value,
                          bic: settings.paymentMethods?.iban?.bic || '',
                          bankName: settings.paymentMethods?.iban?.bankName || '',
                          accountHolder: settings.paymentMethods?.iban?.accountHolder || '',
                        },
                      },
                    })
                  }
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bic">BIC</Label>
                <Input
                  id="bic"
                  value={settings.paymentMethods?.iban?.bic || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentMethods: {
                        ...settings.paymentMethods,
                        iban: {
                          ...settings.paymentMethods?.iban,
                          iban: settings.paymentMethods?.iban?.iban || '',
                          bic: e.target.value,
                          bankName: settings.paymentMethods?.iban?.bankName || '',
                          accountHolder: settings.paymentMethods?.iban?.accountHolder || '',
                        },
                      },
                    })
                  }
                  placeholder="ABCDEFGH"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nom de la banque</Label>
                  <Input
                    id="bankName"
                    value={settings.paymentMethods?.iban?.bankName || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          iban: {
                            ...settings.paymentMethods?.iban,
                            iban: settings.paymentMethods?.iban?.iban || '',
                            bic: settings.paymentMethods?.iban?.bic || '',
                            bankName: e.target.value,
                            accountHolder: settings.paymentMethods?.iban?.accountHolder || '',
                          },
                        },
                      })
                    }
                    placeholder="Banque Populaire"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Titulaire du compte</Label>
                  <Input
                    id="accountHolder"
                    value={settings.paymentMethods?.iban?.accountHolder || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          iban: {
                            ...settings.paymentMethods?.iban,
                            iban: settings.paymentMethods?.iban?.iban || '',
                            bic: settings.paymentMethods?.iban?.bic || '',
                            bankName: settings.paymentMethods?.iban?.bankName || '',
                            accountHolder: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Invoicia SAS"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe</CardTitle>
              <CardDescription>
                Configuration Stripe pour les paiements en ligne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public-key">Clé publique Stripe</Label>
                <Input
                  id="stripe-public-key"
                  value={settings.paymentMethods?.stripe?.publicKey || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentMethods: {
                        ...settings.paymentMethods,
                        stripe: {
                          publicKey: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="pk_test_..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PayPal</CardTitle>
              <CardDescription>
                Configuration PayPal pour les paiements en ligne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-client-id">Client ID PayPal</Label>
                <Input
                  id="paypal-client-id"
                  value={settings.paymentMethods?.paypal?.clientId || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentMethods: {
                        ...settings.paymentMethods,
                        paypal: {
                          clientId: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="AeA1QIZXiflr1_..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Info */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Entreprise</CardTitle>
              <CardDescription>
                Informations de l'entreprise propriétaire de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                <Input
                  id="companyName"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="Invoicia SAS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-line1">Adresse ligne 1</Label>
                <Input
                  id="address-line1"
                  value={settings.address?.line1 || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      address: {
                        ...settings.address,
                        line1: e.target.value,
                        postalCode: settings.address?.postalCode || '',
                        city: settings.address?.city || '',
                        country: settings.address?.country || '',
                      },
                    })
                  }
                  placeholder="123 Rue Example"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-line2">Adresse ligne 2 (optionnel)</Label>
                <Input
                  id="address-line2"
                  value={settings.address?.line2 || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      address: {
                        ...settings.address,
                        line1: settings.address?.line1 || '',
                        line2: e.target.value,
                        postalCode: settings.address?.postalCode || '',
                        city: settings.address?.city || '',
                        country: settings.address?.country || '',
                      },
                    })
                  }
                  placeholder="Bâtiment A"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-postalCode">Code postal</Label>
                  <Input
                    id="address-postalCode"
                    value={settings.address?.postalCode || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        address: {
                          ...settings.address,
                          line1: settings.address?.line1 || '',
                          postalCode: e.target.value,
                          city: settings.address?.city || '',
                          country: settings.address?.country || '',
                        },
                      })
                    }
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-city">Ville</Label>
                  <Input
                    id="address-city"
                    value={settings.address?.city || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        address: {
                          ...settings.address,
                          line1: settings.address?.line1 || '',
                          postalCode: settings.address?.postalCode || '',
                          city: e.target.value,
                          country: settings.address?.country || '',
                        },
                      })
                    }
                    placeholder="Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-country">Pays</Label>
                  <Input
                    id="address-country"
                    value={settings.address?.country || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        address: {
                          ...settings.address,
                          line1: settings.address?.line1 || '',
                          postalCode: settings.address?.postalCode || '',
                          city: settings.address?.city || '',
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="France"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Coordonnées de contact pour le support client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email support</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  placeholder="support@invoicia.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Téléphone support</Label>
                <Input
                  id="supportPhone"
                  value={settings.supportPhone || ''}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Template */}
        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Modèle de Facture</CardTitle>
              <CardDescription>
                Personnalisez l'apparence et les informations des factures générées pour les abonnements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label htmlFor="invoice-logo">Logo de l'entreprise</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="invoice-logo"
                    value={settings.invoiceLogoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, invoiceLogoUrl: e.target.value })}
                    placeholder="/uploads/logo.png"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL du logo à afficher sur les factures (chemin relatif depuis /uploads)
                </p>
              </div>

              {/* Informations entreprise pour factures */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations Entreprise (sur facture)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice-company-name">Nom de l'entreprise</Label>
                  <Input
                    id="invoice-company-name"
                    value={settings.invoiceCompanyName || ''}
                    onChange={(e) => setSettings({ ...settings, invoiceCompanyName: e.target.value })}
                    placeholder="Invoicia SAS"
                  />
                  <p className="text-xs text-muted-foreground">
                    Si vide, utilise le nom de l'entreprise général
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-address-line1">Adresse ligne 1</Label>
                  <Input
                    id="invoice-address-line1"
                    value={settings.invoiceCompanyAddress?.line1 || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        invoiceCompanyAddress: {
                          ...settings.invoiceCompanyAddress,
                          line1: e.target.value,
                          postalCode: settings.invoiceCompanyAddress?.postalCode || '',
                          city: settings.invoiceCompanyAddress?.city || '',
                          country: settings.invoiceCompanyAddress?.country || '',
                        },
                      })
                    }
                    placeholder="123 Rue Example"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-address-line2">Adresse ligne 2 (optionnel)</Label>
                  <Input
                    id="invoice-address-line2"
                    value={settings.invoiceCompanyAddress?.line2 || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        invoiceCompanyAddress: {
                          ...settings.invoiceCompanyAddress,
                          line1: settings.invoiceCompanyAddress?.line1 || '',
                          line2: e.target.value,
                          postalCode: settings.invoiceCompanyAddress?.postalCode || '',
                          city: settings.invoiceCompanyAddress?.city || '',
                          country: settings.invoiceCompanyAddress?.country || '',
                        },
                      })
                    }
                    placeholder="Bâtiment A"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-address-postalCode">Code postal</Label>
                    <Input
                      id="invoice-address-postalCode"
                      value={settings.invoiceCompanyAddress?.postalCode || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          invoiceCompanyAddress: {
                            ...settings.invoiceCompanyAddress,
                            line1: settings.invoiceCompanyAddress?.line1 || '',
                            postalCode: e.target.value,
                            city: settings.invoiceCompanyAddress?.city || '',
                            country: settings.invoiceCompanyAddress?.country || '',
                          },
                        })
                      }
                      placeholder="75001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-address-city">Ville</Label>
                    <Input
                      id="invoice-address-city"
                      value={settings.invoiceCompanyAddress?.city || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          invoiceCompanyAddress: {
                            ...settings.invoiceCompanyAddress,
                            line1: settings.invoiceCompanyAddress?.line1 || '',
                            postalCode: settings.invoiceCompanyAddress?.postalCode || '',
                            city: e.target.value,
                            country: settings.invoiceCompanyAddress?.country || '',
                          },
                        })
                      }
                      placeholder="Paris"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-address-country">Pays</Label>
                    <Input
                      id="invoice-address-country"
                      value={settings.invoiceCompanyAddress?.country || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          invoiceCompanyAddress: {
                            ...settings.invoiceCompanyAddress,
                            line1: settings.invoiceCompanyAddress?.line1 || '',
                            postalCode: settings.invoiceCompanyAddress?.postalCode || '',
                            city: settings.invoiceCompanyAddress?.city || '',
                            country: e.target.value,
                          },
                        })
                      }
                      placeholder="France"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-company-vat">Numéro de TVA intracommunautaire</Label>
                  <Input
                    id="invoice-company-vat"
                    value={settings.invoiceCompanyVat || ''}
                    onChange={(e) => setSettings({ ...settings, invoiceCompanyVat: e.target.value })}
                    placeholder="FR12345678901"
                  />
                </div>
              </div>

              {/* Pied de page */}
              <div className="space-y-2">
                <Label htmlFor="invoice-footer">Pied de page (Mentions légales)</Label>
                <textarea
                  id="invoice-footer"
                  className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                  value={settings.invoiceFooterText || ''}
                  onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                  placeholder="Capital social: 10 000€ - RCS Paris B 123 456 789 - SIRET: 123 456 789 00012"
                />
                <p className="text-xs text-muted-foreground">
                  Mentions légales, capital social, RCS, etc. (une ligne par mention)
                </p>
              </div>

              {/* Numérotation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Préfixe des numéros de facture</Label>
                  <Input
                    id="invoice-prefix"
                    value={settings.invoicePrefix || ''}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    placeholder="INV"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: {settings.invoicePrefix || 'INV'}-2024-001
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-color">Couleur principale</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="invoice-color"
                      type="color"
                      value={settings.invoiceColor || '#667eea'}
                      onChange={(e) => setSettings({ ...settings, invoiceColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.invoiceColor || '#667eea'}
                      onChange={(e) => setSettings({ ...settings, invoiceColor: e.target.value })}
                      placeholder="#667eea"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Couleur d'accentuation du template (en-tête, totaux)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
