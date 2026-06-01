import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { apiClient } from '../lib/api-client-backend';
import { toast } from 'sonner';
import { CreditCard, Building2, Mail, FileText, Download, Receipt } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

interface PaymentMethod {
  type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
  enabled: boolean;
  details: Record<string, any>;
}

export function PaymentSettingsPage() {
  const [tenantId, setTenantId] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'IBAN', enabled: false, details: {} },
    { type: 'STRIPE', enabled: false, details: {} },
    { type: 'PAYPAL', enabled: false, details: {} },
    { type: 'CHECK', enabled: false, details: {} },
  ]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  useEffect(() => {
    // Récupérer le tenantId depuis localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.tenantId) {
          setTenantId(user.tenantId);
          loadPaymentMethods(user.tenantId);
          loadInvoices();
        }
      } catch (e) {
        console.error('Erreur lecture user:', e);
      }
    }
  }, []);

  const loadPaymentMethods = async (id: string) => {
    try {
      setIsLoading(true);
      const methods = await apiClient.getPaymentMethods(id);
      
      // Fusionner avec les méthodes par défaut
      const defaultMethods = [
        { type: 'IBAN' as const, enabled: false, details: {} },
        { type: 'STRIPE' as const, enabled: false, details: {} },
        { type: 'PAYPAL' as const, enabled: false, details: {} },
        { type: 'CHECK' as const, enabled: false, details: {} },
      ];
      
      const merged = defaultMethods.map(defaultMethod => {
        const existing = methods.find(m => m.type === defaultMethod.type);
        return existing || defaultMethod;
      });
      
      setPaymentMethods(merged);
    } catch (error: any) {
      toast.error('Erreur lors du chargement: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tenantId) {
      toast.error('Tenant ID manquant');
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updatePaymentMethods(tenantId, paymentMethods);
      toast.success('Modes de paiement mis à jour avec succès');
    } catch (error: any) {
      toast.error('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const data = await apiClient.getMyInvoices();
      setInvoices(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des factures: ' + error.message);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await apiClient.downloadPlatformInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Facture téléchargée');
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      DRAFT: { label: 'Brouillon', variant: 'outline' },
      ISSUED: { label: 'Émise', variant: 'default' },
      PAID: { label: 'Payée', variant: 'secondary' },
      CANCELLED: { label: 'Annulée', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const updateMethod = (index: number, updates: Partial<PaymentMethod>) => {
    const updated = [...paymentMethods];
    updated[index] = { ...updated[index], ...updates };
    setPaymentMethods(updated);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'IBAN':
        return <Building2 className="w-5 h-5" />;
      case 'STRIPE':
        return <CreditCard className="w-5 h-5" />;
      case 'PAYPAL':
        return <Mail className="w-5 h-5" />;
      case 'CHECK':
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Facturation</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos modes de paiement et consultez vos factures d'abonnement
        </p>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Modes de Paiement
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="w-4 h-4 mr-2" />
            Historique de Facturation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
        {/* IBAN */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMethodIcon('IBAN')}
                <div>
                  <CardTitle>Virement Bancaire</CardTitle>
                  <CardDescription>IBAN et BIC pour les virements</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentMethods[0].enabled}
                onCheckedChange={(checked) => updateMethod(0, { enabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentMethods[0].enabled && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                    value={paymentMethods[0].details.iban || ''}
                    onChange={(e) =>
                      updateMethod(0, {
                        details: { ...paymentMethods[0].details, iban: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bic">BIC</Label>
                  <Input
                    id="bic"
                    placeholder="ABCDEFGH"
                    value={paymentMethods[0].details.bic || ''}
                    onChange={(e) =>
                      updateMethod(0, {
                        details: { ...paymentMethods[0].details, bic: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Stripe */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMethodIcon('STRIPE')}
                <div>
                  <CardTitle>Stripe</CardTitle>
                  <CardDescription>Paiement par carte bancaire</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentMethods[1].enabled}
                onCheckedChange={(checked) => updateMethod(1, { enabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentMethods[1].enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public-key">Clé publique Stripe</Label>
                <Input
                  id="stripe-public-key"
                  placeholder="pk_live_..."
                  value={paymentMethods[1].details.publicKey || ''}
                  onChange={(e) =>
                    updateMethod(1, {
                      details: { ...paymentMethods[1].details, publicKey: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* PayPal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMethodIcon('PAYPAL')}
                <div>
                  <CardTitle>PayPal</CardTitle>
                  <CardDescription>Paiement via PayPal</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentMethods[2].enabled}
                onCheckedChange={(checked) => updateMethod(2, { enabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentMethods[2].enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-email">Email PayPal</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  placeholder="paiement@entreprise.com"
                  value={paymentMethods[2].details.email || ''}
                  onChange={(e) =>
                    updateMethod(2, {
                      details: { ...paymentMethods[2].details, email: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Chèque */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMethodIcon('CHECK')}
                <div>
                  <CardTitle>Chèque</CardTitle>
                  <CardDescription>Paiement par chèque</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentMethods[3].enabled}
                onCheckedChange={(checked) => updateMethod(3, { enabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentMethods[3].enabled && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-order">Ordre</Label>
                  <Input
                    id="check-order"
                    placeholder="À l'ordre de..."
                    value={paymentMethods[3].details.order || ''}
                    onChange={(e) =>
                      updateMethod(3, {
                        details: { ...paymentMethods[3].details, order: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-address">Adresse</Label>
                  <Input
                    id="check-address"
                    placeholder="Adresse d'envoi"
                    value={paymentMethods[3].details.address || ''}
                    onChange={(e) =>
                      updateMethod(3, {
                        details: { ...paymentMethods[3].details, address: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique de Facturation</CardTitle>
              <CardDescription>
                Consultez et téléchargez toutes vos factures d'abonnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des factures...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune facture pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice._id || invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <strong>Plan:</strong> {invoice.planName || 'N/A'}
                          </p>
                          <p>
                            <strong>Montant:</strong> {invoice.totalAmount?.toFixed(2) || invoice.amount?.toFixed(2)} {invoice.currency || 'EUR'}
                          </p>
                          <p>
                            <strong>Date d'émission:</strong>{' '}
                            {new Date(invoice.issuedAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          {invoice.paidAt && (
                            <p>
                              <strong>Date de paiement:</strong>{' '}
                              {new Date(invoice.paidAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {invoice.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice._id || invoice.id, invoice.invoiceNumber)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
