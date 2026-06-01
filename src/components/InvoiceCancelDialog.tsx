import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AlertTriangle, FileText, XCircle, CheckCircle2, FileMinus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface InvoiceCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    date: string;
    client: string;
    amountHT: number;
    amountTVA: number;
    amountTTC: number;
    status: string;
  } | null;
  onCancel: (invoice: any, creditNote: any, reason: string) => void;
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

export function InvoiceCancelDialog({ open, onOpenChange, invoice, onCancel }: InvoiceCancelDialogProps) {
  const [cancellationReason, setCancellationReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!invoice) return null;

  // Vérifier si la facture peut être annulée (ne doit pas être un brouillon)
  const canBeCancelled = invoice.status !== "draft" && invoice.status !== "cancelled";

  const handleConfirmCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Veuillez saisir un motif d'annulation");
      return;
    }

    if (cancellationReason.trim().length < 10) {
      toast.error("Le motif doit contenir au moins 10 caractères");
      return;
    }

    setIsProcessing(true);

    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Créer automatiquement l'avoir d'annulation
    const creditNoteNumber = generateCreditNoteNumber();
    const today = new Date().toISOString().split("T")[0];

    const creditNote = {
      id: `cn-${Date.now()}`,
      number: creditNoteNumber,
      date: today,
      client: invoice.client,
      amountHT: invoice.amountHT,
      amountTVA: invoice.amountTVA,
      amountTTC: invoice.amountTTC,
      status: "validated" as const,
      reason: "cancellation",
      description: cancellationReason.trim(),
      relatedInvoiceId: invoice.id,
      relatedInvoiceNumber: invoice.number,
      tvaRate: (invoice.amountTVA / invoice.amountHT) * 100,
      createdAt: new Date().toISOString(),
    };

    // Mettre à jour la facture avec le statut "cancelled"
    const cancelledInvoice = {
      ...invoice,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancellationReason: cancellationReason.trim(),
      linkedCreditNoteId: creditNote.id,
      linkedCreditNoteNumber: creditNote.number,
    };

    onCancel(cancelledInvoice, creditNote, cancellationReason.trim());

    toast.success(
      <div className="space-y-1">
        <div className="font-semibold">✅ Facture annulée avec succès !</div>
        <div className="text-sm">• Facture {invoice.number} → Statut "Annulée"</div>
        <div className="text-sm">• Avoir {creditNoteNumber} créé automatiquement</div>
        <div className="text-sm">• Montant : {invoice.amountTTC.toFixed(2)} €</div>
      </div>,
      { duration: 6000 }
    );

    setIsProcessing(false);
    setCancellationReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <XCircle className="w-6 h-6" />
            Confirmer l'annulation de la facture {invoice.number}
          </DialogTitle>
          <DialogDescription>
            Procédure d'annulation conforme à la législation fiscale française
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Alerte d'information */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <strong>Important :</strong> L'annulation d'une facture émise nécessite la création d'un avoir correspondant pour des raisons de conformité fiscale. La facture originale sera marquée comme "Annulée" et un nouvel avoir sera généré automatiquement.
            </AlertDescription>
          </Alert>

          {/* Informations de la facture */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Informations de la facture à annuler
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro :</span>
                  <span className="font-medium">{invoice.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date d'émission :</span>
                  <span className="font-medium">{new Date(invoice.date).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client :</span>
                  <span className="font-medium">{invoice.client}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant HT :</span>
                  <span className="font-medium">{invoice.amountHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA :</span>
                  <span className="font-medium">{invoice.amountTVA.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total TTC :</span>
                  <span className="font-semibold text-blue-600">{invoice.amountTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Processus d'annulation */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
              <CheckCircle2 className="w-5 h-5" />
              Processus d'annulation automatique
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-600 text-white shrink-0 w-8 h-8 flex items-center justify-center rounded-full">1</Badge>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-blue-900">Changement de statut de la facture</p>
                  <p className="text-sm text-blue-700 mt-1">
                    La facture {invoice.number} passera du statut <Badge variant="outline" className="mx-1">{invoice.status}</Badge> 
                    au statut <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 mx-1">Annulée</Badge>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-blue-600 text-white shrink-0 w-8 h-8 flex items-center justify-center rounded-full">2</Badge>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-blue-900">Création automatique d'un avoir</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Un avoir sera généré avec :
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Numéro : AV-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-XXX</li>
                    <li>Montant : {invoice.amountTTC.toFixed(2)} € (identique à la facture)</li>
                    <li>Référence à la facture originale : {invoice.number}</li>
                    <li>Statut : Validé</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-blue-600 text-white shrink-0 w-8 h-8 flex items-center justify-center rounded-full">3</Badge>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-blue-900">Liaison bidirectionnelle</p>
                  <p className="text-sm text-blue-700 mt-1">
                    La facture et l'avoir seront liés entre eux pour assurer la traçabilité complète
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Motif d'annulation - OBLIGATOIRE */}
          <div className="space-y-2">
            <Label htmlFor="cancellationReason" className="flex items-center gap-2">
              <span className="text-red-600">*</span>
              Motif de l'annulation (obligatoire)
            </Label>
            <Textarea
              id="cancellationReason"
              placeholder="Veuillez préciser le motif de l'annulation (exemples : erreur de facturation, prestation annulée par le client, double facturation, montant incorrect...)"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères • {cancellationReason.length}/200 caractères
            </p>
          </div>

          {/* Exemples de motifs */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <p className="text-sm font-medium mb-2">Exemples de motifs courants :</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Erreur de montant",
                "Prestation annulée par le client",
                "Double facturation",
                "Erreur sur le taux de TVA",
                "Modification du périmètre de prestation",
                "Erreur de destinataire"
              ].map((example) => (
                <Badge
                  key={example}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => setCancellationReason(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          {/* Conformité légale */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 text-sm">
              <strong>Conformité fiscale assurée :</strong> Ce processus respecte le principe d'inaltérabilité des factures (article L.441-9 du Code de commerce) et garantit la traçabilité complète de vos opérations comptables.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setCancellationReason("");
              onOpenChange(false);
            }}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmCancel}
            disabled={!cancellationReason.trim() || cancellationReason.trim().length < 10 || isProcessing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Traitement en cours...
              </>
            ) : (
              <>
                <FileMinus className="w-4 h-4 mr-2" />
                Confirmer l'annulation et créer l'avoir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
