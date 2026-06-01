import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Mail, Phone, User, Building2, Loader2, Key, Badge, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

export interface Intervenant {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: 'salarie' | 'externe';
  employeeId?: string;
  supplierId?: string;
  supplierName?: string;
  position?: string;
  status: 'active' | 'inactive';
  canSubmitCRA: boolean;
  craAccessToken?: string;
}

export function IntervenantsManagement() {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIntervenant, setSelectedIntervenant] = useState<Intervenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const [intervenantForm, setIntervenantForm] = useState<Partial<Intervenant>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "salarie",
    employeeId: "",
    supplierId: "",
    position: "",
    status: "active",
    canSubmitCRA: false,
  });

  useEffect(() => {
    loadIntervenants();
    loadEmployees();
    loadSuppliers();
  }, []);

  const loadIntervenants = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (filterType !== "all") {
        filters.type = filterType;
      }
      const data = await apiClient.getIntervenants(filters);
      const normalized = data.map((item: any) => ({
        ...item,
        id: item._id || item.id,
      }));
      setIntervenants(normalized);
    } catch (error) {
      console.error("Erreur lors du chargement des intervenants:", error);
      toast.error("Erreur lors du chargement des intervenants");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await apiClient.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await apiClient.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs:", error);
    }
  };

  useEffect(() => {
    loadIntervenants();
  }, [filterType]);

  const handleCreate = () => {
    setSelectedIntervenant(null);
    setIntervenantForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      type: "salarie",
      employeeId: "",
      supplierId: "",
      position: "",
      status: "active",
      canSubmitCRA: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (intervenant: Intervenant) => {
    setSelectedIntervenant(intervenant);
    setIntervenantForm({
      firstName: intervenant.firstName,
      lastName: intervenant.lastName,
      email: intervenant.email,
      phone: intervenant.phone || "",
      type: intervenant.type,
      employeeId: intervenant.employeeId || "",
      supplierId: intervenant.supplierId || "",
      position: intervenant.position || "",
      status: intervenant.status,
      canSubmitCRA: intervenant.canSubmitCRA,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!intervenantForm.firstName || !intervenantForm.lastName || !intervenantForm.email) {
      toast.error("Le prénom, nom et email sont requis");
      return;
    }

    if (intervenantForm.type === "salarie" && !intervenantForm.employeeId) {
      toast.error("Vous devez sélectionner un employé pour un intervenant salarié");
      return;
    }

    if (intervenantForm.type === "externe" && !intervenantForm.supplierId) {
      toast.error("Vous devez sélectionner un fournisseur pour un intervenant externe");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave: any = {
        firstName: intervenantForm.firstName,
        lastName: intervenantForm.lastName,
        email: intervenantForm.email,
        phone: intervenantForm.phone || undefined,
        type: intervenantForm.type,
        position: intervenantForm.position || undefined,
        status: intervenantForm.status,
        canSubmitCRA: intervenantForm.canSubmitCRA || false,
      };

      if (intervenantForm.type === "salarie") {
        dataToSave.employeeId = intervenantForm.employeeId;
      } else {
        dataToSave.supplierId = intervenantForm.supplierId;
        const supplier = suppliers.find(s => (s._id || s.id) === intervenantForm.supplierId);
        if (supplier) {
          dataToSave.supplierName = supplier.name;
        }
      }

      if (selectedIntervenant?.id) {
        await apiClient.updateIntervenant(selectedIntervenant.id, dataToSave);
        toast.success("Intervenant mis à jour avec succès");
      } else {
        await apiClient.createIntervenant(dataToSave);
        toast.success("Intervenant créé avec succès");
      }
      setIsDialogOpen(false);
      loadIntervenants();
      loadSuppliers(); // Recharger pour mettre à jour les intervenants rattachés
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de l'intervenant");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (intervenant: Intervenant) => {
    setSelectedIntervenant(intervenant);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedIntervenant?.id) return;

    try {
      await apiClient.deleteIntervenant(selectedIntervenant.id);
      toast.success("Intervenant supprimé avec succès");
      setIsDeleteDialogOpen(false);
      loadIntervenants();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'intervenant");
    }
  };

  const handleGenerateToken = async (intervenant: Intervenant) => {
    if (!intervenant.id) return;

    setIsGeneratingToken(true);
    try {
      const result = await apiClient.generateCRAToken(intervenant.id);
      toast.success("Token généré avec succès", {
        description: `Token: ${result.token}`,
      });
      loadIntervenants();
    } catch (error) {
      console.error("Erreur lors de la génération du token:", error);
      toast.error("Erreur lors de la génération du token");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const filteredIntervenants = intervenants.filter((intervenant) =>
    intervenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des intervenants</h1>
          <p className="text-muted-foreground">
            Gérez les intervenants (salariés ou externes) pour les CRA
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel intervenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un intervenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="salarie">Salariés</SelectItem>
                <SelectItem value="externe">Externes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intervenant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rattachement</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Accès CRA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntervenants.map((intervenant) => (
                    <TableRow key={intervenant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {intervenant.firstName} {intervenant.lastName}
                          </p>
                          {intervenant.position && (
                            <p className="text-sm text-muted-foreground">{intervenant.position}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={intervenant.type === "salarie" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}>
                          {intervenant.type === "salarie" ? "Salarié" : "Externe"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {intervenant.type === "salarie" ? (
                          <span className="text-sm text-muted-foreground">Employé interne</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {intervenant.supplierName || "Fournisseur"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{intervenant.email}</span>
                          </div>
                          {intervenant.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{intervenant.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {intervenant.canSubmitCRA ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Actif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Inactif</span>
                            </>
                          )}
                        </div>
                        {intervenant.craAccessToken && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Token: ...{intervenant.craAccessToken.slice(-8)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {intervenant.type === "externe" && !intervenant.craAccessToken && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateToken(intervenant)}
                              disabled={isGeneratingToken}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Token CRA
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(intervenant)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(intervenant)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredIntervenants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || filterType !== "all"
                    ? "Aucun intervenant trouvé"
                    : "Aucun intervenant. Créez-en un pour commencer."}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedIntervenant ? "Modifier l'intervenant" : "Nouvel intervenant"}
            </DialogTitle>
            <DialogDescription>
              {selectedIntervenant
                ? "Modifiez les informations de l'intervenant"
                : "Ajoutez un nouvel intervenant (salarié ou externe)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={intervenantForm.firstName}
                  onChange={(e) => setIntervenantForm({ ...intervenantForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={intervenantForm.lastName}
                  onChange={(e) => setIntervenantForm({ ...intervenantForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={intervenantForm.email}
                  onChange={(e) => setIntervenantForm({ ...intervenantForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={intervenantForm.phone}
                  onChange={(e) => setIntervenantForm({ ...intervenantForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={intervenantForm.type}
                onValueChange={(value: 'salarie' | 'externe') => {
                  setIntervenantForm({
                    ...intervenantForm,
                    type: value,
                    employeeId: value === "salarie" ? intervenantForm.employeeId : undefined,
                    supplierId: value === "externe" ? intervenantForm.supplierId : undefined,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salarie">Salarié</SelectItem>
                  <SelectItem value="externe">Externe (Fournisseur)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {intervenantForm.type === "salarie" && (
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employé *</Label>
                <Select
                  value={intervenantForm.employeeId}
                  onValueChange={(value) => setIntervenantForm({ ...intervenantForm, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {intervenantForm.type === "externe" && (
              <div className="space-y-2">
                <Label htmlFor="supplierId">Fournisseur *</Label>
                <Select
                  value={intervenantForm.supplierId}
                  onValueChange={(value) => setIntervenantForm({ ...intervenantForm, supplierId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup._id || sup.id} value={sup._id || sup.id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  value={intervenantForm.position}
                  onChange={(e) => setIntervenantForm({ ...intervenantForm, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={intervenantForm.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setIntervenantForm({ ...intervenantForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="canSubmitCRA"
                  checked={intervenantForm.canSubmitCRA}
                  onChange={(e) =>
                    setIntervenantForm({ ...intervenantForm, canSubmitCRA: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="canSubmitCRA" className="cursor-pointer">
                  Permettre la soumission de CRA
                </Label>
              </div>
              {intervenantForm.type === "externe" && intervenantForm.canSubmitCRA && (
                <p className="text-xs text-muted-foreground">
                  Un token d'accès sera généré pour cet intervenant externe
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'intervenant "{selectedIntervenant?.firstName} {selectedIntervenant?.lastName}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
