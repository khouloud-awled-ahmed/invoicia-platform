import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Trash2, Upload, RefreshCw, Loader2, FileText, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ClientSelectDialog, type Client } from "./ClientSelectDialog";
import { apiClient } from "../lib/api-client-backend";
import { formatTND, DEFAULT_TIMBRE_FISCAL, roundMillimes } from "../utils/currencyTND";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: (invoice: any) => void;
  invoiceToDuplicate?: {
    id: string;
    number: string;
    date: string;
    dueDate: string;
    client: string;
    amountHT: number;
    amountTVA: number;
    amountTTC: number;
    status: string;
    orderNumber?: string;
    engagementId?: string;
  } | null;
}

// Fonction pour générer le prochain numéro de facture
const generateNextInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const lastInvoiceKey = `lastInvoice_${currentYear}_${currentMonth}`;
  const lastNumber = parseInt(localStorage.getItem(lastInvoiceKey) || '0');
  const nextNumber = lastNumber + 1;
  return `FA-${currentYear}-${currentMonth}-${String(nextNumber).padStart(3, '0')}`;
};

const saveInvoiceNumber = (invoiceNumber: string) => {
  const match = invoiceNumber.match(/FA-(\d{4})-(\d{2})-(\d{3})/);
  if (match) {
    const [, year, month, number] = match;
    const key = `lastInvoice_${year}_${month}`;
    const currentLast = parseInt(localStorage.getItem(key) || '0');
    const newNumber = parseInt(number);
    if (newNumber > currentLast) {
      localStorage.setItem(key, number);
    }
  }
};

// ─── AI Scanner ──────────────────────────────────────────────────────────────

type ScanStatus = "idle" | "uploading" | "scanning" | "done" | "error";

interface ScannedInvoice {
  invoiceNumber?: string;
  orderNumber?: string;
  engagementId?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  date?: string;
  dueDate?: string;
  items?: {
    article?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    discount?: number;
    vatRate?: number;
  }[];
  notes?: string;
}

async function scanInvoiceWithAI(file: File): Promise<ScannedInvoice> {
  const backendUrl = import.meta.env.VITE_AI_SCANNER_URL || "http://localhost:8000";
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let tenantId = "";
  try { if (userStr) { const u = JSON.parse(userStr); tenantId = u.tenantId || ""; } } catch {}
  const headers: any = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;
  const response = await fetch(`${backendUrl}/scan`, { method: "POST", body: formData });
  if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.message || "Erreur scan"); }
  return response.json();
}















// ─── Component ───────────────────────────────────────────────────────────────

