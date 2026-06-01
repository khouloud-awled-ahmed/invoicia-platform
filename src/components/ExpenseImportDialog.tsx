import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
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
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Cloud,
  Smartphone,
  Image as ImageIcon,
  AlertCircle,
  FolderOpen,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import { apiClient } from "../lib/api-client-backend";

interface ExpenseImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (expense: any) => void;
}

const CLOUD_PROVIDERS = [
  { id: "gdrive", name: "Google Drive", icon: Cloud, connected: false },
  { id: "dropbox", name: "Dropbox", icon: Cloud, connected: false },
  { id: "onedrive", name: "OneDrive", icon: Cloud, connected: false },
];

const EXPENSE_CATEGORIES = [
  "Logiciels SaaS",
  "Fournitures de bureau",
  "Carburant",
  "Restauration",
  "Déplacements",
  "Marketing",
  "Formation",
  "Télécommunications",
  "Assurances",
  "Services professionnels",
  "Maintenance",
  "Autres",
];

const PROJECTS = [
  "Site Web Client A",
  "Migration Cloud",
  "Application Mobile B",
  "Infrastructure IT",
  "Formation Équipe",
  "R&D IA",
  "Aucun projet",
];

const COST_CENTERS = [
  "IT-001 - Informatique",
  "MKT-002 - Marketing",
  "HR-003 - Ressources Humaines",
  "FIN-004 - Finance",
  "OPS-005 - Opérations",
  "RD-006 - R&D",
];

