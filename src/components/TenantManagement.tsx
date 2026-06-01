import { useState, useEffect } from "react";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
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
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Building2,
  Users,
  Calendar,
  Package,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import type { Tenant } from "../lib/tenants";

interface TenantFormData {
  name: string;
  businessName: string;
  siret: string;
  email: string;
  phone: string;
  address: string;
  pack: "essential" | "business" | "premium";
  maxUsers: number;
  status: "active" | "trial" | "suspended" | "pending";
  notes: string;
}

export function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tenants from backend
  const loadTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des tenants:", err);
      setError(err?.message || "Erreur lors du chargement des tenants");
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    businessName: "",
    siret: "",
    email: "",
    phone: "",
    address: "",
    pack: "essential",
    maxUsers: 5,
    status: "trial",
    notes: "",
  });

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || tenant.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "active").length,
    trial: tenants.filter((t) => t.status === "trial").length,
    suspended: tenants.filter((t) => t.status === "suspended").length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      trial: "bg-blue-100 text-blue-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    const labels = {
      active: "Actif",
      trial: "Essai",
      suspended: "Suspendu",
      pending: "En attente",
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPackBadge = (packId: string) => {
    const styles = {
      essential: "bg-blue-100 text-blue-800",
      business: "bg-purple-100 text-purple-800",
      premium: "bg-orange-100 text-orange-800",
    };
    const labels = {
      essential: "Essentiel - 49€",
      business: "Business - 99€",
      premium: "Premium - 199€",
    };
    return (
      <Badge className={styles[packId as keyof typeof styles]}>
        {labels[packId as keyof typeof labels]}
      </Badge>
    );
  };

  const handleCreate = async () => {
    try {
      const selectedPack = formData.pack;
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        name: formData.name,
        businessName: formData.businessName,
        logo: formData.name.substring(0, 2).toUpperCase(),
        primaryColor: "#3b82f6",
        siret: formData.siret,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        pack: selectedPack,
        createdAt: new Date().toISOString().split('T')[0],
        modules: [],
        maxUsers: formData.maxUsers,
        currentUsers: 1,
        status: formData.status,
        features: [],
        metadata: {
          notes: formData.notes,
        },
      };

      await apiClient.createTenant(newTenant);
      
      await loadTenants();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error creating tenant:", err);
      setError("Erreur lors de la création de la société");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      businessName: "",
      siret: "",
      email: "",
      phone: "",
      address: "",
      pack: "essential",
      maxUsers: 5,
      status: "trial",
      notes: "",
    });
  };

  const handleView = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsViewDialogOpen(true);
  };

  const handleStatusChange = async (tenantId: string, newStatus: Tenant["status"]) => {
    try {
      await apiClient.updateTenant(tenantId, { status: newStatus });
      await loadTenants(); // Recharger après mise à jour
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast.error(err?.message || "Erreur lors de la mise à jour du statut");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des sociétés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et leurs abonnements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau client</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau client à la plateforme Invocia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3>Informations de base</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom court *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: TechConsult"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Raison sociale *</Label>
                    <Input
                      id="businessName"
                      placeholder="Ex: TechConsult SARL"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET *</Label>
                  <Input
                    id="siret"
                    placeholder="123 456 789 00012"
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3>Coordonnées</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@entreprise.fr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    placeholder="123 Rue de la Tech, 75001 Paris"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3>Abonnement</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pack">Pack *</Label>
                    <Select
                      value={formData.pack}
                      onValueChange={(value) =>
                        setFormData({ ...formData, pack: value as typeof formData.pack })
                      }
                    >
                      <SelectTrigger id="pack">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essential">Essentiel - 49€/mois</SelectItem>
                        <SelectItem value="business">Business - 99€/mois</SelectItem>
                        <SelectItem value="premium">Premium - 199€/mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Nombre d'utilisateurs max</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      min="1"
                      value={formData.maxUsers}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUsers: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut initial</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as typeof formData.status })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Essai gratuit</SelectItem>
                      <SelectItem value="active">Actif (payant)</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes internes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes ou remarques..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.businessName || !formData.email}
                >
                  Créer le client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En essai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Suspendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="trial">En essai</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tenants */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            {filteredTenants.length} client{filteredTenants.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{tenant.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tenant.businessName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPackBadge(tenant.pack)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {tenant.currentUsers} / {tenant.maxUsers}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={tenant.status}
                        onValueChange={(value) =>
                          handleStatusChange(tenant.id, value as Tenant["status"])
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue>{getStatusBadge(tenant.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="trial">Essai</SelectItem>
                          <SelectItem value="suspended">Suspendu</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(tenant)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
            <DialogDescription>
              Informations complètes sur le client
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3>{selectedTenant.name}</h3>
                  <p className="text-muted-foreground">{selectedTenant.businessName}</p>
                </div>
                {getStatusBadge(selectedTenant.status)}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">SIRET</Label>
                    <p>{selectedTenant.siret}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </Label>
                    <p>{selectedTenant.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Téléphone
                    </Label>
                    <p>{selectedTenant.phone || "-"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Pack
                    </Label>
                    <div className="mt-1">{getPackBadge(selectedTenant.pack)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Utilisateurs
                    </Label>
                    <p>
                      {selectedTenant.currentUsers} / {selectedTenant.maxUsers}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Créé le
                    </Label>
                    <p>
                      {new Date(selectedTenant.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTenant.address && (
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Adresse
                  </Label>
                  <p className="whitespace-pre-line">{selectedTenant.address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}