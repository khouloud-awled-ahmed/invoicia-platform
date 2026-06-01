import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import {
  Upload,
  Download,
  FileText,
  Brain,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Mail,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Save,
  Copy,
  Settings,
  BarChart3,
  Euro,
  Calendar,
  Building2,
  FileCheck,
  FilePlus,
  Layers,
  SplitSquareVertical,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { apiClient } from "../lib/api-client-backend";
import { useEffect } from "react";

interface ExtractedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalHT: number;
  totalTTC: number;
}

interface ExtractedInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  supplierName: string;
  supplierAddress: string;
  supplierSIRET: string;
  supplierVAT: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  currency: string;
  paymentMethod?: string;
  paymentTerms?: string;
  lineItems: ExtractedLineItem[];
  notes?: string;
}

interface ProcessedInvoice {
  id: string;
  fileName: string;
  source: "upload" | "email" | "split";
  uploadedAt: string;
  status: "processing" | "completed" | "error" | "verified" | "published";
  extractedData: ExtractedInvoiceData | null;
  errorMessage?: string;
  processingTime?: number;
  confidence?: number;
  pageNumber?: number;
  parentFileId?: string;
}

// MOCK_PROCESSED_INVOICES supprimé - Les factures traitées doivent être chargées depuis l'API ou créées via le parser

