import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, Euro, Loader2 } from 'lucide-react';

interface PlanSelectionStepProps {
  selectedPlan: any;
  onSelect: (plan: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const AVAILABLE_MODULES = [
  { id: 'SALES', label: 'Ventes', description: 'Factures clients, avoirs' },
  { id: 'PURCHASES', label: 'Achats', description: 'Dépenses, fournisseurs' },
  { id: 'PROJECTS', label: 'Projets', description: 'Gestion de projets' },
  { id: 'HR', label: 'RH', description: 'Gestion RH et absences' },
  { id: 'ACCOUNTING', label: 'Comptabilité', description: 'Écritures comptables' },
];

export function PlanSelectionStep({ selectedPlan, onSelect, onNext, onPrevious }: PlanSelectionStepProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getActiveSubscriptionPlans();
      setPlans(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des plans: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choisissez votre plan</h2>
        <p className="text-muted-foreground">
          Sélectionnez le plan qui correspond à vos besoins
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan?.id === plan.id
                ? 'ring-2 ring-purple-600 border-purple-600'
                : 'hover:border-purple-300'
            }`}
            onClick={() => onSelect(plan)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {selectedPlan?.id === plan.id && (
                  <Check className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <CardDescription>{plan.description || ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <Euro className="w-5 h-5" />
                  <span className="text-muted-foreground">/mois</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium">Modules inclus :</p>
                <div className="flex flex-wrap gap-1">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature: string) => {
                      const module = AVAILABLE_MODULES.find((m) => m.id === feature);
                      return (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {module?.label || feature}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground">Aucun module</span>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Jusqu'à {plan.maxUsers} utilisateurs</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun plan disponible pour le moment
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={onNext} disabled={!selectedPlan}>
          Continuer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
