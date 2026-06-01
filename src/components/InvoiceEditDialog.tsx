import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Trash2, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { ClientSelectDialog, type Client } from "./ClientSelectDialog";
import { apiClient } from "../lib/api-client-backend";

interface InvoiceItem {
  article: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
}

interface InvoiceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    date: string;
    dueDate: string;
    client: string;
    clientAddress?: string;
    clientEmail?: string;
    orderNumber?: string;
    engagementId?: string;
    items: InvoiceItem[];
    deposit?: number;
    paymentTerms?: string;
    notes?: string;
    status: string;
  } | null;
  onSave: (updatedInvoice: any, creditNote: any) => void;
}

// Fonction pour générer le prochain numéro d'avoir
const generateCreditNoteNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const lastCreditNoteKey = `lastCreditNote_${currentYear}_${currentMonth}`;
  const lastNumber = parseInt(localStorage.getItem(lastCreditNoteKey) || '0');
  const nextNumber = lastNumber + 1;
  
  localStorage.setItem(lastCreditNoteKey, String(nextNumber));
  
  return `AV-${currentYear}-${currentMonth}-${String(nextNumber).padStart(3, '0')}`;
};

// Fonction pour générer le prochain numéro de facture
const generateNextInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const lastInvoiceKey = `lastInvoice_${currentYear}_${currentMonth}`;
  const lastNumber = parseInt(localStorage.getItem(lastInvoiceKey) || '0');
  const nextNumber = lastNumber + 1;
  
  localStorage.setItem(lastInvoiceKey, String(nextNumber));
  
  return `FA-${currentYear}-${currentMonth}-${String(nextNumber).padStart(3, '0')}`;
};