export function PurchaseInvoiceAIReader() {
  const [processedInvoices, setProcessedInvoices] = useState<ProcessedInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ProcessedInvoice | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [emailAddress] = useState("factures@votreentreprise.fr");
  const [splitProgress, setSplitProgress] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedInvoiceData | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Format non supporté : ${file.name}`);
        continue;
      }

      const startTime = Date.now();
      const newInvoice: ProcessedInvoice = {
        id: `INV${Date.now()}`,
        fileName: file.name,
        source: "upload",
        uploadedAt: new Date().toISOString(),
        status: "processing",
        extractedData: null
      };

      setProcessedInvoices(prev => [newInvoice, ...prev]);
      setIsProcessing(true);

      try {
        const result = await apiClient.parseDocument(file, 'INVOICE');
        
        if (result.status === 'LEARNING_NEEDED') {
          const shouldLearn = window.confirm(
            "Ce format de facture est inconnu. Voulez-vous apprendre à l'IA comment le lire ?"
          );
          
          if (shouldLearn) {
            localStorage.setItem('pending_learning', JSON.stringify({
              documentId: result.documentId,
              rawData: result.rawData,
              rawText: result.rawText,
              type: 'INVOICE',
            }));
            window.location.href = '/settings/ai-lab';
            return;
          }
          setProcessedInvoices(prev => prev.map(inv => 
            inv.id === newInvoice.id 
              ? { ...inv, status: "error" as const, errorMessage: "Format non reconnu" }
              : inv
          ));
          continue;
        }
        
        if (result.status === 'SUCCESS' && result.data) {
          const invoiceData = result.data as any;
          const processingTime = (Date.now() - startTime) / 1000;
          
          setProcessedInvoices(prev => prev.map(inv => 
            inv.id === newInvoice.id 
              ? { 
                  ...inv, 
                  status: "completed", 
                  processingTime,
                  confidence: result.confidence ? Math.round(result.confidence * 100) : 0,
                  extractedData: {
                    invoiceNumber: invoiceData.invoiceNumber || "",
                    invoiceDate: invoiceData.date ? new Date(invoiceData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                    supplierName: invoiceData.supplierName || "",
                    supplierAddress: invoiceData.supplierAddress || "",
                    supplierSIRET: invoiceData.supplierSIRET || "",
                    supplierVAT: invoiceData.supplierVAT || "",
                    totalHT: invoiceData.totalHT || 0,
                    totalVAT: invoiceData.totalTVA || 0,
                    totalTTC: invoiceData.totalTTC || 0,
                    currency: "EUR",
                    lineItems: invoiceData.lineItems || []
                  }
                }
              : inv
          ));
          toast.success(`${file.name} traité avec succès !`);
        }
      } catch (error: any) {
        setProcessedInvoices(prev => prev.map(inv => 
          inv.id === newInvoice.id 
            ? { ...inv, status: "error" as const, errorMessage: error?.message || "Erreur" }
            : inv
        ));
        toast.error(error?.message || "Erreur lors du traitement");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSplitPDF = (file: File) => {
    setIsSplitting(true);
    setSplitProgress(0);
    toast.info(`Découpage de ${file.name} en cours...`);

    // Simuler le découpage page par page
    const totalPages = 5; // Simuler 5 pages
    let currentPage = 0;

    const interval = setInterval(() => {
      currentPage++;
      setSplitProgress((currentPage / totalPages) * 100);

      if (currentPage <= totalPages) {
        const newInvoice: ProcessedInvoice = {
          id: `INV${Date.now()}-P${currentPage}`,
          fileName: `${file.name.replace('.pdf', '')}_page_${currentPage}.pdf`,
          source: "split",
          uploadedAt: new Date().toISOString(),
          status: "processing",
          extractedData: null,
          pageNumber: currentPage,
          parentFileId: file.name
        };

        setProcessedInvoices(prev => [newInvoice, ...prev]);

        // Simuler le traitement de chaque page
        setTimeout(() => {
          setProcessedInvoices(prev => prev.map(inv => 
            inv.id === newInvoice.id 
              ? { 
                  ...inv, 
                  status: "completed",
                  processingTime: 2.0,
                  confidence: 90 + Math.floor(Math.random() * 8),
                  extractedData: {
                    invoiceNumber: `FAC-2025-${100 + currentPage}`,
                    invoiceDate: "2025-11-10",
                    dueDate: "2025-12-10",
                    supplierName: `Fournisseur Page ${currentPage}`,
                    supplierAddress: "Adresse du fournisseur",
                    supplierSIRET: "123 456 789 00000",
                    supplierVAT: "FR00000000000",
                    totalHT: 500.00 * currentPage,
                    totalVAT: 100.00 * currentPage,
                    totalTTC: 600.00 * currentPage,
                    currency: "EUR",
                    lineItems: []
                  }
                }
              : inv
          ));
        }, 1500);
      }

      if (currentPage >= totalPages) {
        clearInterval(interval);
        setIsSplitting(false);
        setShowSplitDialog(false);
        toast.success(`${totalPages} factures extraites avec succès !`);
      }
    }, 1000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleSplitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setShowSplitDialog(true);
      handleSplitPDF(e.target.files[0]);
    }
  };

  const handleViewDetails = (invoice: ProcessedInvoice) => {
    setSelectedInvoice(invoice);
    setEditedData(invoice.extractedData);
    setShowDetailDialog(true);
  };

  const handleVerify = (invoice: ProcessedInvoice) => {
    setProcessedInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: "verified" as const } : inv
    ));
    toast.success("Facture vérifiée ! Prête à être publiée.");
  };

  const handlePublish = (invoice: ProcessedInvoice) => {
    setProcessedInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: "published" as const } : inv
    ));
    toast.success("Facture publiée dans le module Achats !");
  };

  const handleReprocess = (invoice: ProcessedInvoice) => {
    setProcessedInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: "processing" as const } : inv
    ));
    
    setTimeout(() => {
      setProcessedInvoices(prev => prev.map(inv => 
        inv.id === invoice.id ? { ...inv, status: "completed" as const } : inv
      ));
      toast.success("Facture retraitée avec succès !");
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700 gap-1"><Clock className="w-3 h-3 animate-spin" />Traitement</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />À vérifier</Badge>;
      case "verified":
        return <Badge className="bg-purple-100 text-purple-700 gap-1"><FileCheck className="w-3 h-3" />Vérifié</Badge>;
      case "published":
        return <Badge className="bg-indigo-100 text-indigo-700 gap-1"><Check className="w-3 h-3" />Publié</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 gap-1"><XCircle className="w-3 h-3" />Erreur</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === "email") {
      return <Badge variant="outline" className="gap-1"><Mail className="w-3 h-3" />Email</Badge>;
    }
    if (source === "split") {
      return <Badge variant="outline" className="gap-1"><SplitSquareVertical className="w-3 h-3" />Split</Badge>;
    }
    return <Badge variant="outline" className="gap-1"><Upload className="w-3 h-3" />Upload</Badge>;
  };

  // Statistiques
  const totalProcessed = processedInvoices.length;
  const totalToVerify = processedInvoices.filter(inv => inv.status === "completed").length;
  const totalVerified = processedInvoices.filter(inv => inv.status === "verified").length;
  const totalPublished = processedInvoices.filter(inv => inv.status === "published").length;
  const averageConfidence = processedInvoices
    .filter(inv => inv.confidence)
    .reduce((acc, inv) => acc + (inv.confidence || 0), 0) / processedInvoices.filter(inv => inv.confidence).length || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            Import et Lecture IA - Factures d'Achat
          </h1>
          <p className="text-muted-foreground mt-1">
            Import multiple, découpage automatique et extraction intelligente des données
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Traité</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalProcessed}</div>
            <p className="text-xs text-muted-foreground mt-1">factures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">À Vérifier</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{totalToVerify}</div>
            <p className="text-xs text-muted-foreground mt-1">en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vérifiées</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">{totalVerified}</div>
            <p className="text-xs text-muted-foreground mt-1">prêtes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Publiées</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalPublished}</div>
            <p className="text-xs text-muted-foreground mt-1">dans Achats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Confiance IA</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{averageConfidence.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">précision</p>
          </CardContent>
        </Card>
      </div>

      {/* Zone d'Upload */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upload Multiple */}
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
                isDragging ? "border-blue-500 bg-blue-100" : "border-blue-300 bg-white"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FilePlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Import Multiple</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Glissez plusieurs factures ici
                  </p>
                </div>
                <Button 
                  onClick={() => document.getElementById('multi-file-input')?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Sélectionner
                </Button>
                <input
                  id="multi-file-input"
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, JPEG • Max 10 MB/fichier
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split PDF */}
        <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="relative border-2 border-dashed rounded-lg p-8 text-center border-purple-300 bg-white">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Découpage PDF</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    1 fichier = plusieurs factures
                  </p>
                </div>
                <Button 
                  onClick={() => document.getElementById('split-file-input')?.click()}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <SplitSquareVertical className="w-4 h-4 mr-2" />
                  Découper
                </Button>
                <input
                  id="split-file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleSplitInputChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  PDF uniquement • 1 facture/page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Réception Email */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">
                Réception Automatique par Email
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Vos fournisseurs peuvent envoyer leurs factures directement à cette adresse.
                Elles seront automatiquement traitées en arrière-plan.
              </p>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 bg-white border border-green-300 rounded text-sm font-mono text-green-900 flex-1">
                  {emailAddress}
                </code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(emailAddress);
                    toast.success("Adresse email copiée !");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-2">
                ✓ Traitement automatique • ✓ Extraction des données • ✓ Notification instantanée
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Factures */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Factures Traitées ({processedInvoices.length})</CardTitle>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="completed">À vérifier</SelectItem>
                  <SelectItem value="verified">Vérifiées</SelectItem>
                  <SelectItem value="published">Publiées</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Fichier</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>N° Facture</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Confiance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Aucune facture traitée pour le moment
                  </TableCell>
                </TableRow>
              ) : (
                processedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{invoice.fileName}</div>
                          {invoice.pageNumber && (
                            <div className="text-xs text-muted-foreground">Page {invoice.pageNumber}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.extractedData ? (
                        <div>
                          <div className="font-medium text-sm">{invoice.extractedData.supplierName}</div>
                          <div className="text-xs text-muted-foreground">{invoice.extractedData.supplierSIRET}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.extractedData?.invoiceNumber || (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.extractedData ? (
                        <div className="font-medium">
                          {invoice.extractedData.totalTTC.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR"
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSourceBadge(invoice.source)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(invoice.uploadedAt).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(invoice.uploadedAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                      {invoice.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">{invoice.errorMessage}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.confidence ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-16">
                            <div 
                              className={cn(
                                "h-full",
                                invoice.confidence >= 90 ? "bg-green-500" :
                                invoice.confidence >= 70 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${invoice.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{invoice.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {invoice.status === "completed" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(invoice)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Vérifier
                            </Button>
                          </>
                        )}
                        {invoice.status === "verified" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(invoice)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handlePublish(invoice)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Publier
                            </Button>
                          </>
                        )}
                        {invoice.status === "published" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(invoice)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        )}
                        {invoice.status === "error" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReprocess(invoice)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retraiter
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Vérification/Détails */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedInvoice && selectedInvoice.extractedData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Vérification de la Facture</span>
                  <Badge 
                    className={cn(
                      selectedInvoice.confidence && selectedInvoice.confidence >= 90 
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    )}
                  >
                    Confiance : {selectedInvoice.confidence}%
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedInvoice.fileName} • Vérifiez les données extraites avant publication
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Left: PDF Preview */}
                <div className="w-1/2 flex flex-col border rounded-lg bg-gray-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b bg-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Aperçu du document</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {/* Simulated PDF Preview */}
                    <div className="bg-white border rounded-lg shadow-sm p-8 space-y-6">
                      {/* Fake Invoice Header */}
                      <div className="flex justify-between border-b pb-4">
                        <div>
                          <h3 className="font-bold text-lg text-blue-900">{selectedInvoice.extractedData.supplierName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{selectedInvoice.extractedData.supplierAddress}</p>
                          <p className="text-sm text-gray-600">SIRET: {selectedInvoice.extractedData.supplierSIRET}</p>
                          <p className="text-sm text-gray-600">TVA: {selectedInvoice.extractedData.supplierVAT}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900">FACTURE</div>
                          <p className="text-sm text-gray-600 mt-2">N° {selectedInvoice.extractedData.invoiceNumber}</p>
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date de facture</p>
                          <p className="font-medium">{new Date(selectedInvoice.extractedData.invoiceDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date d'échéance</p>
                          <p className="font-medium">{new Date(selectedInvoice.extractedData.dueDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        {selectedInvoice.extractedData.paymentMethod && (
                          <div>
                            <p className="text-gray-500">Mode de paiement</p>
                            <p className="font-medium">{selectedInvoice.extractedData.paymentMethod}</p>
                          </div>
                        )}
                        {selectedInvoice.extractedData.paymentTerms && (
                          <div>
                            <p className="text-gray-500">Conditions</p>
                            <p className="font-medium">{selectedInvoice.extractedData.paymentTerms}</p>
                          </div>
                        )}
                      </div>

                      {/* Line Items */}
                      {selectedInvoice.extractedData.lineItems.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left p-2 border-b">Description</th>
                                <th className="text-center p-2 border-b">Qté</th>
                                <th className="text-right p-2 border-b">P.U. HT</th>
                                <th className="text-right p-2 border-b">Total HT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedInvoice.extractedData.lineItems.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-2">{item.description}</td>
                                  <td className="text-center p-2">{item.quantity}</td>
                                  <td className="text-right p-2">{item.unitPrice.toFixed(2)} €</td>
                                  <td className="text-right p-2 font-medium">{item.totalHT.toFixed(2)} €</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Totals */}
                      <div className="border-t pt-4">
                        <div className="flex justify-end">
                          <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total HT</span>
                              <span className="font-medium">{selectedInvoice.extractedData.totalHT.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">TVA</span>
                              <span className="font-medium">{selectedInvoice.extractedData.totalVAT.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-bold text-blue-900">Total TTC</span>
                              <span className="font-bold text-blue-900 text-lg">{selectedInvoice.extractedData.totalTTC.toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedInvoice.extractedData.notes && (
                        <div className="bg-gray-50 rounded p-3 text-sm">
                          <p className="text-gray-500 font-medium mb-1">Notes</p>
                          <p className="text-gray-700">{selectedInvoice.extractedData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Editable Form */}
                <div className="w-1/2 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-auto space-y-4 pr-2">
                    {/* Informations Fournisseur */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Informations Fournisseur
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Nom du fournisseur</Label>
                            <Input 
                              value={editedData?.supplierName || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, supplierName: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">SIRET</Label>
                            <Input 
                              value={editedData?.supplierSIRET || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, supplierSIRET: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Adresse</Label>
                            <Input 
                              value={editedData?.supplierAddress || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, supplierAddress: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">N° TVA Intracommunautaire</Label>
                            <Input 
                              value={editedData?.supplierVAT || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, supplierVAT: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Informations Facture */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Informations Facture
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">N° Facture</Label>
                            <Input 
                              value={editedData?.invoiceNumber || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, invoiceNumber: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Date de facture</Label>
                            <Input 
                              type="date" 
                              value={editedData?.invoiceDate || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, invoiceDate: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Date d'échéance</Label>
                            <Input 
                              type="date" 
                              value={editedData?.dueDate || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, dueDate: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Mode de paiement</Label>
                            <Input 
                              value={editedData?.paymentMethod || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, paymentMethod: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Conditions de paiement</Label>
                            <Input 
                              value={editedData?.paymentTerms || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, paymentTerms: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Devise</Label>
                            <Input 
                              value={editedData?.currency || ""} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, currency: e.target.value} : null)}
                              className="mt-1 h-9 text-sm" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Montants */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          Montants
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Total HT</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={editedData?.totalHT || 0} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, totalHT: parseFloat(e.target.value)} : null)}
                              className="mt-1 h-9 text-sm font-semibold" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Total TVA</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={editedData?.totalVAT || 0} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, totalVAT: parseFloat(e.target.value)} : null)}
                              className="mt-1 h-9 text-sm font-semibold" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Total TTC</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={editedData?.totalTTC || 0} 
                              onChange={(e) => setEditedData(prev => prev ? {...prev, totalTTC: parseFloat(e.target.value)} : null)}
                              className="mt-1 h-9 text-sm font-semibold text-blue-700 bg-blue-100" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lignes de facture */}
                    {selectedInvoice.extractedData.lineItems.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">
                            Lignes de Facture ({selectedInvoice.extractedData.lineItems.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-48 overflow-auto">
                            {selectedInvoice.extractedData.lineItems.map((item, idx) => (
                              <div key={idx} className="p-2 bg-gray-50 rounded border text-sm">
                                <div className="font-medium">{item.description}</div>
                                <div className="flex gap-4 text-xs text-gray-600 mt-1">
                                  <span>Qté: {item.quantity}</span>
                                  <span>P.U.: {item.unitPrice.toFixed(2)} €</span>
                                  <span>TVA: {item.vatRate}%</span>
                                  <span className="font-medium text-gray-900">Total: {item.totalTTC.toFixed(2)} €</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Notes */}
                    {selectedInvoice.extractedData.notes && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea 
                            value={editedData?.notes || ""} 
                            onChange={(e) => setEditedData(prev => prev ? {...prev, notes: e.target.value} : null)}
                            rows={2} 
                            className="text-sm" 
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Fermer
                </Button>
                {selectedInvoice.status === "completed" && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleReprocess(selectedInvoice)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retraiter
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        handleVerify(selectedInvoice);
                        setShowDetailDialog(false);
                      }}
                    >
                      <FileCheck className="w-4 h-4 mr-2" />
                      Valider la Vérification
                    </Button>
                  </>
                )}
                {selectedInvoice.status === "verified" && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handlePublish(selectedInvoice);
                      setShowDetailDialog(false);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Publier dans Achats
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Split Progress */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Découpage du PDF en cours...</DialogTitle>
            <DialogDescription>
              Extraction des factures page par page
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="flex flex-col items-center gap-4">
              <Layers className="w-12 h-12 text-purple-600 animate-pulse" />
              <Progress value={splitProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {Math.floor(splitProgress)}% complété
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}