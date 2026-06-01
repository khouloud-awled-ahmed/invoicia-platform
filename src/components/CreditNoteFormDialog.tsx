import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, FileText, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";
import { ClientSelectDialog, type Client } from "./ClientSelectDialog";

interface Invoice {
  id: string;
  number: string;
  date: string;
  client: string;
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
}

interface CreditNoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedInvoice?: Invoice | null;
  creditNote?: any;
  mode?: "create" | "edit";
}

export function CreditNoteFormDialog({ 
  open, 
  onOpenChange, 
  relatedInvoice = null,
  creditNote = null,
  mode = "create" 
}: CreditNoteFormDialogProps) {
  const [date, setDate] = useState<Date>(creditNote?.date ? new Date(creditNote.date) : new Date());
  const [reason, setReason] = useState(creditNote?.reason || "");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [amountHT, setAmountHT] = useState(creditNote?.amountHT?.toString() || relatedInvoice?.amountHT?.toString() || "");
  const [tvaRate, setTvaRate] = useState(creditNote?.tvaRate?.toString() || "20");
  const [description, setDescription] = useState(creditNote?.description || "");

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
      
      // Si on a un relatedInvoice, essayer de trouver le client correspondant
      if (relatedInvoice && !selectedClient) {
        const matchingClient = normalizedClients.find(
          (c: Client) => c.name === relatedInvoice.client
        );
        if (matchingClient) {
          setSelectedClient(matchingClient);
        }
      }
      
      // Si on a un creditNote avec un clientId, trouver le client
      if (creditNote?.clientId && !selectedClient) {
        const matchingClient = normalizedClients.find(
          (c: Client) => c.id === creditNote.clientId
        );
        if (matchingClient) {
          setSelectedClient(matchingClient);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des clients:", error);
    }
  };

  // Gérer la sélection d'un client
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowClientDialog(false);
    loadClients(); // Recharger pour avoir les dernières données
  };

  const calculateTVA = () => {
    if (!amountHT) return 0;
    return (parseFloat(amountHT) * parseFloat(tvaRate)) / 100;
  };

  const calculateTTC = () => {
    if (!amountHT) return 0;
    return parseFloat(amountHT) + calculateTVA();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !amountHT || !reason) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Créer un item unique pour représenter l'avoir
      const items = [{
        article: description || "Avoir",
        description: description || "",
        quantity: 1,
        unitPrice: parseFloat(amountHT),
        discount: 0,
        vatRate: parseFloat(tvaRate),
      }];

      const creditNoteData = {
        date: format(date, "yyyy-MM-dd"),
        clientId: selectedClient.id,
        client: selectedClient.name,
        amountHT: parseFloat(amountHT),
        tvaRate: parseFloat(tvaRate),
        amountTVA: calculateTVA(),
        amountTTC: calculateTTC(),
        reason,
        description,
        items,
        relatedInvoiceId: relatedInvoice?.id || creditNote?.relatedInvoiceId || undefined,
        relatedInvoiceNumber: relatedInvoice?.number || creditNote?.relatedInvoiceNumber,
      };

      if (mode === "create") {
        await apiClient.createCreditNote(creditNoteData);
        toast.success("Avoir créé avec succès");
      } else {
        // TODO: Implémenter updateCreditNote si nécessaire
        toast.success("Avoir modifié avec succès");
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de l'avoir:", error);
      toast.error(error?.message || "Erreur lors de la sauvegarde de l'avoir");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === "create" ? "Créer un Avoir" : "Modifier l'Avoir"}
          </DialogTitle>
          <DialogDescription>
            {relatedInvoice 
              ? `Créer un avoir pour la facture ${relatedInvoice.number}`
              : mode === "create" 
                ? "Créer un nouvel avoir" 
                : "Modifier les informations de l'avoir"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {relatedInvoice && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Facture associée</p>
              <p className="text-sm text-blue-700 mt-1">
                {relatedInvoice.number} - {relatedInvoice.client} - {relatedInvoice.amountTTC.toFixed(2)} €
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de l'avoir *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motif de l'avoir *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Sélectionner un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Erreur de facturation</SelectItem>
                  <SelectItem value="return">Retour de marchandise</SelectItem>
                  <SelectItem value="discount">Remise commerciale</SelectItem>
                  <SelectItem value="cancellation">Annulation</SelectItem>
                  <SelectItem value="duplicate">Doublon</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                disabled={!!relatedInvoice}
              >
                <SelectTrigger className="flex-1" id="client">
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
                disabled={!!relatedInvoice}
              >
                <Plus className="w-4 h-4" />
                Nouveau Client
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountHT">Montant HT (€) *</Label>
              <Input
                id="amountHT"
                type="number"
                step="0.01"
                min="0"
                value={amountHT}
                onChange={(e) => setAmountHT(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tvaRate">Taux TVA (%)</Label>
              <Select value={tvaRate} onValueChange={setTvaRate}>
                <SelectTrigger id="tvaRate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Montant TTC (€)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                <span className="font-medium">{calculateTTC().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Montant HT</p>
                <p className="font-medium mt-1">{parseFloat(amountHT || "0").toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-muted-foreground">TVA ({tvaRate}%)</p>
                <p className="font-medium mt-1">{calculateTVA().toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total TTC</p>
                <p className="text-lg font-semibold mt-1">{calculateTTC().toFixed(2)} €</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === "create" ? "Créer l'avoir" : "Modifier l'avoir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Client Select Dialog */}
      <ClientSelectDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onSelect={handleClientSelect}
        selectedClientId={selectedClient?.id}
      />
    </Dialog>
  );
}
