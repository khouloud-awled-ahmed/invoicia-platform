import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Plus, Download, Upload, UserPlus, Building2, FileText, Calendar,
  Mail, Phone, Briefcase, Clock, CheckCircle2, AlertTriangle, XCircle,
  Eye, Edit, Trash2, MoreVertical, Search, Euro, FileCheck, AlertCircle,
  Wallet, TrendingUp, Users, Package, Wifi, Fuel, Cloud, Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { apiClient } from "../lib/api-client-backend";

type SupplierType = "it_services" | "supplies" | "services" | "telecom" | "fuel" | "software" | "other";

interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  email: string;
  phone: string;
  address: string;
  siret: string;
  vatNumber?: string;
  matriculeFiscal?: string;
  status: "active" | "inactive";
  intervenantIds?: string[];
  invoiceEmail?: string;
  canSendInvoiceByEmail?: boolean;
}

export function UnifiedSupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [intervenants, setIntervenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suppliers");

  // Form state - Supplier
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [supplierType, setSupplierType] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierSiret, setSupplierSiret] = useState("");
  const [supplierVat, setSupplierVat] = useState("");
  const [supplierInvoiceEmail, setSupplierInvoiceEmail] = useState("");
  const [supplierCanSendEmail, setSupplierCanSendEmail] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Form state - Contractor (intervenant)
  const [showContractorDialog, setShowContractorDialog] = useState(false);
  const [contractorSupplierId, setContractorSupplierId] = useState("");
  const [contractorFirstName, setContractorFirstName] = useState("");
  const [contractorLastName, setContractorLastName] = useState("");
  const [contractorEmail, setContractorEmail] = useState("");
  const [contractorPhone, setContractorPhone] = useState("");
  const [contractorJob, setContractorJob] = useState("");
  const [contractorType, setContractorType] = useState("");
  const [contractorTJM, setContractorTJM] = useState("");
  const [contractorStartDate, setContractorStartDate] = useState("");
  const [savingContractor, setSavingContractor] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadSuppliers();
    loadIntervenants();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getSuppliers();
      const normalized = Array.isArray(data)
        ? data.map((s: any) => ({ ...s, id: s._id || s.id }))
        : [];
      setSuppliers(normalized);
    } catch (error: any) {
      console.error("Erreur chargement fournisseurs:", error);
      toast.error("Erreur lors du chargement des fournisseurs");
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntervenants = async () => {
    try {
      const data = await apiClient.request<any[]>('/intervenants');
      const normalized = Array.isArray(data)
        ? data.map((i: any) => ({ ...i, id: i._id || i.id }))
        : [];
      setIntervenants(normalized);
    } catch (error: any) {
      console.error('Erreur chargement intervenants:', error);
    }
  };

  // ─── CREATE SUPPLIER ──────────────────────────────────────────
  const handleCreateSupplier = async () => {
    if (!supplierType || !supplierName) {
      toast.error("Veuillez remplir le type et le nom du fournisseur");
      return;
    }

    setSavingSupplier(true);
    try {
      await apiClient.createSupplier({
        type: supplierType,
        name: supplierName,
        email: supplierEmail,
        phone: supplierPhone,
        address: supplierAddress,
        siret: supplierSiret,
        vatNumber: supplierVat,
        invoiceEmail: supplierInvoiceEmail,
        canSendInvoiceByEmail: supplierCanSendEmail,
        status: "active",
      });

      toast.success(`Fournisseur "${supplierName}" créé avec succès !`);
      setShowSupplierDialog(false);
      resetSupplierForm();
      await loadSuppliers();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la création du fournisseur");
    } finally {
      setSavingSupplier(false);
    }
  };

  const resetSupplierForm = () => {
    setSupplierType("");
    setSupplierName("");
    setSupplierEmail("");
    setSupplierPhone("");
    setSupplierAddress("");
    setSupplierSiret("");
    setSupplierVat("");
    setSupplierInvoiceEmail("");
    setSupplierCanSendEmail(false);
  };

  // ─── DELETE SUPPLIER ──────────────────────────────────────────
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Supprimer le fournisseur "${name}" ?`)) return;
    try {
      await apiClient.request(`/billing/purchases/suppliers/${id}`, { method: 'DELETE' });
      toast.success("Fournisseur supprimé");
      await loadSuppliers();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    }
  };

  // ─── TOGGLE STATUS ────────────────────────────────────────────
  const handleToggleStatus = async (id: string) => {
    try {
      await apiClient.request(`/billing/purchases/suppliers/${id}/toggle-status`, { method: 'PATCH' });
      toast.success("Statut mis à jour");
      await loadSuppliers();
    } catch (error: any) {
      toast.error(error?.message || "Erreur");
    }
  };

  // ─── CREATE CONTRACTOR ────────────────────────────────────────
  const handleCreateContractor = async () => {
    if (!contractorSupplierId || !contractorFirstName || !contractorLastName || !contractorEmail) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSavingContractor(true);
    try {
      // Link intervenant to supplier
      const intervenantData = {
        firstName: contractorFirstName,
        lastName: contractorLastName,
        email: contractorEmail,
        phone: contractorPhone,
        jobTitle: contractorJob,
        contractType: contractorType,
        dailyRate: contractorTJM ? parseFloat(contractorTJM) : undefined,
        startDate: contractorStartDate || undefined,
        supplierId: contractorSupplierId,
      };

      // Create intervenant via intervenants API
      await apiClient.request('/intervenants', {
        method: 'POST',
        body: JSON.stringify(intervenantData),
      });

      toast.success(`Intervenant "${contractorFirstName} ${contractorLastName}" créé avec succès !`);
      setShowContractorDialog(false);
      resetContractorForm();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la création de l'intervenant");
    } finally {
      setSavingContractor(false);
    }
  };

  const resetContractorForm = () => {
    setContractorSupplierId("");
    setContractorFirstName("");
    setContractorLastName("");
    setContractorEmail("");
    setContractorPhone("");
    setContractorJob("");
    setContractorType("");
    setContractorTJM("");
    setContractorStartDate("");
  };

  // ─── FILTERS ──────────────────────────────────────────────────
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch = searchQuery === "" ||
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.siret?.includes(searchQuery);
    const matchesType = filterType === "all" || s.type === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // ─── KPIs ─────────────────────────────────────────────────────
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === "active").length;
  const itSuppliers = suppliers.filter(s => s.type === "it_services").length;

  // ─── HELPERS ──────────────────────────────────────────────────
  const getSupplierTypeIcon = (type: string) => {
    switch (type) {
      case "it_services": return <Laptop className="w-4 h-4" />;
      case "supplies": return <Package className="w-4 h-4" />;
      case "services": return <Briefcase className="w-4 h-4" />;
      case "telecom": return <Wifi className="w-4 h-4" />;
      case "fuel": return <Fuel className="w-4 h-4" />;
      case "software": return <Cloud className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      it_services: { label: "Prestations IT", color: "bg-blue-100 text-blue-700" },
      supplies: { label: "Fournitures", color: "bg-green-100 text-green-700" },
      services: { label: "Services", color: "bg-purple-100 text-purple-700" },
      telecom: { label: "Télécoms", color: "bg-cyan-100 text-cyan-700" },
      fuel: { label: "Carburant", color: "bg-orange-100 text-orange-700" },
      software: { label: "Logiciels/Cloud", color: "bg-indigo-100 text-indigo-700" },
      other: { label: "Autre", color: "bg-gray-100 text-gray-700" },
    };
    const t = types[type] || { label: type, color: "bg-gray-100 text-gray-700" };
    return (
      <Badge className={cn("gap-1", t.color)}>
        {getSupplierTypeIcon(type)}
        {t.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "active"
      ? <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />Actif</Badge>
      : <Badge className="bg-gray-100 text-gray-700 gap-1"><XCircle className="w-3 h-3" />Inactif</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Fournisseurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos fournisseurs, intervenants externes et documents légaux
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Fournisseurs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">{itSuppliers} prestataires IT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Intervenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">0 actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Achats</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">0 €</div>
            <p className="text-xs text-muted-foreground mt-1">Tous fournisseurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Documents</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">À renouveler</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">
            <Building2 className="w-4 h-4 mr-2" />
            Tous les Fournisseurs
          </TabsTrigger>
          <TabsTrigger value="contractors">
            <UserPlus className="w-4 h-4 mr-2" />
            Intervenants Externes
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents Légaux
          </TabsTrigger>
        </TabsList>

        {/* ─── FOURNISSEURS TAB ─── */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gérez tous vos fournisseurs (prestations IT, fournitures, services, etc.)
            </p>
            <Button onClick={() => setShowSupplierDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Fournisseur
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email, SIRET..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="it_services">Prestations IT</SelectItem>
                    <SelectItem value="supplies">Fournitures</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="telecom">Télécoms</SelectItem>
                    <SelectItem value="fuel">Carburant</SelectItem>
                    <SelectItem value="software">Logiciels/Cloud</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fournisseurs ({filteredSuppliers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>SIRET</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Intervenants</TableHead>
                    <TableHead>Achats</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          Chargement...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun fournisseur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {supplier.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-xs text-muted-foreground">{supplier.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(supplier.type)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />{supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />{supplier.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{supplier.siret || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 gap-1">
                            <CheckCircle2 className="w-3 h-3" />À jour
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {supplier.intervenantIds?.length || 0} intervenant(s)
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">0 €</TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleStatus(supplier.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {supplier.status === 'active' ? 'Désactiver' : 'Activer'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── INTERVENANTS TAB ─── */}
        <TabsContent value="contractors" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Intervenants rattachés aux fournisseurs de prestations IT
            </p>
            <Button onClick={() => setShowContractorDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Intervenant
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Intervenant</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intervenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucun intervenant trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    intervenants.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>
                          <div className="font-medium">{i.firstName} {i.lastName}</div>
                          <div className="text-xs text-muted-foreground">{i.email}</div>
                        </TableCell>
                        <TableCell>{i.supplierName || "-"}</TableCell>
                        <TableCell>{i.position || "-"}</TableCell>
                        <TableCell>
                          {i.status === "active"
                            ? <Badge className="bg-green-100 text-green-700">Actif</Badge>
                            : <Badge className="bg-gray-100 text-gray-700">Inactif</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DOCUMENTS TAB ─── */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Documents Légaux à Renouveler
              </CardTitle>
              <CardDescription className="text-orange-700">
                Suivi des documents légaux (KBIS, RC Pro, URSSAF) de tous les fournisseurs
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-4">
              Aucun document à renouveler
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── DIALOG NOUVEAU FOURNISSEUR ─── */}
      <Dialog open={showSupplierDialog} onOpenChange={(o) => { if (!o) resetSupplierForm(); setShowSupplierDialog(o); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau Fournisseur</DialogTitle>
            <DialogDescription>
              Enregistrer un nouveau fournisseur (prestations IT, fournitures, services, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de fournisseur *</Label>
              <Select value={supplierType} onValueChange={setSupplierType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it_services">Prestations IT</SelectItem>
                  <SelectItem value="supplies">Fournitures bureautiques</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="telecom">Télécoms & Internet</SelectItem>
                  <SelectItem value="fuel">Carburant</SelectItem>
                  <SelectItem value="software">Logiciels & Cloud</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nom de l'entreprise *</Label>
              <Input
                placeholder="Ex: Fournisseur Tech Solutions"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contact@exemple.fr"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  placeholder="+216 71 000 000"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                placeholder="Adresse complète"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SIRET / Matricule Fiscal</Label>
                <Input
                  placeholder="123 456 789"
                  value={supplierSiret}
                  onChange={(e) => setSupplierSiret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>N° TVA</Label>
                <Input
                  placeholder="TN12345678900"
                  value={supplierVat}
                  onChange={(e) => setSupplierVat(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div>
                <h3 className="font-medium mb-1">Configuration facturation par email</h3>
                <p className="text-sm text-muted-foreground">
                  Email pour recevoir les factures automatiquement
                </p>
              </div>
              <div className="space-y-2">
                <Label>Email de facturation</Label>
                <Input
                  type="email"
                  placeholder="factures@fournisseur.fr"
                  value={supplierInvoiceEmail}
                  onChange={(e) => setSupplierInvoiceEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="canSendEmail"
                  checked={supplierCanSendEmail}
                  onChange={(e) => setSupplierCanSendEmail(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="canSendEmail" className="cursor-pointer font-normal">
                  Activer l'envoi automatique des factures par email
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)} disabled={savingSupplier}>
              Annuler
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateSupplier}
              disabled={savingSupplier}
            >
              {savingSupplier ? "Création..." : "Créer le Fournisseur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG NOUVEL INTERVENANT ─── */}
      <Dialog open={showContractorDialog} onOpenChange={(o) => { if (!o) resetContractorForm(); setShowContractorDialog(o); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvel Intervenant Externe</DialogTitle>
            <DialogDescription>
              Rattacher un intervenant à un fournisseur de prestations IT
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fournisseur rattaché *</Label>
              <Select value={contractorSupplierId} onValueChange={setContractorSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Seuls les fournisseurs de type "Prestations IT" peuvent avoir des intervenants
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input placeholder="Jean" value={contractorFirstName} onChange={(e) => setContractorFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input placeholder="Dupont" value={contractorLastName} onChange={(e) => setContractorLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="jean.dupont@exemple.fr" value={contractorEmail} onChange={(e) => setContractorEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input placeholder="+216 6 12 34 56" value={contractorPhone} onChange={(e) => setContractorPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Poste / Fonction *</Label>
              <Input placeholder="Ex: Développeur Full Stack" value={contractorJob} onChange={(e) => setContractorJob(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Type de contrat *</Label>
              <Select value={contractorType} onValueChange={setContractorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freelance">Freelance / Auto-entrepreneur</SelectItem>
                  <SelectItem value="portage">Portage salarial</SelectItem>
                  <SelectItem value="cdi">CDI (sous-traitant)</SelectItem>
                  <SelectItem value="cdd">CDD (sous-traitant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taux journalier (TJM)</Label>
                <Input type="number" placeholder="500" value={contractorTJM} onChange={(e) => setContractorTJM(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" value={contractorStartDate} onChange={(e) => setContractorStartDate(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractorDialog(false)} disabled={savingContractor}>
              Annuler
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateContractor}
              disabled={savingContractor}
            >
              {savingContractor ? "Création..." : "Créer l'Intervenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}