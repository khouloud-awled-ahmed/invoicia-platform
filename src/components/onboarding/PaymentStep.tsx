import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Building2, Euro, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentStepProps {
  plan: any;
  paymentMethod: 'CARD' | 'TRANSFER';
  promoCode: string;
  onPaymentMethodChange: (method: 'CARD' | 'TRANSFER') => void;
  onPromoCodeChange: (code: string) => void;
  onComplete: () => void;
  onPrevious: () => void;
}

export function PaymentStep({
  plan,
  paymentMethod,
  promoCode,
  onPaymentMethodChange,
  onPromoCodeChange,
  onComplete,
  onPrevious,
}: PaymentStepProps) {
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(plan?.price || 0);

  useEffect(() => {
    loadPlatformSettings();
    if (plan) {
      setFinalPrice(plan.price);
    }
  }, [plan]);

  const loadPlatformSettings = async () => {
    try {
      const settings = await apiClient.getPlatformSettings();
      setPlatformSettings(settings);
    } catch (error: any) {
      console.error('Erreur lors du chargement des settings:', error);
    }
  };

  const handleValidatePromoCode = async () => {
    if (!promoCode || !plan) return;

    try {
      setValidatingPromo(true);
      const result = await apiClient.validatePromoCode(promoCode, plan.id);
      if (result.valid) {
        setPromoDiscount(result);
        setFinalPrice(result.finalPrice);
        toast.success('Code promo appliqué !');
      } else {
        toast.error(result.message || 'Code promo invalide');
        setPromoDiscount(null);
        setFinalPrice(plan.price);
      }
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
      setPromoDiscount(null);
      setFinalPrice(plan.price);
    } finally {
      setValidatingPromo(false);
    }
  };

  if (!plan) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Veuillez sélectionner un plan d'abord</p>
      </div>
    );
  }

  const trialDays = platformSettings?.defaultTrialDaysForTransfer || 7;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paiement</h2>
        <p className="text-muted-foreground">
          Choisissez votre méthode de paiement
        </p>
      </div>

      {/* Résumé de la commande */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Plan : {plan.name}</span>
            <span className="font-semibold">{plan.price}€</span>
          </div>
          {promoDiscount && (
            <div className="flex justify-between text-green-600">
              <span>Code promo ({promoDiscount.discountType === 'PERCENT' ? `${promoDiscount.value}%` : `${promoDiscount.value}€`})</span>
              <span>-{promoDiscount.discount}€</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>{finalPrice.toFixed(2)}€</span>
          </div>
        </CardContent>
      </Card>

      {/* Code promo */}
      <Card>
        <CardHeader>
          <CardTitle>Code promo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => {
                onPromoCodeChange(e.target.value.toUpperCase());
                if (promoDiscount) {
                  setPromoDiscount(null);
                  setFinalPrice(plan.price);
                }
              }}
              placeholder="ENTREZ-VOTRE-CODE"
              className="uppercase"
            />
            <Button
              onClick={handleValidatePromoCode}
              disabled={validatingPromo || !promoCode}
              variant="outline"
            >
              {validatingPromo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Appliquer'
              )}
            </Button>
          </div>
          {promoDiscount && (
            <div className="mt-2 flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Code promo appliqué</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Méthodes de paiement */}
      <Tabs value={paymentMethod} onValueChange={(value) => onPaymentMethodChange(value as 'CARD' | 'TRANSFER')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="CARD">
            <CreditCard className="w-4 h-4 mr-2" />
            Carte Bancaire
          </TabsTrigger>
          <TabsTrigger value="TRANSFER">
            <Building2 className="w-4 h-4 mr-2" />
            Virement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="CARD" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paiement par carte</CardTitle>
              <CardDescription>
                Paiement sécurisé via Stripe (simulation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground text-center">
                    🚧 Mode simulation activé
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Le paiement sera simulé. En production, intégrez Stripe Elements ici.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Votre abonnement sera activé immédiatement après le paiement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="TRANSFER" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paiement par virement</CardTitle>
              <CardDescription>
                Accès immédiat pendant {trialDays} jours le temps de valider votre virement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformSettings?.paymentMethods?.iban ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">IBAN</Label>
                    <p className="text-lg font-mono bg-gray-50 p-2 rounded">
                      {platformSettings.paymentMethods.iban.iban}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BIC</Label>
                    <p className="text-lg font-mono bg-gray-50 p-2 rounded">
                      {platformSettings.paymentMethods.iban.bic}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Titulaire</Label>
                    <p className="text-lg bg-gray-50 p-2 rounded">
                      {platformSettings.paymentMethods.iban.accountHolder}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Banque</Label>
                    <p className="text-lg bg-gray-50 p-2 rounded">
                      {platformSettings.paymentMethods.iban.bankName}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Les coordonnées bancaires ne sont pas encore configurées. Contactez le support.
                </p>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Période de grâce :</strong> Vous aurez accès à toutes les fonctionnalités pendant{' '}
                  {trialDays} jours. Une fois votre virement validé par notre équipe, votre abonnement sera activé définitivement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={onComplete}>
          Finaliser l'abonnement
        </Button>
      </div>
    </div>
  );
}
