import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { AlertTriangle, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InvoiceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    client: string;
    amountHT: number;
    amountTVA: number;
    amountTTC: number;
    status: string;
    items?: any[];
  } | null;
  onDelete: (creditNote: any) => void;
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

export function InvoiceDeleteDialog({ open, onOpenChange, invoice, onDelete }: InvoiceDeleteDialogProps) {
  if (!invoice) return null;

  // Vérifier si c'est un brouillon
  const isDraft = invoice.status.toLowerCase() === 'brouillon' || invoice.status.toLowerCase() === 'draft';

  const handleConfirmDelete = () => {
    if (isDraft) {
      // Brouillon : suppression directe sans créer d'avoir
      onDelete(null);
      
      toast.success(
        <div>
          <div className="font-semibold">Brouillon supprimé !</div>
          <div className="text-sm">Le brouillon {invoice.number} a été supprimé définitivement</div>
        </div>,
        { duration: 3000 }
      );
    } else {
      // Facture émise : créer un avoir d'annulation
      const amountHT = invoice.amountHT;
      const amountTVA = invoice.amountTVA;
      const amountTTC = invoice.amountTTC;

      const creditNoteNumber = generateCreditNoteNumber();
      const creditNote = {
        id: `cn-${Date.now()}`,
        number: creditNoteNumber,
        date: new Date().toISOString().split("T")[0],
        client: invoice.client,
        linkedInvoiceId: invoice.id,
        linkedInvoiceNumber: invoice.number,
        reason: "Suppression de la facture - Annulation totale",
        type: "total",
        items: invoice.items ? invoice.items.map(item => ({
          ...item,
          quantity: -item.quantity
        })) : [],
        amountHT: -amountHT,
        amountTVA: -amountTVA,
        amountTTC: -amountTTC,
        status: "Émis",
        createdAt: new Date().toISOString(),
      };

      onDelete(creditNote);

      toast.success(
        <div>
          <div className="font-semibold">Facture supprimée avec conformité légale !</div>
          <div className="text-sm">• Avoir d'annulation créé : {creditNoteNumber}</div>
          <div className="text-sm">• Montant : {amountTTC.toFixed(2)} €</div>
        </div>,
        { duration: 5000 }
      );
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Suppression {isDraft ? 'du brouillon' : 'de la facture'} {invoice.number}
          </DialogTitle>
          <DialogDescription>
            {isDraft 
              ? 'Suppression définitive du brouillon' 
              : 'Annulation comptable conforme à la législation française'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isDraft ? (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Brouillon :</strong> Ce document n'a pas encore été validé ni envoyé. Il peut être supprimé définitivement sans créer d'avoir.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Attention :</strong> Une facture émise ne peut pas être simplement supprimée selon la législation française (article L.441-9 du Code de commerce).
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Informations de la facture</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numéro :</span>
                <span className="font-medium">{invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client :</span>
                <span className="font-medium">{invoice.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant :</span>
                <span className="font-medium">{invoice.amountTTC.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut :</span>
                <Badge>{invoice.status}</Badge>
              </div>
            </div>
          </div>

          {!isDraft && (
            <>
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
                  <FileText className="w-4 h-4" />
                  Processus d'annulation légale
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-blue-600 text-white shrink-0">1</Badge>
                    <div>
                      <p className="font-medium">Création automatique d'un avoir</p>
                      <p className="text-xs">Un avoir d'annulation totale sera généré pour annuler comptablement la facture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-blue-600 text-white shrink-0">2</Badge>
                    <div>
                      <p className="font-medium">Archivage de la facture</p>
                      <p className="text-xs">La facture originale sera archivée (non supprimée) pour la traçabilité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-blue-600 text-white shrink-0">3</Badge>
                    <div>
                      <p className="font-medium">Liaison comptable</p>
                      <p className="text-xs">L'avoir sera lié à la facture pour assurer la conformité fiscale</p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Conformité assurée :</strong> Ce processus respecte les exigences légales et garantit la traçabilité complète de vos opérations comptables.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDraft ? 'Supprimer définitivement' : 'Confirmer la suppression'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
