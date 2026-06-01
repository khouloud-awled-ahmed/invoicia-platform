import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  PieChart,
  BarChart3,
  FileText,
  AlertTriangle,
  FileMinus,
  Upload,
  X,
  Loader2,
  XCircle,
} from "lucide-react";
import { InvoiceFormDialog } from "./InvoiceFormDialog";
import { InvoiceViewDialog } from "./InvoiceViewDialog";
import { InvoiceEditDialog } from "./InvoiceEditDialog";
import { InvoiceDeleteDialog } from "./InvoiceDeleteDialog";
import { InvoiceCancelDialog } from "./InvoiceCancelDialog";
import { InvoiceImportDialog } from "./InvoiceImportDialog";
import { CreditNoteFormDialog } from "./CreditNoteFormDialog";
import { CreditNoteViewDialog } from "./CreditNoteViewDialog";
import { CreditNoteDeleteDialog } from "./CreditNoteDeleteDialog";
import { CreditNotesTabContent } from "./CreditNotesTabContent";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  client: string;
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
  status: "draft" | "pending" | "validated" | "paid" | "archived" | "cancelled";
  orderNumber?: string;
  engagementId?: string;
  extractionConfidence?: number;
  tags?: string[];
  linkedCreditNoteId?: string;
  linkedCreditNoteNumber?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

interface CreditNote {
  id: string;
  number: string;
  date: string;
  client: string;
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
  status: "draft" | "validated" | "sent" | "applied";
  reason: string;
  description?: string;
  relatedInvoiceId?: string;
  relatedInvoiceNumber?: string;
  tvaRate: number;
}

// MOCK_INVOICES supprimé - Les factures sont maintenant chargées depuis l'API


interface SalesManagementProps {
  initialView?: "dashboard" | "table" | "creditNotes";
}