export function InvoiceEditDialog({ open, onOpenChange, invoice, onSave }: InvoiceEditDialogProps) {
  const [step, setStep] = useState<'warning' | 'edit'>('warning');
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "",
    orderNumber: "",
    engagementId: "",
    client: "",
    clientAddress: "",
    clientEmail: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ 
      article: "", 
      description: "", 
      quantity: 1, 
      unitPrice: 0, 
      discount: 0,
      vatRate: 20 
    }],
    deposit: 0,
    paymentTerms: "Pénalités de retard (taux annuel) : 10,00 %\nPas d'escompte en cas de paiement anticipé\nIndemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €",
    notes: "",
  });

  // Charger les clients depuis l'API
  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    try {
      const data = await apiClient.getClients();
      const normalizedClients = Array.isArray(data)
        ? data.map((client: any) => ({
            ...client,
            id: client._id || client.id,
          }))
        : [];
      setClients(normalizedClients);
    } catch (error: any) {
      console.error("Erreur lors du chargement des clients:", error);
      // Ne pas afficher de toast pour éviter le spam
    }
  };

  // Gérer la sélection d'un client
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

  // Pré-remplir le formulaire avec les données de la facture existante
  useEffect(() => {
    if (open && invoice) {
      const newInvoiceNumber = generateNextInvoiceNumber();
      // Trouver le client correspondant
      const client = clients.find(c => c.name === invoice.client);
      if (client) {
        setSelectedClient(client);
      }
      
      setInvoiceForm({
        invoiceNumber: newInvoiceNumber,
        orderNumber: invoice.orderNumber || "",
        engagementId: invoice.engagementId || "",
        client: invoice.client,
        clientAddress: invoice.clientAddress || "",
        clientEmail: invoice.clientEmail || "",
        date: new Date().toISOString().split("T")[0],
        dueDate: invoice.dueDate,
        items: invoice.items || [{ 
          article: "", 
          description: "", 
          quantity: 1, 
          unitPrice: 0, 
          discount: 0,
          vatRate: 20 
        }],
        deposit: invoice.deposit || 0,
        paymentTerms: invoice.paymentTerms || "Pénalités de retard (taux annuel) : 10,00 %\nPas d'escompte en cas de paiement anticipé\nIndemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €",
        notes: invoice.notes || "",
      });
      setStep('warning');
    }
  }, [open, invoice, clients]);

  const handleContinueToEdit = () => {
    setStep('edit');
  };

  const handleSaveChanges = () => {
    if (!invoice) return;

    // Calculer les totaux de l'ancienne facture
    const oldTotalHT = invoice.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * (1 - item.discount / 100)), 0
    );
    const oldTotalTVA = invoice.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      return sum + (lineTotal * item.vatRate / 100);
    }, 0);
    const oldTotalTTC = oldTotalHT + oldTotalTVA;

    // Créer automatiquement l'avoir pour annuler l'ancienne facture
    const creditNoteNumber = generateCreditNoteNumber();
    const creditNote = {
      id: `cn-${Date.now()}`,
      number: creditNoteNumber,
      date: new Date().toISOString().split("T")[0],
      client: invoice.client,
      linkedInvoiceId: invoice.id,
      linkedInvoiceNumber: invoice.number,
      reason: "Modification de la facture - Annulation automatique",
      type: "total",
      items: invoice.items.map(item => ({
        ...item,
        quantity: -item.quantity // Quantités négatives pour l'avoir
      })),
      amountHT: -oldTotalHT,
      amountTVA: -oldTotalTVA,
      amountTTC: -oldTotalTTC,
      status: "Émis",
      createdAt: new Date().toISOString(),
    };

    // Créer la nouvelle facture avec les modifications
    const newInvoice = {
      id: `inv-${Date.now()}`,
      number: invoiceForm.invoiceNumber,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate,
      client: invoiceForm.client,
      clientAddress: invoiceForm.clientAddress,
      clientEmail: invoiceForm.clientEmail,
      orderNumber: invoiceForm.orderNumber,
      engagementId: invoiceForm.engagementId,
      items: invoiceForm.items,
      deposit: invoiceForm.deposit,
      paymentTerms: invoiceForm.paymentTerms,
      notes: `Facture rectificative remplaçant ${invoice.number}\n${invoiceForm.notes}`,
      status: "En attente",
      replacedInvoiceId: invoice.id,
      replacedInvoiceNumber: invoice.number,
      linkedCreditNoteId: creditNote.id,
      linkedCreditNoteNumber: creditNote.number,
    };

    onSave(newInvoice, creditNote);
    
    toast.success(
      <div>
        <div className="font-semibold">Modification comptable effectuée !</div>
        <div className="text-sm">• Avoir créé : {creditNoteNumber}</div>
        <div className="text-sm">• Nouvelle facture : {invoiceForm.invoiceNumber}</div>
      </div>,
      { duration: 5000 }
    );

    onOpenChange(false);
  };

  const totalHT = invoiceForm.items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice * (1 - item.discount / 100)), 0
  );

  const totalTVA = invoiceForm.items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return sum + (lineTotal * item.vatRate / 100);
  }, 0);

  const totalTTC = totalHT + totalTVA;
  const totalToPay = totalTTC - invoiceForm.deposit;

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
        {step === 'warning' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Modification de la facture {invoice.number}
              </DialogTitle>
              <DialogDescription>
                Respect du principe d'intangibilité des factures (article L.441-9 du Code de commerce)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Important :</strong> Une facture émise ne peut pas être modifiée directement selon la législation française.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Processus de modification comptable
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-600 text-white mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Création d'un avoir automatique</p>
                        <p className="text-sm text-muted-foreground">
                          Un avoir sera généré pour annuler comptablement la facture {invoice.number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-6">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-green-600 text-white mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Création d'une nouvelle facture</p>
                        <p className="text-sm text-muted-foreground">
                          Vous pourrez créer une nouvelle facture avec les informations corrigées
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-900">Traçabilité comptable assurée</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ L'avoir et la nouvelle facture seront liés automatiquement</li>
                    <li>✓ La facture originale {invoice.number} restera archivée</li>
                    <li>✓ Conformité avec les exigences fiscales françaises</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleContinueToEdit} className="bg-orange-600 hover:bg-orange-700">
                Continuer la modification
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Modifier la facture
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                  Remplace {invoice.number}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations - Un avoir sera créé automatiquement
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Alert en-tête */}
              <Alert className="border-blue-200 bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Nouveau numéro de facture :</strong> {invoiceForm.invoiceNumber} • 
                  <strong> Avoir d'annulation :</strong> Sera généré automatiquement
                </AlertDescription>
              </Alert>

              {/* Informations de la facture */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Numéro de facture (nouveau)</Label>
                  <Input
                    value={invoiceForm.invoiceNumber}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">N° Commande</Label>
                  <Input
                    id="orderNumber"
                    placeholder="7000080395"
                    value={invoiceForm.orderNumber}
                    onChange={(e) => setInvoiceForm({...invoiceForm, orderNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engagementId">Engagement ID</Label>
                  <Input
                    id="engagementId"
                    placeholder="EX: E-68409882"
                    value={invoiceForm.engagementId}
                    onChange={(e) => setInvoiceForm({...invoiceForm, engagementId: e.target.value})}
                  />
                </div>
              </div>

              {/* Informations client */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Informations client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={selectedClient?.id || ""}
                        onValueChange={(value) => {
                          const client = clients.find(c => c.id === value);
                          if (client) {
                            handleClientSelect(client);
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id || ""}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowClientDialog(true)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nouveau Client
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email client</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="Mercury.Procurement@gds.ey.com"
                      value={invoiceForm.clientEmail}
                      onChange={(e) => setInvoiceForm({...invoiceForm, clientEmail: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="clientAddress">Adresse client</Label>
                    <Textarea
                      id="clientAddress"
                      placeholder="Comptabilité Fournisseurs - Tour First 1-2 place des Saisons Paris"
                      rows={2}
                      value={invoiceForm.clientAddress}
                      onChange={(e) => setInvoiceForm({...invoiceForm, clientAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Lignes de facture */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Lignes de facture</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoiceForm({
                      ...invoiceForm,
                      items: [...invoiceForm.items, { article: "", description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 20 }]
                    })}
                  >
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
                              <Input
                                placeholder="Code"
                                value={item.article}
                                onChange={(e) => {
                                  const newItems = [...invoiceForm.items];
                                  newItems[index].article = e.target.value;
                                  setInvoiceForm({...invoiceForm, items: newItems});
                                }}
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                placeholder="Description détaillée..."
                                value={item.description}
                                rows={2}
                                onChange={(e) => {
                                  const newItems = [...invoiceForm.items];
                                  newItems[index].description = e.target.value;
                                  setInvoiceForm({...invoiceForm, items: newItems});
                                }}
                                className="min-h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...invoiceForm.items];
                                  newItems[index].quantity = parseInt(e.target.value) || 1;
                                  setInvoiceForm({...invoiceForm, items: newItems});
                                }}
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const newItems = [...invoiceForm.items];
                                  newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                  setInvoiceForm({...invoiceForm, items: newItems});
                                }}
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.discount}
                                onChange={(e) => {
                                  const newItems = [...invoiceForm.items];
                                  newItems[index].discount = parseFloat(e.target.value) || 0;
                                  setInvoiceForm({...invoiceForm, items: newItems});
                                }}
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {lineTotal.toFixed(2)} €
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.vatRate}
                                onChange={(e) => {
                                  const newItems = [...invoiceForm.items];
                                  newItems[index].vatRate = parseFloat(e.target.value) || 0;
                                  setInvoiceForm({...invoiceForm, items: newItems});
                                }}
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              {invoiceForm.items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const newItems = invoiceForm.items.filter((_, i) => i !== index);
                                    setInvoiceForm({...invoiceForm, items: newItems});
                                  }}
                                >
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
                      <span className="font-medium">{totalTVA.toFixed(2)} €</span>
                    </div>

                    <div className="flex justify-between items-center gap-4 pt-2 border-t">
                      <div className="flex-1">
                        <Label htmlFor="deposit" className="text-xs text-muted-foreground">Acompte (€)</Label>
                        <Input
                          id="deposit"
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoiceForm.deposit}
                          onChange={(e) => setInvoiceForm({...invoiceForm, deposit: parseFloat(e.target.value) || 0})}
                          className="h-8 mt-1"
                        />
                      </div>
                      <span className="font-medium text-sm pt-5">
                        {invoiceForm.deposit.toFixed(2)} €
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total TTC :</span>
                      <span className="font-medium">{totalTTC.toFixed(2)} €</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total à payer :</span>
                      <span className="font-semibold text-lg text-orange-600">
                        {totalToPay.toFixed(2)} EUR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions de paiement */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                <Textarea
                  id="paymentTerms"
                  rows={3}
                  value={invoiceForm.paymentTerms}
                  onChange={(e) => setInvoiceForm({...invoiceForm, paymentTerms: e.target.value})}
                  className="text-xs"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes complémentaires</Label>
                <Textarea
                  id="notes"
                  placeholder="Informations bancaires, notes diverses..."
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('warning')}>
                Retour
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={handleSaveChanges}
              >
                Valider la modification
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>

      {/* Dialog de sélection/création de client */}
      <ClientSelectDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onSelect={handleClientSelect}
        selectedClientId={selectedClient?.id}
        defaultTab="create"
      />
    </Dialog>
  );
}
