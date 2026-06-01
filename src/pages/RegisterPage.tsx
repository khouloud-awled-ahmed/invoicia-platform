import { useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { apiClient } from '../lib/api-client-backend';
import { toast } from 'sonner';
import { CheckCircle2, Euro } from 'lucide-react';

const MODULES_PRICING = [
  { id: 'SALES', label: 'Ventes', description: 'Factures clients, avoirs, gestion commerciale', price: 10 },
  { id: 'PURCHASES', label: 'Achats', description: 'Dépenses, fournisseurs, gestion des achats', price: 5 },
  { id: 'PROJECTS', label: 'Projets', description: 'Gestion de projets et CRA', price: 8 },
  { id: 'HR', label: 'RH', description: 'Gestion RH, absences, paie', price: 12 },
  { id: 'ACCOUNTING', label: 'Comptabilité', description: 'Écritures comptables, bilan', price: 15 },
];

const BASE_PRICE = 10;

export function RegisterPage() {
  const navigate = (path: string) => {
    window.location.href = path;
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotalPrice = () => {
    const modulesPrice = selectedModules.reduce((total, moduleId) => {
      const module = MODULES_PRICING.find((m) => m.id === moduleId);
      return total + (module?.price || 0);
    }, 0);
    return BASE_PRICE + modulesPrice;
  };

  const handleToggleModule = useCallback((moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        selectedModules: selectedModules,
      });
      
      if (result.access_token) {
        toast.success('Inscription réussie ! Votre entreprise a été créée.');
        
        // Recharger la page pour mettre à jour l'état d'authentification
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Choisissez vos modules et créez votre entreprise sur Invocia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Votre nom *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 caractères
                </p>
              </div>
            </div>

            {/* Informations entreprise */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations entreprise</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Ma Société SARL"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Sélection des modules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Modules disponibles</h3>
                <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                  <Euro className="w-5 h-5" />
                  {calculateTotalPrice()}€/mois
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES_PRICING.map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedModules.includes(module.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={selectedModules.includes(module.id)}
                          onCheckedChange={() => {
                            handleToggleModule(module.id);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label 
                              htmlFor={`module-${module.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {module.label}
                            </Label>
                            <span className="text-sm font-semibold text-blue-600">
                              +{module.price}€/mois
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      {selectedModules.includes(module.id) && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Prix de base</span>
                  <span className="font-semibold">{BASE_PRICE}€/mois</span>
                </div>
                {selectedModules.length > 0 && (
                  <>
                    <div className="mt-2 pt-2 border-t">
                      {selectedModules.map((moduleId) => {
                        const module = MODULES_PRICING.find((m) => m.id === moduleId);
                        return (
                          <div key={moduleId} className="flex items-center justify-between text-sm">
                            <span>{module?.label}</span>
                            <span>+{module?.price}€/mois</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">{calculateTotalPrice()}€/mois</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer mon compte'}
            </Button>
            <div className="text-center text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className="text-primary hover:underline"
              >
                Déjà un compte ? Se connecter
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
