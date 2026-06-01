import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Package, Edit, X, Check } from "lucide-react";
import { MOCK_SUBSCRIPTION_PLANS, SubscriptionPlan } from "../lib/platform-data";

export function SubscriptionPlans() {
  const [plans, setPlans] = useState(MOCK_SUBSCRIPTION_PLANS);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setShowDialog(true);
  };

  const handleToggleStatus = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId 
        ? { ...p, status: p.status === "active" ? "inactive" : "active" as const }
        : p
    ));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight">Gestion des Packs d'Abonnement</h1>
          <p className="text-muted-foreground mt-1">
            Définissez et gérez les différents niveaux de service proposés
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Pack
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total des Packs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{plans.length}</div>
            <p className="text-xs text-muted-foreground">
              {plans.filter(p => p.status === "active").length} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sociétés Abonnées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {plans.reduce((sum, p) => sum + p.tenantsCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes formules confondues
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">MRR Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {plans.reduce((sum, p) => sum + (p.price * p.tenantsCount), 0).toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus récurrents mensuels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des Packs */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.status === "inactive" ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.status === "inactive" && (
                      <Badge variant="secondary" className="text-xs">Inactif</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prix */}
              <div>
                <div className="text-3xl">{plan.price} €</div>
                <p className="text-sm text-muted-foreground">/mois par société</p>
              </div>

              {/* Statistiques */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sociétés</span>
                  <span>{plan.tenantsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MRR</span>
                  <span className="text-green-600">{(plan.price * plan.tenantsCount).toLocaleString()} €</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max utilisateurs</span>
                  <span>{plan.maxUsers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max factures/mois</span>
                  <span>{plan.maxInvoicesPerMonth}</span>
                </div>
              </div>

              {/* Modules */}
              <div className="pt-2 border-t">
                <p className="text-sm mb-2">Modules inclus:</p>
                <div className="flex flex-wrap gap-1">
                  {plan.modules.slice(0, 4).map((module) => (
                    <Badge key={module} variant="secondary" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                  {plan.modules.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{plan.modules.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant={plan.status === "active" ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleStatus(plan.id)}
                >
                  {plan.status === "active" ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Vue Détaillée</CardTitle>
          <CardDescription>Comparaison complète des fonctionnalités</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pack</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Sociétés</TableHead>
                <TableHead>Max Users</TableHead>
                <TableHead>Max Factures</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div>{plan.name}</div>
                      <div className="text-xs text-muted-foreground">{plan.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{plan.price} €/mois</TableCell>
                  <TableCell>{plan.tenantsCount}</TableCell>
                  <TableCell>{plan.maxUsers}</TableCell>
                  <TableCell>{plan.maxInvoicesPerMonth}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.modules.length} modules</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                      {plan.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Modifier le Pack" : "Créer un Nouveau Pack"}
            </DialogTitle>
            <DialogDescription>
              Définissez les caractéristiques et limitations du pack d'abonnement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Pack *</Label>
                <Input
                  id="name"
                  placeholder="Pack Business"
                  defaultValue={editingPlan?.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix Mensuel (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="99"
                  defaultValue={editingPlan?.price}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Pour les entreprises en croissance..."
                defaultValue={editingPlan?.description}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Utilisateurs</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  placeholder="25"
                  defaultValue={editingPlan?.maxUsers}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxInvoices">Max Factures/Mois</Label>
                <Input
                  id="maxInvoices"
                  type="number"
                  placeholder="200"
                  defaultValue={editingPlan?.maxInvoicesPerMonth}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modules Inclus</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                {["dashboard", "invoices", "clients", "cra", "hr", "ged", "payments", "banking", "suppliers", "monitor"].map((module) => (
                  <div key={module} className="flex items-center space-x-2">
                    <Switch 
                      id={`module-${module}`}
                      defaultChecked={editingPlan?.modules.includes(module)}
                    />
                    <Label htmlFor={`module-${module}`} className="text-sm cursor-pointer">
                      {module}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="status">Pack Actif</Label>
                <p className="text-sm text-muted-foreground">
                  Les packs inactifs ne sont pas proposés aux nouveaux clients
                </p>
              </div>
              <Switch 
                id="status"
                defaultChecked={editingPlan?.status === "active"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              {editingPlan ? "Enregistrer" : "Créer le Pack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}