export function InvoiceFormDialog({ open, onOpenChange, onInvoiceCreated, invoiceToDuplicate }: InvoiceFormProps) {
  const [isManualNumber, setIsManualNumber] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "",
    orderNumber: "",
    engagementId: "",
    client: "",
    clientAddress: "",
    clientEmail: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ article: "", description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 20 }],
    deposit: 0,
    paymentTerms: "Pénalités de retard (taux annuel) : 10,00 %\nPas d'escompte en cas de paiement anticipé\nIndemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €",
    notes: "",
  });

  const [showAIImport, setShowAIImport] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // AI Scanner state
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedInvoice | null>(null);
  const [scanError, setScanError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) loadClients();
  }, [open]);

  const loadClients = async () => {
    try {
      const data = await apiClient.getClients();
      const normalizedClients = Array.isArray(data)
        ? data.map((client: any) => ({ ...client, id: client._id || client.id }))
        : [];
      setClients(normalizedClients);
    } catch (error: any) {
      console.error("Erreur lors du chargement des clients:", error);
    }
  };

  useEffect(() => {
    if (open && !isManualNumber) {
      setInvoiceForm(prev => ({ ...prev, invoiceNumber: generateNextInvoiceNumber() }));
    }
  }, [open, isManualNumber]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setInvoiceForm(prev => ({
      ...prev,
      client: client.name,
      clientEmail: client.email || "",
      clientAddress: client.address || "",
    }));
    loadClients();
  };

  const handleSaveInvoice = async (status: 'draft' | 'pending' = 'draft') => {
    if (isSaving) return;
    if (!invoiceForm.client || invoiceForm.client.trim() === '') { toast.error('Veuillez sélectionner un client'); return; }
    if (!invoiceForm.invoiceNumber || invoiceForm.invoiceNumber.trim() === '') { toast.error('Veuillez saisir un numéro de facture'); return; }
    if (!selectedClient) { toast.error('Veuillez sélectionner un client valide'); return; }

    let dueDate = invoiceForm.dueDate;
    if (!dueDate) {
      const date = new Date(invoiceForm.date);
      date.setDate(date.getDate() + 30);
      dueDate = date.toISOString().split('T')[0];
    }

    try {
      const invoiceData = {
        number: invoiceForm.invoiceNumber,
        date: invoiceForm.date,
        dueDate,
        clientId: selectedClient.id,
        client: invoiceForm.client,
        clientAddress: invoiceForm.clientAddress || undefined,
        clientEmail: invoiceForm.clientEmail || undefined,
        orderNumber: invoiceForm.orderNumber || undefined,
        engagementId: invoiceForm.engagementId || undefined,
        items: invoiceForm.items.map(item => ({
          article: item.article || item.description || 'Article',
          description: item.description || item.article || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          vatRate: item.vatRate || 20,
        })),
        deposit: invoiceForm.deposit || 0,
        paymentTerms: invoiceForm.paymentTerms || undefined,
        notes: invoiceForm.notes || undefined,
        status,
      };

      const createdInvoice = await apiClient.createInvoice(invoiceData);
      saveInvoiceNumber(invoiceForm.invoiceNumber);
      toast.success(status === 'draft' ? 'Facture enregistrée comme brouillon' : 'Facture créée avec succès');
      if (onInvoiceCreated) onInvoiceCreated(createdInvoice);

      setInvoiceForm({
        invoiceNumber: "", orderNumber: "", engagementId: "", client: "", clientAddress: "", clientEmail: "",
        date: new Date().toISOString().split("T")[0], dueDate: "",
        items: [{ article: "", description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 20 }],
        deposit: 0,
        paymentTerms: "Pénalités de retard (taux annuel) : 10,00 %\nPas d'escompte en cas de paiement anticipé\nIndemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €",
        notes: "",
      });
      setSelectedClient(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la facture:', error);
      if (error?.message && error.message.includes('existe déjà')) {
        const newNumber = generateNextInvoiceNumber();
        setInvoiceForm(prev => ({ ...prev, invoiceNumber: newNumber }));
        toast.error(`Le numéro ${invoiceForm.invoiceNumber} existe déjà. Nouveau numéro généré : ${newNumber}. Réessayez.`);
      } else {
        toast.error(error?.message || error?.error || 'Erreur lors de la sauvegarde de la facture');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (open && invoiceToDuplicate) {
      const nextNumber = generateNextInvoiceNumber();
      const today = new Date().toISOString().split("T")[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setInvoiceForm({
        ...invoiceForm, invoiceNumber: nextNumber,
        orderNumber: invoiceToDuplicate.orderNumber || "",
        engagementId: invoiceToDuplicate.engagementId || "",
        client: invoiceToDuplicate.client,
        date: today, dueDate: dueDate.toISOString().split("T")[0],
        items: [{ article: "", description: "Prestations (dupliquée de " + invoiceToDuplicate.number + ")", quantity: 1, unitPrice: invoiceToDuplicate.amountHT, discount: 0, vatRate: 20 }],
      });
      toast.success(`Facture ${invoiceToDuplicate.number} dupliquée - Nouveau numéro: ${nextNumber}`);
    }
  }, [open, invoiceToDuplicate]);

  const handleToggleManualNumber = () => {
    const newManualMode = !isManualNumber;
    setIsManualNumber(newManualMode);
    if (!newManualMode) {
      setInvoiceForm(prev => ({ ...prev, invoiceNumber: generateNextInvoiceNumber() }));
      toast.info("Numéro de facture automatique généré");
    } else {
      toast.info("Mode manuel activé - Vous pouvez forcer le numéro");
    }
  };

  const handleRegenerateNumber = () => {
    const nextNumber = generateNextInvoiceNumber();
    setInvoiceForm(prev => ({ ...prev, invoiceNumber: nextNumber }));
    toast.success("Nouveau numéro généré : " + nextNumber);
  };

  // ── AI Scanner handlers ──────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 MB)");
      return;
    }
    setScanFile(file);
    setScanStatus("idle");
    setScanResult(null);
    setScanError("");

    // Preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setScanPreview(url);
    } else {
      setScanPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleScan = async () => {
    if (!scanFile) return;
    setScanStatus("scanning");
    setScanError("");
    try {
      const result = await scanInvoiceWithAI(scanFile);
      setScanResult(result);
      setScanStatus("done");
    } catch (err: any) {
      setScanError(err.message || "Erreur lors du scan");
      setScanStatus("error");
    }
  };

  const handleApplyScan = () => {
    if (!scanResult) return;

    setInvoiceForm(prev => ({
      ...prev,
      invoiceNumber: scanResult.invoiceNumber || prev.invoiceNumber,
      orderNumber: scanResult.orderNumber || prev.orderNumber,
      engagementId: scanResult.engagementId || prev.engagementId,
      client: scanResult.clientName || prev.client,
      clientEmail: scanResult.clientEmail || prev.clientEmail,
      clientAddress: scanResult.clientAddress || prev.clientAddress,
      date: scanResult.date || prev.date,
      dueDate: scanResult.dueDate || prev.dueDate,
      notes: scanResult.notes || prev.notes,
      items: scanResult.items && scanResult.items.length > 0
        ? scanResult.items.map(item => ({
            article: item.article || "",
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            discount: item.discount || 0,
            vatRate: item.vatRate || 20,
          }))
        : prev.items,
    }));

    // Reset scanner state
    setScanStatus("idle");
    setScanFile(null);
    setScanPreview(null);
    setScanResult(null);
    setShowAIImport(false);

    toast.success("Facture importée avec succès !");
  };

  const handleCloseScanner = () => {
    setShowAIImport(false);
    setScanStatus("idle");
    setScanFile(null);
    setScanPreview(null);
    setScanResult(null);
    setScanError("");
  };

  const totalHT = invoiceForm.items.reduce((sum, item) =>
    sum + (item.quantity * item.unitPrice * (1 - item.discount / 100)), 0);
  const totalTVA = invoiceForm.items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return sum + (lineTotal * item.vatRate / 100);
  }, 0);
  const totalTTC = totalHT + totalTVA;
  const totalToPay = totalTTC - invoiceForm.deposit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                Créer une nouvelle facture
                {invoiceToDuplicate && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <Plus className="w-3 h-3 mr-1" />
                    Dupliquée de {invoiceToDuplicate.number}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de la facture client
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIImport(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Scanner avec l'IA
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations de la facture */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Numéro de facture</Label>
              <Input
                id="invoiceNumber"
                placeholder="FA-2025-XXX"
                value={invoiceForm.invoiceNumber}
                onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                disabled={!isManualNumber}
              />
              <div className="flex items-center">
                <Checkbox id="manualNumber" checked={isManualNumber} onCheckedChange={handleToggleManualNumber} />
                <Label htmlFor="manualNumber" className="ml-2">Mode manuel</Label>
              </div>
              <div className="flex items-center">
                <Button type="button" variant="outline" size="sm" onClick={handleRegenerateNumber} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Régénérer
                </Button>
                <Badge variant={isManualNumber ? "secondary" : "default"} className="ml-2">
                  {isManualNumber ? "Manuel" : "Automatique"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderNumber">N° Commande</Label>
              <Input id="orderNumber" placeholder="7000080395" value={invoiceForm.orderNumber} onChange={(e) => setInvoiceForm({...invoiceForm, orderNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engagementId">Engagement ID</Label>
              <Input id="engagementId" placeholder="EX: E-68409882" value={invoiceForm.engagementId} onChange={(e) => setInvoiceForm({...invoiceForm, engagementId: e.target.value})} />
            </div>
          </div>

          {/* Informations client */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Informations client</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <div className="flex gap-2">
                  <Select value={selectedClient?.id || ""} onValueChange={(value) => {
                    const client = clients.find(c => c.id === value);
                    if (client) handleClientSelect(client);
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id || ""}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowClientDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau Client
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email client</Label>
                <Input id="clientEmail" type="email" placeholder="Mercury.Procurement@gds.ey.com" value={invoiceForm.clientEmail} onChange={(e) => setInvoiceForm({...invoiceForm, clientEmail: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="clientAddress">Adresse client</Label>
                <Textarea id="clientAddress" placeholder="Comptabilité Fournisseurs - Tour First 1-2 place des Saisons Paris" rows={2} value={invoiceForm.clientAddress} onChange={(e) => setInvoiceForm({...invoiceForm, clientAddress: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={invoiceForm.date} onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance *</Label>
              <Input id="dueDate" type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} />
            </div>
          </div>

          {/* Lignes de facture */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Lignes de facture</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setInvoiceForm({ ...invoiceForm, items: [...invoiceForm.items, { article: "", description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 20 }] })}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une ligne
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-32">Article</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="w-20">QTE</TableHead>
                    <TableHead className="w-28">Prix unit.</TableHead>
                    <TableHead className="w-24">Remise %</TableHead>
                    <TableHead className="w-28">Total HT</TableHead>
                    <TableHead className="w-20">TVA %</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceForm.items.map((item, index) => {
                    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Input placeholder="Code" value={item.article} onChange={(e) => { const newItems = [...invoiceForm.items]; newItems[index].article = e.target.value; setInvoiceForm({...invoiceForm, items: newItems}); }} className="h-9" />
                        </TableCell>
                        <TableCell>
                          <Textarea placeholder="Description détaillée..." value={item.description} rows={2} onChange={(e) => { const newItems = [...invoiceForm.items]; newItems[index].description = e.target.value; setInvoiceForm({...invoiceForm, items: newItems}); }} className="min-h-9" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min="1" value={item.quantity} onChange={(e) => { const newItems = [...invoiceForm.items]; newItems[index].quantity = parseInt(e.target.value) || 1; setInvoiceForm({...invoiceForm, items: newItems}); }} className="h-9" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => { const newItems = [...invoiceForm.items]; newItems[index].unitPrice = parseFloat(e.target.value) || 0; setInvoiceForm({...invoiceForm, items: newItems}); }} className="h-9" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min="0" max="100" step="0.01" value={item.discount} onChange={(e) => { const newItems = [...invoiceForm.items]; newItems[index].discount = parseFloat(e.target.value) || 0; setInvoiceForm({...invoiceForm, items: newItems}); }} className="h-9" />
                        </TableCell>
                        <TableCell className="font-medium">{formatTND(roundMillimes(lineTotal))}</TableCell>
                        <TableCell>
                          <Input type="number" min="0" max="100" step="0.01" value={item.vatRate} onChange={(e) => { const newItems = [...invoiceForm.items]; newItems[index].vatRate = parseFloat(e.target.value) || 0; setInvoiceForm({...invoiceForm, items: newItems}); }} className="h-9" />
                        </TableCell>
                        <TableCell>
                          {invoiceForm.items.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const newItems = invoiceForm.items.filter((_, i) => i !== index); setInvoiceForm({...invoiceForm, items: newItems}); }}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end pt-4 border-t">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT :</span>
                  <span className="font-medium">{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total TVA :</span>
                  <span className="font-medium">{formatTND(roundMillimes(totalTVA))}</span>
                </div>
                <div className="flex justify-between items-center gap-4 pt-2 border-t">
                  <div className="flex-1">
                    <Label htmlFor="deposit" className="text-xs text-muted-foreground">Acompte (€)</Label>
                    <Input id="deposit" type="number" min="0" step="0.01" value={invoiceForm.deposit} onChange={(e) => setInvoiceForm({...invoiceForm, deposit: parseFloat(e.target.value) || 0})} className="h-8 mt-1" />
                  </div>
                  <span className="font-medium text-sm pt-5">{formatTND(roundMillimes(invoiceForm.deposit))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total TTC :</span>
                  <span className="font-medium">{formatTND(roundMillimes(totalTTC))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Droit de timbre :</span>
                  <span className="font-medium">{formatTND(DEFAULT_TIMBRE_FISCAL)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Net à payer :</span>
                  <span className="font-semibold text-lg text-orange-600">{formatTND(roundMillimes(totalToPay) + DEFAULT_TIMBRE_FISCAL)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions de paiement */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="paymentTerms">Conditions de paiement</Label>
            <Textarea id="paymentTerms" rows={3} value={invoiceForm.paymentTerms} onChange={(e) => setInvoiceForm({...invoiceForm, paymentTerms: e.target.value})} className="text-xs" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes complémentaires (optionnel)</Label>
            <Textarea id="notes" placeholder="Informations bancaires, notes diverses..." rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="outline" onClick={() => handleSaveInvoice('draft')} disabled={isSaving}>
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : "Enregistrer comme brouillon"}
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => handleSaveInvoice('pending')} disabled={isSaving}>
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création...</> : "Créer la facture"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <ClientSelectDialog open={showClientDialog} onOpenChange={setShowClientDialog} onSelect={handleClientSelect} selectedClientId={selectedClient?.id} defaultTab="create" />

      {/* ── AI Scanner Dialog ── */}
      <Dialog open={showAIImport} onOpenChange={handleCloseScanner}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-600" />
              Scanner une facture avec l'IA
            </DialogTitle>
            <DialogDescription>
              Uploadez une image ou un PDF de facture pour extraire automatiquement les données
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !scanFile && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${scanFile ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-400 hover:bg-orange-50/50"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {!scanFile ? (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium mb-1">Glissez-déposez votre facture ici</p>
                  <p className="text-xs text-muted-foreground mb-3">ou cliquez pour sélectionner un fichier</p>
                  <Button variant="outline" size="sm" type="button">Parcourir les fichiers</Button>
                  <p className="text-xs text-muted-foreground mt-3">PDF, JPG, PNG — max 10 MB</p>
                </>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  {/* Preview or icon */}
                  {scanPreview ? (
                    <img src={scanPreview} alt="aperçu" className="h-20 w-20 object-cover rounded border" />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center bg-orange-100 rounded border border-orange-200">
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-orange-700">{scanFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(scanFile.size / 1024).toFixed(0)} KB</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-7 text-xs text-red-500 hover:text-red-700 px-2"
                      onClick={(e) => { e.stopPropagation(); setScanFile(null); setScanPreview(null); setScanStatus("idle"); setScanResult(null); }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Scanning state */}
            {scanStatus === "scanning" && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Analyse en cours…</p>
                  <p className="text-xs text-blue-600">Claude lit et extrait les données de votre facture</p>
                </div>
              </div>
            )}

            {/* Error */}
            {scanStatus === "error" && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur lors du scan</p>
                  <p className="text-xs text-red-600">{scanError}</p>
                </div>
              </div>
            )}

            {/* Results preview */}
            {scanStatus === "done" && scanResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-800">Données extraites avec succès</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  {scanResult.invoiceNumber && <><span className="text-muted-foreground">N° Facture :</span><span className="font-medium">{scanResult.invoiceNumber}</span></>}
                  {scanResult.clientName && <><span className="text-muted-foreground">Client :</span><span className="font-medium">{scanResult.clientName}</span></>}
                  {scanResult.date && <><span className="text-muted-foreground">Date :</span><span className="font-medium">{scanResult.date}</span></>}
                  {scanResult.dueDate && <><span className="text-muted-foreground">Échéance :</span><span className="font-medium">{scanResult.dueDate}</span></>}
                  {scanResult.orderNumber && <><span className="text-muted-foreground">N° Commande :</span><span className="font-medium">{scanResult.orderNumber}</span></>}
                  {scanResult.clientEmail && <><span className="text-muted-foreground">Email :</span><span className="font-medium truncate">{scanResult.clientEmail}</span></>}
                </div>
                {scanResult.items && scanResult.items.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-xs text-muted-foreground mb-1">{scanResult.items.length} ligne(s) de facture détectée(s)</p>
                    {scanResult.items.slice(0, 2).map((item, i) => (
                      <p key={i} className="text-xs text-green-800 truncate">• {item.description || item.article} — {item.quantity} × {item.unitPrice}</p>
                    ))}
                    {scanResult.items.length > 2 && <p className="text-xs text-muted-foreground">+ {scanResult.items.length - 2} autres…</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseScanner}>Annuler</Button>
            {scanStatus !== "done" ? (
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={handleScan}
                disabled={!scanFile || scanStatus === "scanning"}
              >
                {scanStatus === "scanning" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse en cours…</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" />Scanner et extraire</>
                )}
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApplyScan}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Importer dans le formulaire
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}