export function ExpenseImportDialog({ isOpen, onClose, onImportComplete }: ExpenseImportDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "verification">("upload");

  // Extracted data state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [vatRate, setVatRate] = useState("20");
  const [amountHT, setAmountHT] = useState("");
  const [amountTVA, setAmountTVA] = useState("");
  const [amountTTC, setAmountTTC] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [project, setProject] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [lineItems, setLineItems] = useState<Array<{
    article: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
  }>>([]);
  
  // Suppliers management
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    siret: "",
    vatNumber: "",
  });

  // Document viewer state
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Charger les fournisseurs au montage
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await apiClient.getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des fournisseurs:", error);
      }
    };
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  // Synchroniser les données extraites avec les champs du formulaire
  useEffect(() => {
    if (extractedData) {
      setInvoiceNumber(extractedData.invoiceNumber || "");
      setSupplier(extractedData.supplier || "");
      setDate(extractedData.date || "");
      setCategory(extractedData.category || "");
      setVatRate(extractedData.vatRate?.toString() || "20");
      setAmountHT(extractedData.amountHT?.toString() || "");
      setAmountTVA(extractedData.amountTVA?.toString() || "");
      setAmountTTC(extractedData.amountTTC?.toString() || "");
      setConfidence(extractedData.confidence || 0);
      setProject(extractedData.project || "");
      setCostCenter(extractedData.costCenter || "");
      setLineItems(extractedData.lineItems || []);
    }
  }, [extractedData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 10MB)");
        return;
      }

      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/heic", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Format non supporté. Utilisez PNG, JPG, HEIC ou PDF");
        return;
      }

      setUploadedFile(file);
      
      // Créer une URL d'aperçu pour les images et les PDFs
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      toast.success(`Fichier "${file.name}" chargé`);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleFileUpload(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processInvoiceOCR = async () => {
    if (!uploadedFile) {
      toast.error("Veuillez d'abord uploader un fichier");
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep("processing");
      setProcessingProgress(0);

      const result = await apiClient.parseDocument(uploadedFile, 'INVOICE');
      
      if (result.status === 'LEARNING_NEEDED') {
        // Format inconnu - proposer d'apprendre
        const shouldLearn = window.confirm(
          "Ce format de document est inconnu. Voulez-vous apprendre à l'IA comment le lire ?"
        );
        
        if (shouldLearn) {
          // Rediriger vers AI Lab avec le document pré-chargé
          const documentData = {
            documentId: result.documentId,
            rawData: result.rawData,
            rawText: result.rawText,
            type: 'INVOICE',
          };
          localStorage.setItem('pending_learning', JSON.stringify(documentData));
          window.location.href = '/settings/ai-lab';
          return;
        } else {
          setCurrentStep("upload");
          toast.info("Document non traité. Vous pouvez essayer un autre format.");
          return;
        }
      }
      
      if (result.status === 'SUCCESS' && result.data) {
        // Extraire les données de la facture
        const invoiceData = result.data as any;
        setExtractedData({
          invoiceNumber: invoiceData.invoiceNumber || "",
          supplier: invoiceData.supplierName || "",
          date: invoiceData.date ? new Date(invoiceData.date).toISOString().split('T')[0] : "",
          category: "",
          vatRate: invoiceData.totalTVA && invoiceData.totalHT 
            ? ((invoiceData.totalTVA / invoiceData.totalHT) * 100).toString() 
            : "20",
          amountHT: invoiceData.totalHT?.toString() || "",
          amountTVA: invoiceData.totalTVA?.toString() || "",
          amountTTC: invoiceData.totalTTC?.toString() || "",
          confidence: result.confidence ? Math.round(result.confidence * 100) : 0,
          project: "",
          costCenter: "",
          lineItems: invoiceData.lineItems || [],
        });
        setCurrentStep("verification");
        toast.success(`Facture analysée avec succès (${result.templateName || 'format reconnu'})`);
      }
      
      setProcessingProgress(100);
    } catch (error: any) {
      console.error("Erreur lors du traitement OCR:", error);
      toast.error(error?.message || "Erreur lors de l'extraction OCR");
      setCurrentStep("upload");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSupplier = async () => {
    try {
      const created = await apiClient.createSupplier(newSupplier);
      setSuppliers([...suppliers, created]);
      setSupplierId(created._id || created.id);
      setSupplier(newSupplier.name);
      setShowSupplierDialog(false);
      setNewSupplier({ name: "", email: "", phone: "", address: "", siret: "", vatNumber: "" });
      toast.success("Fournisseur créé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la création du fournisseur");
      console.error(error);
    }
  };

  const handleValidateAndSave = async () => {
    // Calculer les montants depuis les lignes si disponibles
    let calculatedHT = 0;
    let calculatedTVA = 0;
    let calculatedTTC = 0;

    if (lineItems.length > 0) {
      lineItems.forEach(item => {
        const lineHT = item.quantity * item.unitPrice;
        const lineTVA = lineHT * (item.vatRate / 100);
        calculatedHT += lineHT;
        calculatedTVA += lineTVA;
        calculatedTTC += lineHT + lineTVA;
      });
    } else {
      // Utiliser les montants saisis
      calculatedHT = parseFloat(amountHT) || 0;
      calculatedTVA = parseFloat(amountTVA) || 0;
      calculatedTTC = parseFloat(amountTTC) || 0;
    }

    const newExpense = {
      id: `EXP-${Date.now().toString().slice(-3)}`,
      invoiceNumber,
      date,
      supplier: supplierId || supplier,
      supplierId,
      category,
      vatRate: parseFloat(vatRate),
      amountHT: calculatedHT,
      amountTVA: calculatedTVA,
      amountTTC: calculatedTTC,
      currency: "EUR",
      status: "pending" as const,
      documentType: uploadedFile?.type.startsWith("image") ? "Image" : "PDF",
      extractionConfidence: confidence,
      tags: [],
      project,
      costCenter,
      lineItems,
      // Pour le classement GED
      gedCategory: "achats" as const,
      documentUrl: previewUrl, // URL du document pour le GED
    };

    onImportComplete(newExpense);
    toast.success("Facture enregistrée avec succès ! Elle sera classée automatiquement dans le module GED.");
    handleReset();
  };

  const handleReset = () => {
    // Libérer l'URL d'aperçu pour éviter les fuites mémoire
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setCurrentStep("upload");
    setProcessingProgress(0);
    setInvoiceNumber("");
    setSupplier("");
    setSupplierId(null);
    setDate("");
    setCategory("");
    setVatRate("20");
    setAmountHT("");
    setAmountTVA("");
    setAmountTTC("");
    setConfidence(0);
    setZoom(100);
    setRotation(0);
    setProject("");
    setCostCenter("");
    setLineItems([]);
  };

  const handleConnectCloud = (provider: string) => {
    toast.info(`Connexion à ${provider} en cours...`);
    setTimeout(() => {
      toast.success(`Connecté à ${provider} !`);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Importer un Achat
          </DialogTitle>
          <DialogDescription>
            Importez vos achats via plusieurs sources - L'IA extrait automatiquement les données
          </DialogDescription>
        </DialogHeader>

        {currentStep === "verification" && extractedData ? (
          /* Dext-style layout: Document viewer left, Form right */
          <div className="flex h-[calc(95vh-80px)]">
            {/* Left: Document Viewer */}
            <div className="w-1/2 bg-gray-900 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <span className="text-sm text-gray-300">Votre facture</span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white h-8 px-2"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-400 text-sm px-2 flex items-center min-w-[60px] justify-center">
                    {zoom}%
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white h-8 px-2"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-700 mx-1"></div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white h-8 px-2"
                    onClick={() => setRotation((rotation + 90) % 360)}
                    title="Rotation 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white h-8 px-2"
                    onClick={() => setZoom(100)}
                    title="Réinitialiser"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-700 mx-1"></div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white h-8 px-2"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-800">
                {previewUrl && uploadedFile ? (
                  uploadedFile.type === "application/pdf" ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0 shadow-2xl bg-white"
                      style={{
                        minHeight: '600px',
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center center'
                      }}
                      title="PDF Preview"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="shadow-2xl transition-transform duration-200"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  )
                ) : uploadedFile ? (
                  <div className="text-center">
                    <FileText className="h-24 w-24 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-2">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">Chargement de l'aperçu...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="h-24 w-24 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-2">Aucun document sélectionné</p>
                    <p className="text-sm text-gray-500">Glissez-déposez un fichier ou utilisez le bouton d'upload</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details Form */}
            <div className="w-1/2 bg-white flex flex-col">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger 
                    value="details" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                  >
                    Détails
                  </TabsTrigger>
                  <TabsTrigger 
                    value="note"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                  >
                    Note
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-auto p-6 space-y-4 mt-0">
                  {/* Confidence Badge */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Extraction IA</span>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Confiance: {confidence}%
                    </div>
                  </div>

                  {confidence < 90 && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Veuillez vérifier ces informations</p>
                        <p className="text-yellow-700">
                          La confiance de l'extraction est inférieure à 90%.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Numéro de facture *</Label>
                      <Input
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="Ex: FAC-2025-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Date *</Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Fournisseur *</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Select 
                              value={supplierId || ""} 
                              onValueChange={(value) => {
                                const selected = suppliers.find(s => (s._id || s.id) === value);
                                if (selected) {
                                  setSupplierId(value);
                                  setSupplier(selected.name);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un fournisseur existant" />
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
                          <span className="flex items-center text-sm text-muted-foreground">ou</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (supplier) {
                                setNewSupplier({ ...newSupplier, name: supplier });
                              }
                              setShowSupplierDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Créer
                          </Button>
                        </div>
                        <Input
                          value={supplier}
                          onChange={(e) => {
                            setSupplier(e.target.value);
                            // Vérifier si c'est un fournisseur existant
                            const found = suppliers.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                            if (found) {
                              setSupplierId(found._id || found.id);
                            } else {
                              setSupplierId(null);
                            }
                          }}
                          placeholder="Ou saisir le nom du fournisseur"
                        />
                        {!supplierId && supplier && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <p className="text-blue-800 font-medium mb-1">Fournisseur non trouvé</p>
                            <p className="text-blue-700">Ce fournisseur n'existe pas encore. Cliquez sur "Créer" pour l'ajouter.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Catégorie</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lignes d'articles */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Articles de la facture</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLineItems([...lineItems, { article: "", description: "", quantity: 1, unitPrice: 0, vatRate: parseFloat(vatRate) }])}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter une ligne
                        </Button>
                      </div>
                      {lineItems.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-24">Article</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-16">Qté</TableHead>
                                <TableHead className="w-24">Prix unit.</TableHead>
                                <TableHead className="w-20">TVA %</TableHead>
                                <TableHead className="w-24">Total HT</TableHead>
                                <TableHead className="w-10"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {lineItems.map((item, index) => {
                                const lineHT = item.quantity * item.unitPrice;
                                const lineTVA = lineHT * (item.vatRate / 100);
                                const lineTTC = lineHT + lineTVA;
                                
                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Input
                                        value={item.article}
                                        onChange={(e) => {
                                          const updated = [...lineItems];
                                          updated[index].article = e.target.value;
                                          setLineItems(updated);
                                          // Recalculer les totaux
                                          const totalHT = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
                                          const totalTVA = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.vatRate / 100)), 0);
                                          setAmountHT(totalHT.toFixed(2));
                                          setAmountTVA(totalTVA.toFixed(2));
                                          setAmountTTC((totalHT + totalTVA).toFixed(2));
                                        }}
                                        placeholder="Code"
                                        className="h-8"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={item.description}
                                        onChange={(e) => {
                                          const updated = [...lineItems];
                                          updated[index].description = e.target.value;
                                          setLineItems(updated);
                                        }}
                                        placeholder="Description"
                                        className="h-8"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="1"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const updated = [...lineItems];
                                          updated[index].quantity = parseFloat(e.target.value) || 0;
                                          setLineItems(updated);
                                          // Recalculer les totaux
                                          const totalHT = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
                                          const totalTVA = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.vatRate / 100)), 0);
                                          setAmountHT(totalHT.toFixed(2));
                                          setAmountTVA(totalTVA.toFixed(2));
                                          setAmountTTC((totalHT + totalTVA).toFixed(2));
                                        }}
                                        className="h-8"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => {
                                          const updated = [...lineItems];
                                          updated[index].unitPrice = parseFloat(e.target.value) || 0;
                                          setLineItems(updated);
                                          // Recalculer les totaux
                                          const totalHT = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
                                          const totalTVA = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.vatRate / 100)), 0);
                                          setAmountHT(totalHT.toFixed(2));
                                          setAmountTVA(totalTVA.toFixed(2));
                                          setAmountTTC((totalHT + totalTVA).toFixed(2));
                                        }}
                                        className="h-8"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        value={item.vatRate}
                                        onChange={(e) => {
                                          const updated = [...lineItems];
                                          updated[index].vatRate = parseFloat(e.target.value) || 0;
                                          setLineItems(updated);
                                          // Recalculer les totaux
                                          const totalHT = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
                                          const totalTVA = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.vatRate / 100)), 0);
                                          setAmountHT(totalHT.toFixed(2));
                                          setAmountTVA(totalTVA.toFixed(2));
                                          setAmountTTC((totalHT + totalTVA).toFixed(2));
                                        }}
                                        className="h-8"
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {lineHT.toFixed(2)} €
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = lineItems.filter((_, i) => i !== index);
                                          setLineItems(updated);
                                          // Recalculer les totaux
                                          const totalHT = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
                                          const totalTVA = updated.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.vatRate / 100)), 0);
                                          setAmountHT(totalHT.toFixed(2));
                                          setAmountTVA(totalTVA.toFixed(2));
                                          setAmountTTC((totalHT + totalTVA).toFixed(2));
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          <div className="p-3 bg-gray-50 border-t">
                            <div className="flex justify-between items-center text-sm">
                              <span>Total HT:</span>
                              <span className="font-medium">{amountHT || "0.00"} €</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Total TVA:</span>
                              <span className="font-medium">{amountTVA || "0.00"} €</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t mt-2">
                              <span>Total TTC:</span>
                              <span>{amountTTC || "0.00"} €</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                          Aucun article ajouté. Cliquez sur "Ajouter une ligne" pour commencer.
                        </div>
                      )}
                    </div>

                    {/* Montants manuels (si pas de lignes) */}
                    {lineItems.length === 0 && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Montant HT</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={amountHT}
                              onChange={(e) => {
                                setAmountHT(e.target.value);
                                const ht = parseFloat(e.target.value) || 0;
                                const vat = parseFloat(vatRate) || 20;
                                const tva = ht * (vat / 100);
                                setAmountTVA(tva.toFixed(2));
                                setAmountTTC((ht + tva).toFixed(2));
                              }}
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">TVA %</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={vatRate}
                              onChange={(e) => {
                                setVatRate(e.target.value);
                                const ht = parseFloat(amountHT) || 0;
                                const vat = parseFloat(e.target.value) || 20;
                                const tva = ht * (vat / 100);
                                setAmountTVA(tva.toFixed(2));
                                setAmountTTC((ht + tva).toFixed(2));
                              }}
                              placeholder="20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Montant TVA</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={amountTVA}
                              onChange={(e) => setAmountTVA(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Montant TTC</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={amountTTC}
                              onChange={(e) => setAmountTTC(e.target.value)}
                              placeholder="0.00"
                              className="text-lg font-semibold"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm">Projet</Label>
                      <Select value={project} onValueChange={setProject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECTS.map((proj) => (
                            <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Centre de Coûts</Label>
                      <Select value={costCenter} onValueChange={setCostCenter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un centre de coûts" />
                        </SelectTrigger>
                        <SelectContent>
                          {COST_CENTERS.map((cc) => (
                            <SelectItem key={cc} value={cc}>{cc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="note" className="flex-1 overflow-auto p-6 mt-0">
                  <div className="space-y-4">
                    <Label>Notes internes</Label>
                    <Textarea
                      placeholder="Ajoutez des notes sur cette dépense..."
                      rows={10}
                      className="resize-none"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons - Fixed at bottom */}
              <div className="border-t p-4 bg-gray-50 flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={handleValidateAndSave} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!invoiceNumber || !supplier || !date || !category || (!amountTTC && lineItems.length === 0)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload/Processing Steps */
          <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
            <Tabs defaultValue="upload" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Direct
                </TabsTrigger>
                <TabsTrigger value="cloud">
                  <Cloud className="w-4 h-4 mr-2" />
                  Cloud Storage
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Scan Mobile
                </TabsTrigger>
              </TabsList>

              {/* Upload Direct Tab */}
              <TabsContent value="upload" className="space-y-4">
                {currentStep === "upload" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {previewUrl && uploadedFile ? (
                          <div className="space-y-4">
                            <div className="relative w-full max-w-md mx-auto">
                              {uploadedFile.type === "application/pdf" ? (
                                <iframe
                                  src={previewUrl}
                                  className="w-full h-96 rounded-lg border shadow-sm bg-white"
                                  title="PDF Preview"
                                />
                              ) : (
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="w-full rounded-lg border shadow-sm"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm mb-3">
                                <strong>{uploadedFile.name}</strong>
                              </p>
                              <div className="flex gap-2 justify-center">
                                <label htmlFor="file-upload-replace" className="cursor-pointer">
                                  <Button variant="outline" size="sm" asChild>
                                    <span>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Changer
                                    </span>
                                  </Button>
                                </label>
                                <Button 
                                  onClick={processInvoiceOCR}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Analyser avec l'IA
                                </Button>
                              </div>
                              <input
                                id="file-upload-replace"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/heic,application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        ) : uploadedFile ? (
                          <div className="space-y-4">
                            <FileText className="h-20 w-20 mx-auto text-blue-600" />
                            <div>
                              <p className="text-sm mb-3">
                                <strong>{uploadedFile.name}</strong>
                              </p>
                              <div className="flex gap-2 justify-center">
                                <label htmlFor="file-upload-replace-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <span>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Changer
                                    </span>
                                  </Button>
                                </label>
                                <Button 
                                  onClick={processInvoiceOCR}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Analyser avec l'IA
                                </Button>
                              </div>
                              <input
                                id="file-upload-replace-2"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/heic,application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <ImageIcon className="h-20 w-20 mx-auto text-gray-400" />
                            <div>
                              <p className="text-lg mb-2">Glissez-déposez votre fichier ici</p>
                              <p className="text-sm text-muted-foreground mb-4">
                                ou cliquez pour sélectionner
                              </p>
                              <label htmlFor="file-upload">
                                <Button variant="outline" asChild>
                                  <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Sélectionner un fichier
                                  </span>
                                </Button>
                              </label>
                              <input
                                id="file-upload"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/heic,application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <p className="text-xs text-muted-foreground mt-3">
                                PNG, JPG, HEIC ou PDF • Max 10MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === "processing" && (
                  <Card className="border-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        Traitement en cours...
                      </CardTitle>
                      <CardDescription>
                        L'IA analyse votre document
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Progress value={processingProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        {processingProgress}% complété
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Cloud Storage Tab */}
              <TabsContent value="cloud" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Connexion au Cloud</CardTitle>
                    <CardDescription>
                      Connectez vos services de stockage pour importer automatiquement vos factures
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {CLOUD_PROVIDERS.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <provider.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {provider.connected ? "Connecté" : "Non connecté"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={provider.connected ? "outline" : "default"}
                          onClick={() => handleConnectCloud(provider.name)}
                        >
                          {provider.connected ? (
                            <>
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Parcourir
                            </>
                          ) : (
                            "Connecter"
                          )}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Synchronisation Automatique</p>
                        <p className="text-blue-700">
                          Une fois connecté, vous pourrez configurer la synchronisation automatique d'un dossier spécifique. 
                          Toutes les nouvelles factures seront importées et analysées automatiquement.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mobile Scan Tab */}
              <TabsContent value="mobile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Scan Mobile
                    </CardTitle>
                    <CardDescription>
                      Scannez vos factures directement avec votre smartphone
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <div className="w-32 h-32 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Smartphone className="h-16 w-16 text-blue-600" />
                      </div>
                      <h3 className="text-lg mb-2">Application Mobile</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Téléchargez notre application mobile pour scanner vos factures en déplacement
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          App Store
                        </Button>
                        <Button variant="outline">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Google Play
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium mb-1">1. Scannez</p>
                        <p className="text-xs text-muted-foreground">
                          Prenez en photo votre facture
                        </p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium mb-1">2. IA Analyse</p>
                        <p className="text-xs text-muted-foreground">
                          Extraction automatique
                        </p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium mb-1">3. Synchronisé</p>
                        <p className="text-xs text-muted-foreground">
                          Disponible sur le web
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>

      {/* Dialog Création Fournisseur */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Fournisseur</DialogTitle>
            <DialogDescription>
              Créez un nouveau fournisseur pour cette facture
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de l'entreprise *</Label>
              <Input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="Ex: Fournisseur Tech Solutions"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="contact@entreprise.fr"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Textarea
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input
                  value={newSupplier.siret}
                  onChange={(e) => setNewSupplier({ ...newSupplier, siret: e.target.value })}
                  placeholder="123 456 789 00012"
                />
              </div>
              <div className="space-y-2">
                <Label>N° TVA Intracommunautaire</Label>
                <Input
                  value={newSupplier.vatNumber}
                  onChange={(e) => setNewSupplier({ ...newSupplier, vatNumber: e.target.value })}
                  placeholder="FR00000000000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateSupplier}
              disabled={!newSupplier.name}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer le fournisseur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}