export function SalesManagement({ initialView = "dashboard" }: SalesManagementProps = {}) {
  const [currentView, setCurrentView] = useState<"dashboard" | "table" | "creditNotes">(initialView);
  const [currentTab, setCurrentTab] = useState<"invoices" | "creditNotes">(initialView === "creditNotes" ? "creditNotes" : "invoices");
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const [invoiceToDuplicate, setInvoiceToDuplicate] = useState<Invoice | null>(null);
  const [showCreditNoteDialog, setShowCreditNoteDialog] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);
  const [creditNoteToEdit, setCreditNoteToEdit] = useState<CreditNote | null>(null);
  const [creditNoteToDelete, setCreditNoteToDelete] = useState<CreditNote | null>(null);
  const [relatedInvoiceForCreditNote, setRelatedInvoiceForCreditNote] = useState<Invoice | null>(null);
  const [invoiceForSignature, setInvoiceForSignature] = useState<Invoice | null>(null);
  const [showEnvelopeDialog, setShowEnvelopeDialog] = useState(false);
  
  // Handler pour envoyer une facture en signature
  const handleSendInvoiceForSignature = async (invoice: Invoice) => {
    try {
      // Télécharger le PDF de la facture si disponible
      let pdfUrl = invoice.pdfUrl;
      
      if (!pdfUrl && invoice.id) {
        // Essayer de récupérer l'URL du PDF depuis l'API
        try {
          const downloadUrl = apiClient.getInvoiceDownloadUrl(invoice.id);
          pdfUrl = downloadUrl;
        } catch (error) {
          console.warn('Impossible de récupérer l\'URL du PDF, l\'utilisateur devra l\'uploader manuellement');
        }
      }
      
      setInvoiceForSignature(invoice);
      setShowEnvelopeDialog(true);
      
      if (pdfUrl) {
        toast.info("Le PDF de la facture sera pré-chargé dans l'enveloppe");
      } else {
        toast.info("Veuillez uploader le PDF de la facture dans l'enveloppe");
      }
    } catch (error: any) {
      console.error('Erreur lors de la préparation de l\'envoi:', error);
      toast.error("Erreur lors de la préparation de l'envoi pour signature");
    }
  };

  const handleCreateEnvelope = async (envelopeData: any) => {
    try {
      // Si on a une facture pré-chargée avec PDF, ajouter son PDF aux documents
      if (invoiceForSignature) {
        const invoicePdfUrl = invoiceForSignature.pdfUrl || 
          (invoiceForSignature.id ? apiClient.getInvoiceDownloadUrl(invoiceForSignature.id) : null);
        
        if (invoicePdfUrl) {
          envelopeData.documents = [
            {
              fileName: `Facture_${invoiceForSignature.number}.pdf`,
              fileUrl: invoicePdfUrl,
              order: 1
            },
            ...(envelopeData.documents || [])
          ];
        }
        
        // Pré-remplir le titre avec le numéro de facture
        if (!envelopeData.title) {
          envelopeData.title = `Signature - Facture ${invoiceForSignature.number}`;
        }
      }
      
      const response = await apiClient.createEnvelope(envelopeData);
      toast.success("Enveloppe créée avec succès ! Redirection vers le module de signature...");
      setShowEnvelopeDialog(false);
      setInvoiceForSignature(null);
      // Rediriger vers le module signature après un court délai
      setTimeout(() => {
        window.location.href = '/signature';
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'enveloppe:', error);
      const errorMessage = error?.message || error?.error || "Erreur lors de la création de l'enveloppe";
      toast.error(errorMessage);
    }
  };
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [creditNoteSearchTerm, setCreditNoteSearchTerm] = useState("");
  const [creditNoteStatusFilter, setCreditNoteStatusFilter] = useState<string>("all");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Mettre à jour la vue si initialView change
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
      if (initialView === "creditNotes") {
        setCurrentTab("creditNotes");
      }
    }
  }, [initialView]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  // Charger les factures depuis l'API
  const loadInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const data = await apiClient.getInvoices();
      const transformedInvoices = Array.isArray(data) 
        ? data.map((invoice: any) => ({
            ...invoice,
            id: invoice._id || invoice.id,
          }))
        : [];
      setInvoices(transformedInvoices);
    } catch (error: any) {
      console.error("Erreur lors du chargement des factures:", error);
      toast.error(error?.message || "Erreur lors du chargement des factures");
      setInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // Charger les avoirs depuis l'API
  const loadCreditNotes = async () => {
    try {
      const data = await apiClient.getCreditNotes();
      const transformedCreditNotes = Array.isArray(data) 
        ? data.map((cn: any) => ({
            ...cn,
            id: cn._id || cn.id,
          }))
        : [];
      setCreditNotes(transformedCreditNotes);
    } catch (error: any) {
      console.error("Erreur lors du chargement des avoirs:", error);
      toast.error(error?.message || "Erreur lors du chargement des avoirs");
      setCreditNotes([]);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadCreditNotes();
  }, []);

  // Fonction de filtrage par date
  const matchesDateFilter = (invoiceDate: string) => {
    if (dateFilter === "all") return true;
    
    const invDate = new Date(invoiceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        const todayStr = today.toISOString().split("T")[0];
        return invoiceDate === todayStr;
      
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return invDate >= weekAgo && invDate <= today;
      
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return invDate >= monthStart && invDate <= today;
      
      case "quarter":
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        return invDate >= quarterStart && invDate <= today;
      
      case "year":
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return invDate >= yearStart && invDate <= today;
      
      case "custom":
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate) : new Date(0);
        const end = customEndDate ? new Date(customEndDate) : new Date();
        return invDate >= start && invDate <= end;
      
      default:
        return true;
    }
  };

  // Filtrage des factures
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesClient = clientFilter === "all" || invoice.client === clientFilter;
    const matchesDate = matchesDateFilter(invoice.date);

    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  // Liste unique des clients
  const uniqueClients = Array.from(new Set(invoices.map(inv => inv.client))).sort();

  // Compter les filtres actifs
  const activeFiltersCount = 
    (statusFilter !== "all" ? 1 : 0) +
    (clientFilter !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClientFilter("all");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Calculs KPIs depuis les données réelles (pas de mocks)
  const totalInvoices = filteredInvoices.reduce((sum, inv) => sum + (inv.amountTTC || 0), 0);
  const thisMonthInvoices = filteredInvoices.filter((inv) => {
    const invDate = new Date(inv.date);
    const now = new Date();
    return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthInvoices.reduce((sum, inv) => sum + (inv.amountTTC || 0), 0);
  const pendingInvoices = filteredInvoices.filter((inv) => inv.status === "pending" || inv.status === "En attente");
  const validatedInvoices = filteredInvoices.filter((inv) => inv.status === "validated" || inv.status === "Validée");

  // Fonctions de gestion des actions
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    toast.success(`Affichage de la facture ${invoice.number}`);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    toast.info(`Édition de la facture ${invoice.number}`);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    toast.info(`Préparation du téléchargement...`);
    setTimeout(() => {
      toast.success(`PDF ${invoice.number} téléchargé avec succès`);
    }, 1000);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    setInvoiceToDuplicate(invoice);
    setShowInvoiceDialog(true);
    toast.info(`Duplication de la facture ${invoice.number}`);
  };

  const handleImportInvoices = async (importedInvoices: Invoice[]) => {
    try {
      // Sauvegarder chaque facture importée via l'API
      for (const invoice of importedInvoices) {
        await apiClient.createInvoice(invoice);
      }
      // Recharger la liste complète depuis l'API
      await loadInvoices();
      setShowImportDialog(false);
      toast.success(`${importedInvoices.length} facture(s) importée(s) avec succès !`);
    } catch (error: any) {
      console.error("Erreur lors de l'import:", error);
      toast.error(error?.message || "Erreur lors de l'import des factures");
    }
  };

  const handleCancelInvoice = async (cancelledInvoice: Invoice, creditNote: CreditNote, reason: string) => {
    try {
      // Créer l'avoir via l'API
      await apiClient.createCreditNote(creditNote);
      
      // Mettre à jour la facture (statut annulé) via l'API
      if (cancelledInvoice.id) {
        await apiClient.updateInvoice(cancelledInvoice.id, { 
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        });
      }
      
      // Recharger les données depuis l'API
      await loadInvoices();
      await loadCreditNotes();
      
      setInvoiceToCancel(null);
      toast.success("Facture annulée et avoir créé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de l'annulation:", error);
      toast.error(error?.message || "Erreur lors de l'annulation de la facture");
    }
  };

  const handleViewInvoiceFromCreditNote = (invoiceNumber: string) => {
    const invoice = invoices.find(inv => inv.number === invoiceNumber);
    if (invoice) {
      setSelectedCreditNote(null);
      setSelectedInvoice(invoice);
    }
  };

  const handleViewCreditNoteFromInvoice = (creditNoteNumber: string) => {
    const creditNote = creditNotes.find(cn => cn.number === creditNoteNumber);
    if (creditNote) {
      setSelectedInvoice(null);
      setSelectedCreditNote(creditNote);
    }
  };

  // Fonctions de gestion des avoirs
  const handleCreateCreditNoteFromInvoice = (invoice: Invoice) => {
    setRelatedInvoiceForCreditNote(invoice);
    setShowCreditNoteDialog(true);
    toast.info(`Création d'un avoir pour la facture ${invoice.number}`);
  };

  const handleViewCreditNote = (creditNote: CreditNote) => {
    setSelectedCreditNote(creditNote);
    toast.success(`Affichage de l'avoir ${creditNote.number}`);
  };

  const handleEditCreditNote = (creditNote: CreditNote) => {
    setCreditNoteToEdit(creditNote);
    setShowCreditNoteDialog(true);
    toast.info(`Édition de l'avoir ${creditNote.number}`);
  };

  const handleDeleteCreditNote = (creditNote: CreditNote) => {
    setCreditNoteToDelete(creditNote);
  };

  // Filtrage des avoirs
  const filteredCreditNotes = creditNotes.filter((cn) => {
    const matchesSearch =
      cn.number.toLowerCase().includes(creditNoteSearchTerm.toLowerCase()) ||
      cn.client.toLowerCase().includes(creditNoteSearchTerm.toLowerCase()) ||
      (cn.relatedInvoiceNumber && cn.relatedInvoiceNumber.toLowerCase().includes(creditNoteSearchTerm.toLowerCase()));

    const matchesStatus = creditNoteStatusFilter === "all" || cn.status === creditNoteStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculs KPIs avoirs
  const totalCreditNotes = filteredCreditNotes.reduce((sum, cn) => sum + cn.amountTTC, 0);
  const draftCreditNotes = filteredCreditNotes.filter((cn) => cn.status === "draft");
  const validatedCreditNotes = filteredCreditNotes.filter((cn) => cn.status === "validated");
  const appliedCreditNotes = filteredCreditNotes.filter((cn) => cn.status === "applied");

  // Avoirs par statut
  const creditNoteStatusCounts = {
    all: filteredCreditNotes.length,
    draft: draftCreditNotes.length,
    validated: validatedCreditNotes.length,
    sent: filteredCreditNotes.filter(cn => cn.status === "sent").length,
    applied: appliedCreditNotes.length,
  };

  const getCreditNoteStatusBadge = (status: CreditNote["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Brouillon</Badge>;
      case "validated":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Validé</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Envoyé</Badge>;
      case "applied":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Appliqué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      error: "Erreur de facturation",
      return: "Retour de marchandise",
      discount: "Remise commerciale",
      cancellation: "Annulation",
      duplicate: "Doublon",
      other: "Autre",
    };
    return reasons[reason] || reason;
  };

  // Top clients
  const clientTotals = filteredInvoices.reduce((acc, inv) => {
    acc[inv.client] = (acc[inv.client] || 0) + inv.amountTTC;
    return acc;
  }, {} as Record<string, number>);
  const topClients = Object.entries(clientTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Factures par statut
  const statusCounts = {
    all: filteredInvoices.length,
    draft: filteredInvoices.filter(i => i.status === "draft").length,
    pending: filteredInvoices.filter(i => i.status === "pending").length,
    validated: filteredInvoices.filter(i => i.status === "validated").length,
    paid: filteredInvoices.filter(i => i.status === "paid").length,
    cancelled: filteredInvoices.filter(i => i.status === "cancelled").length,
    archived: filteredInvoices.filter(i => i.status === "archived").length,
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Brouillon</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En attente</Badge>;
      case "validated":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Validée</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Payée</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Annulée</Badge>;
      case "archived":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">Archivée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExportData = (format: string) => {
    const draftCount = filteredInvoices.filter(inv => 
      inv.status.toLowerCase() === 'brouillon' || inv.status.toLowerCase() === 'draft'
    ).length;
    
    if (draftCount > 0) {
      toast.success(
        <div>
          <div className="font-semibold">Export {format.toUpperCase()} en cours...</div>
          <div className="text-sm">Les {draftCount} brouillon(s) porteront la mention "BROUILLON"</div>
        </div>,
        { duration: 4000 }
      );
    } else {
      toast.success(`Export ${format.toUpperCase()} en cours...`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Ventes</h1>
          <p className="text-muted-foreground mt-1">
            Créez, gérez et suivez vos factures clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowImportDialog(true)}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportData("excel")}>
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("csv")}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("pdf")}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer une Facture
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowInvoiceDialog(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Nouvelle facture manuelle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Tableau de Bord
          </TabsTrigger>
          <TabsTrigger value="table">
            <FileText className="w-4 h-4 mr-2" />
            Liste des Factures
          </TabsTrigger>
          <TabsTrigger value="creditNotes">
            <FileMinus className="w-4 h-4 mr-2" />
            Avoirs
          </TabsTrigger>
        </TabsList>

        {/* Dashboard View */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards - Calculées depuis les données réelles */}
          {isLoadingInvoices ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Chargement...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Chiffre d'affaires</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{totalInvoices.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredInvoices.length} facture(s) au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Ce Mois</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{thisMonthTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {thisMonthInvoices.length} facture(s) ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">En Attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{pendingInvoices.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Factures à envoyer
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Validées</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{validatedInvoices.length}</div>
                  <p className="text-xs text-green-600 mt-1">
                    Prêtes à envoyer
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top 5 Clients
                </CardTitle>
                <CardDescription>
                  Répartition du chiffre d'affaires par client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topClients.map(([client, total], index) => {
                    const percentage = (total / totalInvoices) * 100;
                    const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
                    return (
                      <div key={client} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${colors[index]}`} />
                            {client}
                          </span>
                          <span className="font-medium">{total.toFixed(2)} € ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[index]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition par Statut
                </CardTitle>
                <CardDescription>
                  État des factures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Brouillons", value: statusCounts.draft, color: "bg-gray-500" },
                    { label: "En attente", value: statusCounts.pending, color: "bg-yellow-500" },
                    { label: "Validées", value: statusCounts.validated, color: "bg-green-500" },
                    { label: "Payées", value: statusCounts.paid, color: "bg-blue-500" },
                    { label: "Annulées", value: statusCounts.cancelled, color: "bg-red-500" },
                    { label: "Archivées", value: statusCounts.archived, color: "bg-gray-400" },
                  ].map(({ label, value, color }) => {
                    const percentage = (value / filteredInvoices.length) * 100 || 0;
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${color}`} />
                            {label}
                          </span>
                          <span className="font-medium">{value} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Invoices Alert */}
          {pendingInvoices.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Factures en Attente d'Envoi
                </CardTitle>
                <CardDescription>
                  {pendingInvoices.length} facture(s) doivent être envoyées aux clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingInvoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">{invoice.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.client} • Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{invoice.amountTTC.toFixed(2)} €</span>
                        <Button size="sm" onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Première ligne - Recherche et bouton filtres */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par numéro ou client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Button 
                    variant={activeFiltersCount > 0 ? "default" : "outline"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-white text-primary">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>

                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Réinitialiser
                    </Button>
                  )}
                </div>

                {/* Panneau de filtres avancés */}
                {showAdvancedFilters && (
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtres avancés
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Filtre par statut */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Statut
                        </Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les statuts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">✓ Tous les statuts</SelectItem>
                            <SelectItem value="draft">⚪ Brouillons</SelectItem>
                            <SelectItem value="pending">🟡 En attente</SelectItem>
                            <SelectItem value="validated">🟢 Validées</SelectItem>
                            <SelectItem value="paid">🔵 Payées</SelectItem>
                            <SelectItem value="cancelled">🔴 Annulées</SelectItem>
                            <SelectItem value="archived">⚫ Archivées</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtre par client */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Client
                        </Label>
                        <Select value={clientFilter} onValueChange={setClientFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les clients" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">✓ Tous les clients</SelectItem>
                            {uniqueClients.map((client) => (
                              <SelectItem key={client} value={client}>
                                {client}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtre par période */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          Période
                        </Label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Toutes les dates" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">✓ Toutes les périodes</SelectItem>
                            <SelectItem value="today">📅 Aujourd'hui</SelectItem>
                            <SelectItem value="week">📆 Cette semaine</SelectItem>
                            <SelectItem value="month">📊 Ce mois</SelectItem>
                            <SelectItem value="quarter">📈 Ce trimestre</SelectItem>
                            <SelectItem value="year">🗓️ Cette année</SelectItem>
                            <SelectItem value="custom">🎯 Période personnalisée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Période personnalisée */}
                    {dateFilter === "custom" && (
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Sélection de période personnalisée</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-blue-900">Date de début</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="bg-white border-blue-300 focus:border-blue-500"
                            />
                            {customStartDate && (
                              <p className="text-xs text-blue-700">
                                Depuis le {new Date(customStartDate).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-blue-900">Date de fin</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="bg-white border-blue-300 focus:border-blue-500"
                              min={customStartDate || undefined}
                            />
                            {customEndDate && (
                              <p className="text-xs text-blue-700">
                                Jusqu'au {new Date(customEndDate).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        {customStartDate && customEndDate && (
                          <div className="pt-2 border-t border-blue-200">
                            <p className="text-sm text-blue-800">
                              <strong>Période sélectionnée :</strong> du {new Date(customStartDate).toLocaleDateString('fr-FR')} au {new Date(customEndDate).toLocaleDateString('fr-FR')}
                              {' '}({Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} jours)
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const today = new Date();
                              const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                              setCustomStartDate(firstDayOfMonth.toISOString().split('T')[0]);
                              setCustomEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="text-xs"
                          >
                            Ce mois
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const today = new Date();
                              const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                              const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                              setCustomStartDate(lastMonth.toISOString().split('T')[0]);
                              setCustomEndDate(lastDayOfLastMonth.toISOString().split('T')[0]);
                            }}
                            className="text-xs"
                          >
                            Mois dernier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const today = new Date();
                              const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                              setCustomStartDate(firstDayOfYear.toISOString().split('T')[0]);
                              setCustomEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="text-xs"
                          >
                            Cette année
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCustomStartDate("");
                              setCustomEndDate("");
                            }}
                            className="text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Effacer
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Résumé des filtres actifs */}
                    {activeFiltersCount > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Filtres actifs :</span>
                        {statusFilter !== "all" && (
                          <Badge variant="secondary" className="gap-1">
                            Statut: {statusFilter}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => setStatusFilter("all")}
                            />
                          </Badge>
                        )}
                        {clientFilter !== "all" && (
                          <Badge variant="secondary" className="gap-1">
                            Client: {clientFilter}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => setClientFilter("all")}
                            />
                          </Badge>
                        )}
                        {dateFilter !== "all" && (
                          <Badge variant="secondary" className="gap-1">
                            Période: {
                              dateFilter === "today" ? "Aujourd'hui" :
                              dateFilter === "week" ? "Cette semaine" :
                              dateFilter === "month" ? "Ce mois" :
                              dateFilter === "quarter" ? "Ce trimestre" :
                              dateFilter === "year" ? "Cette année" :
                              "Personnalisée"
                            }
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => {
                                setDateFilter("all");
                                setCustomStartDate("");
                                setCustomEndDate("");
                              }}
                            />
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{filteredInvoices.length}</div>
                    <div className="text-xs text-blue-800">Factures affichées</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredInvoices.filter(inv => inv.status === "paid").length}
                    </div>
                    <div className="text-xs text-green-800">Payées</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredInvoices.filter(inv => inv.status === "pending").length}
                    </div>
                    <div className="text-xs text-yellow-800">En attente</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {totalInvoices.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                    <div className="text-xs text-orange-800">Montant total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              {filteredInvoices.length} facture(s) trouvée(s)
            </p>
            <div className="text-sm">
              Total: <span className="font-semibold">{totalInvoices.toFixed(2)} €</span>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Montant HT</TableHead>
                    <TableHead className="text-right">TVA</TableHead>
                    <TableHead className="text-right">Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingInvoices ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-muted-foreground">Chargement des factures...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 opacity-50" />
                          <p className="font-medium">Aucune facture</p>
                          <p className="text-sm">Créez votre première facture pour commencer</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-right">{(invoice.amountHT || 0).toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{(invoice.amountTVA || 0).toFixed(2)} €</TableCell>
                        <TableCell className="text-right font-medium">
                          <div>{(invoice.amountTTC || 0).toFixed(2)} €</div>
                          {(invoice as any).hasAvoirs && (
                            <div className="text-xs text-orange-600 font-normal">
                              Solde: {((invoice as any).remainingBalance || 0).toFixed(2)} €
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Éditer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteInvoice(invoice)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-blue-600"
                                onClick={() => handleCreateCreditNoteFromInvoice(invoice)}
                              >
                                <FileMinus className="w-4 h-4 mr-2" />
                                Créer un avoir
                              </DropdownMenuItem>
                              {invoice.status === "validated" && (
                              <DropdownMenuItem
                                className="text-blue-600"
                                onClick={() => apiClient.request(`/billing/sales/invoices/${invoice.id}/pay`, { method: 'PATCH' }).then(loadInvoices)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marquer comme payée
                              </DropdownMenuItem>
                            )}
                            {!["cancelled", "archived"].includes(invoice.status) && (
                              <DropdownMenuItem
                                className="text-orange-600"
                                onClick={() => apiClient.request(`/billing/sales/invoices/${invoice.id}/archive`, { method: 'PATCH' }).then(loadInvoices)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Archiver
                              </DropdownMenuItem>
                            )}
                            {!["cancelled", "archived"].includes(invoice.status) && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setInvoiceToCancel(invoice)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Annuler
                              </DropdownMenuItem>
                            )}
                              <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => handleDuplicateInvoice(invoice)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Dupliquer
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

        {/* Credit Notes View */}
        <TabsContent value="creditNotes" className="space-y-4">
          <CreditNotesTabContent
            filteredCreditNotes={filteredCreditNotes}
            totalCreditNotes={totalCreditNotes}
            creditNoteSearchTerm={creditNoteSearchTerm}
            setCreditNoteSearchTerm={setCreditNoteSearchTerm}
            creditNoteStatusFilter={creditNoteStatusFilter}
            setCreditNoteStatusFilter={setCreditNoteStatusFilter}
            getCreditNoteStatusBadge={getCreditNoteStatusBadge}
            getReasonLabel={getReasonLabel}
            handleViewCreditNote={handleViewCreditNote}
            handleEditCreditNote={handleEditCreditNote}
            handleDeleteCreditNote={handleDeleteCreditNote}
            setShowCreditNoteDialog={setShowCreditNoteDialog}
            setRelatedInvoiceForCreditNote={setRelatedInvoiceForCreditNote}
            onRefresh={loadCreditNotes}
          />
        </TabsContent>
      </Tabs>

      {/* Invoice Form Dialog */}
      <InvoiceFormDialog 
        open={showInvoiceDialog} 
        onOpenChange={(open) => {
          setShowInvoiceDialog(open);
          if (!open) setInvoiceToDuplicate(null);
        }}
        onInvoiceCreated={async (newInvoice) => {
          // Recharger la liste complète depuis l'API pour avoir les données à jour
          await loadInvoices();
          setShowInvoiceDialog(false);
          toast.success(`Facture ${newInvoice?.number || 'créée'} enregistrée avec succès !`);
        }}
        invoiceToDuplicate={invoiceToDuplicate}
      />
      
      {/* Invoice Import Dialog */}
      <InvoiceImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportInvoices}
      />
      
      {/* Invoice View Dialog */}
      <InvoiceViewDialog
        open={selectedInvoice !== null} 
        onOpenChange={(open) => !open && setSelectedInvoice(null)} 
        invoice={selectedInvoice} 
        onCancelInvoice={(invoice) => setInvoiceToCancel(invoice)}
        onViewCreditNote={handleViewCreditNoteFromInvoice}
        onSendForSignature={handleSendInvoiceForSignature}
      />
      
      {/* Invoice Edit Dialog */}
      <InvoiceEditDialog 
        open={invoiceToEdit !== null} 
        onOpenChange={(open) => !open && setInvoiceToEdit(null)} 
        invoice={invoiceToEdit}
        onSave={async (updatedInvoice, creditNote) => {
          try {
            // Mettre à jour la facture via l'API
            if (updatedInvoice.id) {
              await apiClient.updateInvoice(updatedInvoice.id, updatedInvoice);
            }
            // Si un avoir a été créé, l'ajouter aussi
            if (creditNote) {
              await apiClient.createCreditNote(creditNote);
            }
            // Recharger les factures et avoirs
            await loadInvoices();
            await loadCreditNotes();
            setInvoiceToEdit(null);
            toast.success("Facture modifiée avec succès");
          } catch (error: any) {
            console.error("Erreur lors de la modification:", error);
            toast.error(error?.message || "Erreur lors de la modification de la facture");
          }
        }}
      />
      
      {/* Invoice Delete Dialog (pour brouillons uniquement) */}
      <InvoiceDeleteDialog 
        open={invoiceToDelete !== null} 
        onOpenChange={(open) => !open && setInvoiceToDelete(null)} 
        invoice={invoiceToDelete}
        onDelete={async (creditNote) => {
          try {
            if (invoiceToDelete?.id) {
              if (creditNote) {
                // Facture émise : créer l'avoir d'annulation
                await apiClient.createCreditNote(creditNote);
                // Marquer la facture comme annulée
                await apiClient.updateInvoice(invoiceToDelete.id, { status: 'cancelled' });
                await loadCreditNotes();
              } else {
                // Brouillon : suppression directe
                await apiClient.deleteInvoice(invoiceToDelete.id);
              }
              // Recharger les factures
              await loadInvoices();
              setInvoiceToDelete(null);
            }
          } catch (error: any) {
            console.error("Erreur lors de la suppression:", error);
            toast.error(error?.message || "Erreur lors de la suppression de la facture");
          }
        }}
      />
      
      {/* Invoice Cancel Dialog (pour factures émises) */}
      <InvoiceCancelDialog 
        open={invoiceToCancel !== null} 
        onOpenChange={(open) => !open && setInvoiceToCancel(null)} 
        invoice={invoiceToCancel} 
        onCancel={handleCancelInvoice}
      />
      
      {/* Credit Note Form Dialog */}
      <CreditNoteFormDialog 
        open={showCreditNoteDialog} 
        onOpenChange={async (open) => {
          setShowCreditNoteDialog(open);
          if (!open) {
            setRelatedInvoiceForCreditNote(null);
            setCreditNoteToEdit(null);
            await loadCreditNotes();
            await loadInvoices();
          }
        }}
        relatedInvoice={relatedInvoiceForCreditNote}
        creditNote={creditNoteToEdit}
        mode={creditNoteToEdit ? "edit" : "create"}
      />
      
      {/* Credit Note View Dialog */}
      <CreditNoteViewDialog 
        open={selectedCreditNote !== null} 
        onOpenChange={(open) => !open && setSelectedCreditNote(null)} 
        creditNote={selectedCreditNote} 
        onViewInvoice={handleViewInvoiceFromCreditNote}
      />
      
      {/* Credit Note Delete Dialog */}
     <CreditNoteDeleteDialog 
      open={creditNoteToDelete !== null} 
      onOpenChange={(open) => !open && setCreditNoteToDelete(null)} 
      creditNote={creditNoteToDelete}
      onDeleted={loadCreditNotes}
     />
    </div>
  );
}
