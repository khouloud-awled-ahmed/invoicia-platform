import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Plus, Edit, CheckCircle2, XCircle, Clock, Ban, Settings } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  adminEmail: string;
  modules: string[];
  subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
  planType: 'CUSTOM' | 'STARTER' | 'BUSINESS' | 'PREMIUM';
  planId?: string;
  status: string;
  currentUsers: number;
  maxUsers: number;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
}

const AVAILABLE_MODULES = [
  { id: 'SALES', label: 'Ventes', description: 'Factures clients, avoirs' },
  { id: 'PURCHASES', label: 'Achats', description: 'Dépenses, fournisseurs' },
  { id: 'PROJECTS', label: 'Projets', description: 'Gestion de projets' },
  { id: 'HR', label: 'RH', description: 'Gestion RH et absences' },
  { id: 'ACCOUNTING', label: 'Comptabilité', description: 'Écritures comptables' },
];

export function PlatformTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    businessName: '',
    matriculeFiscal: '',
    adminEmail: '',
    adminName: '',
    adminPassword: '',
    modules: [] as string[],
    subscriptionStatus: 'PENDING_PAYMENT' as const,
    planType: 'CUSTOM' as const,
    planId: '',
    maxUsers: 10,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tenantsData, plansData] = await Promise.all([
        apiClient.getPlatformTenants(),
        apiClient.getSubscriptionPlans(),
      ]);
      setTenants(tenantsData);
      setPlans(plansData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!newTenant.name || !newTenant.adminEmail || !newTenant.matriculeFiscal) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const tenantData: any = {
        name: newTenant.name,
        businessName: newTenant.businessName || newTenant.name,
        matriculeFiscal: newTenant.matriculeFiscal,
        adminEmail: newTenant.adminEmail,
        adminName: newTenant.adminName || undefined,
        adminPassword: newTenant.adminPassword || undefined,
        modules: newTenant.modules || [],
        subscriptionStatus: newTenant.subscriptionStatus,
        planType: newTenant.planType,
        maxUsers: newTenant.maxUsers || 10,
      };

      // Ajouter planId seulement s'il n'est pas vide
      if (newTenant.planId && newTenant.planId !== 'none' && newTenant.planId !== '') {
        tenantData.planId = newTenant.planId;
      }

      console.log('Création du client avec les données:', tenantData);
      await apiClient.createPlatformTenant(tenantData);
      toast.success('Client créé avec succès');
      setIsCreateDialogOpen(false);
      setNewTenant({
        name: '',
        businessName: '',
        matriculeFiscal: '',
        adminEmail: '',
        adminName: '',
        adminPassword: '',
        modules: [],
        subscriptionStatus: 'PENDING_PAYMENT',
        planType: 'CUSTOM',
        planId: '',
        maxUsers: 10,
      });
      loadData();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur inconnue lors de la création';
      toast.error('Erreur lors de la création: ' + errorMessage);
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTenant = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!editingTenant) return;

    try {
      console.log('Mise à jour du client avec les données:', editingTenant);
    // Update basic info (name, email, planId)
await apiClient.updatePlatformTenant(editingTenant.id, {
  name: editingTenant.name,
  email: editingTenant.email,
  planId: editingTenant.planId,
});

// Update subscription status separately
await apiClient.updateTenantSubscriptionStatus(
  editingTenant.id,
  editingTenant.subscriptionStatus
);
      toast.success('Client mis à jour');
      setIsEditDialogOpen(false);
      setEditingTenant(null);
      loadData();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setNewTenant((prev) => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter((m) => m !== moduleId)
        : [...prev.modules, moduleId],
    }));
  };

  const handleUpdateModules = async (tenantId: string, modules: string[]) => {
    try {
      await apiClient.updateTenantModules(tenantId, modules);
      toast.success('Modules mis à jour');
      loadData();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleUpdateStatus = async (tenantId: string, status: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED') => {
    try {
      await apiClient.updateTenantSubscriptionStatus(tenantId, status);
      toast.success('Statut mis à jour');
      loadData();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      ACTIVE: { label: 'Actif', variant: 'default', icon: CheckCircle2 },
      PENDING_PAYMENT: { label: 'En attente', variant: 'secondary', icon: Clock },
      SUSPENDED: { label: 'Suspendu', variant: 'destructive', icon: Ban },
      TRIAL: { label: 'Essai', variant: 'outline', icon: Clock },
      CANCELLED: { label: 'Annulé', variant: 'destructive', icon: XCircle },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground mt-2">
            {tenants.length} entreprise(s) sur la plateforme
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau client</DialogTitle>
              <DialogDescription>
                Créez manuellement une entreprise et définissez ses modules autorisés
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'entreprise *</Label>
                  <Input
                    id="name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    placeholder="Ma Société SARL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nom commercial</Label>
                  <Input
                    id="businessName"
                    value={newTenant.businessName}
                    onChange={(e) => setNewTenant({ ...newTenant, businessName: e.target.value })}
                    placeholder="Ma Société"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matriculeFiscal">Matricule Fiscal *</Label>
                <Input
                  id="matriculeFiscal"
                  value={newTenant.matriculeFiscal}
                  onChange={(e) => setNewTenant({ ...newTenant, matriculeFiscal: e.target.value })}
                  placeholder="1234567/A/B/M/000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email administrateur *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={newTenant.adminEmail}
                    onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })}
                    placeholder="admin@entreprise.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nom administrateur</Label>
                  <Input
                    id="adminName"
                    value={newTenant.adminName}
                    onChange={(e) => setNewTenant({ ...newTenant, adminName: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Mot de passe admin (optionnel)</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={newTenant.adminPassword}
                  onChange={(e) => setNewTenant({ ...newTenant, adminPassword: e.target.value })}
                  placeholder="Laissé vide = mot de passe temporaire"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionStatus">Statut abonnement</Label>
                  <Select
                    value={newTenant.subscriptionStatus}
                    onValueChange={(value: any) => setNewTenant({ ...newTenant, subscriptionStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING_PAYMENT">En attente de paiement</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="TRIAL">Essai</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planId">Plan d'abonnement</Label>
                  <Select
                    value={newTenant.planId || 'none'}
                    onValueChange={(value) => setNewTenant({ ...newTenant, planId: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun plan (Personnalisé)</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price}€/mois
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modules autorisés</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_MODULES.map((module) => (
                    <div key={module.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={module.id}
                        checked={newTenant.modules.includes(module.id)}
                        onCheckedChange={() => handleToggleModule(module.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={module.id} className="font-medium cursor-pointer">
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
              <Button type="button" onClick={handleCreateTenant}>
                Créer le client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun client pour le moment
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email Admin</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.adminEmail}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tenant.modules && tenant.modules.length > 0 ? (
                          tenant.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {AVAILABLE_MODULES.find((m) => m.id === module)?.label || module}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucun module</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.planId ? (
                        <Badge variant="outline">
                          {plans.find((p) => p.id === tenant.planId)?.name || 'Plan inconnu'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{tenant.planType}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(tenant.subscriptionStatus)}</TableCell>
                    <TableCell>
                      {tenant.currentUsers} / {tenant.maxUsers}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTenant(tenant)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStatus = tenant.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                            handleUpdateStatus(tenant.id, newStatus);
                          }}
                        >
                          <Settings className="w-4 h-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations et le plan d'abonnement
            </DialogDescription>
          </DialogHeader>
          {editingTenant && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de l'entreprise</Label>
                <Input
                  id="edit-name"
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-adminEmail">Email administrateur</Label>
                <Input
                  id="edit-adminEmail"
                  type="email"
                  value={editingTenant.adminEmail}
                  onChange={(e) => setEditingTenant({ ...editingTenant, adminEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-planId">Plan d'abonnement</Label>
                <Select
                  value={editingTenant.planId || 'none'}
                  onValueChange={(value) => setEditingTenant({ ...editingTenant, planId: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun plan (Personnalisé)</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price}€/mois
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Statut abonnement</Label>
                <Select
                  value={editingTenant.subscriptionStatus}
                  onValueChange={(value: any) => setEditingTenant({ ...editingTenant, subscriptionStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_PAYMENT">En attente de paiement</SelectItem>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="TRIAL">Essai</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleUpdateTenant}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
