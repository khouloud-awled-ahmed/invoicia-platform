import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Euro, CheckCircle2, XCircle } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  maxUsers: number;
  isActive: boolean;
}

const AVAILABLE_MODULES = [
  { id: 'SALES', label: 'Ventes', description: 'Factures clients, avoirs' },
  { id: 'PURCHASES', label: 'Achats', description: 'Dépenses, fournisseurs' },
  { id: 'PROJECTS', label: 'Projets', description: 'Gestion de projets' },
  { id: 'HR', label: 'RH', description: 'Gestion RH et absences' },
  { id: 'ACCOUNTING', label: 'Comptabilité', description: 'Écritures comptables' },
];

export function PlatformPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'EUR',
    features: [] as string[],
    maxUsers: 10,
    isActive: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getSubscriptionPlans();
      setPlans(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des plans: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!newPlan.name || newPlan.price < 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      console.log('Création du plan avec les données:', newPlan);
      await apiClient.createSubscriptionPlan(newPlan);
      toast.success('Plan créé avec succès');
      setIsCreateDialogOpen(false);
      setNewPlan({
        name: '',
        description: '',
        price: 0,
        currency: 'EUR',
        features: [],
        maxUsers: 10,
        isActive: true,
      });
      loadPlans();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast.error('Erreur lors de la création: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!editingPlan) return;

    try {
      console.log('Mise à jour du plan avec les données:', editingPlan);
      await apiClient.updateSubscriptionPlan(editingPlan.id, {
        name: editingPlan.name,
        description: editingPlan.description,
        price: editingPlan.price,
        currency: editingPlan.currency,
        features: editingPlan.features,
        maxUsers: editingPlan.maxUsers,
        isActive: editingPlan.isActive,
      });
      toast.success('Plan mis à jour');
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      return;
    }

    try {
      await apiClient.deleteSubscriptionPlan(id);
      toast.success('Plan supprimé');
      loadPlans();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleToggleModule = (moduleId: string, isEdit: boolean = false) => {
    if (isEdit && editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: editingPlan.features.includes(moduleId)
          ? editingPlan.features.filter((m) => m !== moduleId)
          : [...editingPlan.features, moduleId],
      });
    } else {
      setNewPlan((prev) => ({
        ...prev,
        features: prev.features.includes(moduleId)
          ? prev.features.filter((m) => m !== moduleId)
          : [...prev.features, moduleId],
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Plans</h1>
          <p className="text-muted-foreground mt-2">
            {plans.length} plan(s) d'abonnement configuré(s)
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Créer un Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau plan</DialogTitle>
              <DialogDescription>
                Définissez les modules inclus et le prix du plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Nom du plan *</Label>
                <Input
                  id="plan-name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Starter, Business, Premium..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-description">Description</Label>
                <Input
                  id="plan-description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Description du plan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-price">Prix (€) *</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-maxUsers">Utilisateurs max</Label>
                  <Input
                    id="plan-maxUsers"
                    type="number"
                    min="1"
                    value={newPlan.maxUsers}
                    onChange={(e) => setNewPlan({ ...newPlan, maxUsers: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modules inclus</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_MODULES.map((module) => (
                    <div key={module.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`new-${module.id}`}
                        checked={newPlan.features.includes(module.id)}
                        onCheckedChange={() => handleToggleModule(module.id, false)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`new-${module.id}`} className="font-medium cursor-pointer">
                          {module.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleCreatePlan}>
                Créer le plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun plan configuré
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Utilisateurs max</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        <span className="font-semibold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">/mois</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {AVAILABLE_MODULES.find((m) => m.id === feature)?.label || feature}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucun module</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{plan.maxUsers}</TableCell>
                    <TableCell>
                      {plan.isActive ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le plan</DialogTitle>
            <DialogDescription>
              Modifiez les informations et les modules du plan
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-plan-name">Nom du plan</Label>
                <Input
                  id="edit-plan-name"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan-description">Description</Label>
                <Input
                  id="edit-plan-description"
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-price">Prix (€)</Label>
                  <Input
                    id="edit-plan-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-maxUsers">Utilisateurs max</Label>
                  <Input
                    id="edit-plan-maxUsers"
                    type="number"
                    min="1"
                    value={editingPlan.maxUsers}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modules inclus</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_MODULES.map((module) => (
                    <div key={module.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`edit-${module.id}`}
                        checked={editingPlan.features.includes(module.id)}
                        onCheckedChange={() => handleToggleModule(module.id, true)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-${module.id}`} className="font-medium cursor-pointer">
                          {module.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-plan-active"
                  checked={editingPlan.isActive}
                  onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, isActive: checked as boolean })}
                />
                <Label htmlFor="edit-plan-active" className="cursor-pointer">
                  Plan actif
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleUpdatePlan}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
