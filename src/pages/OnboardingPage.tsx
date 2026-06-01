import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { apiClient } from '../lib/api-client-backend';
import { toast } from 'sonner';
import { CheckCircle2, Mail, Phone, Building2, CreditCard, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { VerificationStep } from '../components/onboarding/VerificationStep';
import { CompanyInfoStep } from '../components/onboarding/CompanyInfoStep';
import { PlanSelectionStep } from '../components/onboarding/PlanSelectionStep';
import { PaymentStep } from '../components/onboarding/PaymentStep';

const STEPS = [
  { id: 'verification', label: 'Vérification', icon: CheckCircle2 },
  { id: 'company', label: 'Informations', icon: Building2 },
  { id: 'plan', label: 'Plan', icon: CreditCard },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationSettings, setVerificationSettings] = useState({
    requireEmailVerification: true,
    requirePhoneVerification: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState({
    emailVerified: false,
    phoneVerified: false,
    phone: '',
    companyInfo: {
      address: {
        line1: '',
        line2: '',
        postalCode: '',
        city: '',
        country: 'France',
      },
      vatNumber: '',
      siret: '',
    },
    selectedPlan: null as any,
    paymentMethod: 'CARD' as 'CARD' | 'TRANSFER',
    promoCode: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await apiClient.getVerificationSettings();
      setVerificationSettings(settings);
    } catch (error: any) {
      console.error('Erreur lors du chargement des settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      if (!onboardingData.selectedPlan) {
        toast.error('Veuillez sélectionner un plan');
        return;
      }

      await apiClient.subscribe({
        planId: onboardingData.selectedPlan.id,
        paymentMethod: onboardingData.paymentMethod,
        promoCode: onboardingData.promoCode || undefined,
        billingDetails: onboardingData.companyInfo,
      });

      toast.success('Abonnement activé avec succès !');
      // Rediriger vers le dashboard
      window.location.href = '/';
    } catch (error: any) {
      toast.error('Erreur lors de l\'abonnement: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Déterminer si on doit afficher l'étape de vérification
  const showVerificationStep = verificationSettings.requireEmailVerification || verificationSettings.requirePhoneVerification;

  const actualSteps = showVerificationStep ? STEPS : STEPS.filter(s => s.id !== 'verification');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Configuration de votre compte</h1>
          <p className="text-muted-foreground">
            Complétez ces étapes pour activer votre abonnement
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {actualSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-sm ${isActive ? 'font-semibold' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < actualSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {showVerificationStep && currentStep === 0 && (
              <VerificationStep
                settings={verificationSettings}
                data={onboardingData}
                onUpdate={(data) => setOnboardingData({ ...onboardingData, ...data })}
                onComplete={handleNext}
              />
            )}

            {(!showVerificationStep && currentStep === 0) || (showVerificationStep && currentStep === 1) ? (
              <CompanyInfoStep
                data={onboardingData.companyInfo}
                onUpdate={(companyInfo) =>
                  setOnboardingData({ ...onboardingData, companyInfo })
                }
                onNext={handleNext}
                onPrevious={showVerificationStep ? handlePrevious : undefined}
              />
            ) : null}

            {(!showVerificationStep && currentStep === 1) || (showVerificationStep && currentStep === 2) ? (
              <PlanSelectionStep
                selectedPlan={onboardingData.selectedPlan}
                onSelect={(plan) => setOnboardingData({ ...onboardingData, selectedPlan: plan })}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            ) : null}

            {(!showVerificationStep && currentStep === 2) || (showVerificationStep && currentStep === 3) ? (
              <PaymentStep
                plan={onboardingData.selectedPlan}
                paymentMethod={onboardingData.paymentMethod}
                promoCode={onboardingData.promoCode}
                onPaymentMethodChange={(method) =>
                  setOnboardingData({ ...onboardingData, paymentMethod: method })
                }
                onPromoCodeChange={(code) =>
                  setOnboardingData({ ...onboardingData, promoCode: code })
                }
                onComplete={handleComplete}
                onPrevious={handlePrevious}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
