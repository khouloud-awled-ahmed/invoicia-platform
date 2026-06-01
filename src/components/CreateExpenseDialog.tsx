import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

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

const PAYMENT_METHODS = [
  "Virement bancaire",
  "Carte bancaire",
  "Espèces",
  "Chèque",
  "Prélèvement automatique",
];

const TVA_RATES = [0, 7, 13, 19];

interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateExpenseDialog({ open, onOpenChange, onCreated }: CreateExpenseDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [amountHT, setAmountHT] = useState("");
  const [tvaRate, setTvaRate] = useState("19");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateTVA = () => {
    if (!amountHT) return 0;
    return parseFloat(amountHT) * (parseFloat(tvaRate) / 100);
  };

  const calculateTTC = () => {
    if (!amountHT) return 0;
    return parseFloat(amountHT) + calculateTVA();
  };

  const resetForm = () => {
    setDate(new Date());
    setSupplier("");
    setCategory("");
    setAmountHT("");
    setTvaRate("19");
    setPaymentMethod("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier || !category || !amountHT) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const ht = parseFloat(amountHT) || 0;
      const tva = calculateTVA();
      const ttc = calculateTTC();

      await apiClient.createExpense({
        date: format(date, "yyyy-MM-dd"),
        supplier,
        category,
        amountHT: ht,
        amountTVA: Math.round(tva * 1000) / 1000,
        amountTTC: Math.round(ttc * 1000) / 1000,
        currency: "TND",
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
        status: "pending",
      });

      toast.success("Dépense créée avec succès");
      resetForm();
      onOpenChange(false);
      onCreated?.();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Créer un Achat
          </DialogTitle>
          <DialogDescription>
            Saisir manuellement une dépense ou facture d'achat
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date + Fournisseur */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: fr })}
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
              <Label htmlFor="supplier">Fournisseur *</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nom du fournisseur"
                required
              />
            </div>
          </div>

          {/* Catégorie + Moyen de paiement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
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

            <div className="space-y-2">
              <Label>Moyen de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountHT">Montant HT (TND) *</Label>
              <Input
                id="amountHT"
                type="number"
                step="0.001"
                min="0"
                value={amountHT}
                onChange={(e) => setAmountHT(e.target.value)}
                placeholder="0.000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Taux TVA (%)</Label>
              <Select value={tvaRate} onValueChange={setTvaRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TVA_RATES.map((r) => (
                    <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Montant TTC (TND)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center font-medium">
                {calculateTTC().toFixed(3)}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Montant HT</p>
                <p className="font-medium mt-1">{parseFloat(amountHT || "0").toFixed(3)} TND</p>
              </div>
              <div>
                <p className="text-muted-foreground">TVA ({tvaRate}%)</p>
                <p className="font-medium mt-1">{calculateTVA().toFixed(3)} TND</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total TTC</p>
                <p className="text-lg font-semibold mt-1">{calculateTTC().toFixed(3)} TND</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Création..." : "Créer l'achat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}