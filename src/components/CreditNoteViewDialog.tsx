import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { FileText, Download, Printer, Mail, Calendar, User, FileCheck, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import { AttachmentsManager } from "./AttachmentsManager";

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
  relatedInvoiceNumber?: string;
  tvaRate: number;
}

interface CreditNoteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote: CreditNote | null;
  onViewInvoice?: (invoiceNumber: string) => void;
}

export function CreditNoteViewDialog({ open, onOpenChange, creditNote, onViewInvoice }: CreditNoteViewDialogProps) {
  if (!creditNote) return null;

  const getStatusBadge = (status: CreditNote["status"]) => {
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

  const handleDownloadPDF = () => {
    toast.info("Préparation du téléchargement...");
    setTimeout(() => {
      toast.success(`PDF ${creditNote.number} téléchargé avec succès`);
    }, 1000);
  };

  const handlePrint = () => {
    toast.info("Ouverture de l'aperçu avant impression...");
  };

  const handleSendByEmail = () => {
    toast.info("Préparation de l'envoi par email...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Avoir {creditNote.number}
          </DialogTitle>
          <DialogDescription>
            Détails complets de l'avoir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{creditNote.number}</h3>
              <p className="text-sm text-muted-foreground">
                Émis le {new Date(creditNote.date).toLocaleDateString("fr-FR")}
              </p>
            </div>
            {getStatusBadge(creditNote.status)}
          </div>

          {/* Lien vers facture originale - Bandeau visuel */}
          {creditNote.relatedInvoiceNumber && (
            <Alert className="border-blue-200 bg-blue-50">
              <Link2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Avoir lié à la facture {creditNote.relatedInvoiceNumber}</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Cet avoir annule totalement ou partiellement la facture originale
                    </p>
                  </div>
                  {onViewInvoice && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => onViewInvoice(creditNote.relatedInvoiceNumber!)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Voir la facture
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Client & Invoice Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Client
              </div>
              <p className="font-medium">{creditNote.client}</p>
            </div>

            {creditNote.relatedInvoiceNumber && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileCheck className="h-4 w-4" />
                  Facture associée
                </div>
                <p className="font-medium">{creditNote.relatedInvoiceNumber}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Amounts */}
          <div className="space-y-4">
            <h4 className="font-medium">Montants</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Montant HT</span>
                <span className="font-medium">{creditNote.amountHT.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">TVA ({creditNote.tvaRate}%)</span>
                <span className="font-medium">{creditNote.amountTVA.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <span className="font-semibold text-blue-900">Total TTC</span>
                <span className="text-xl font-bold text-blue-900">{creditNote.amountTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pièces jointes */}
          <AttachmentsManager
            entityType="credit_note"
            entityId={creditNote.id}
            readonly={creditNote.status === "applied"}
            compact={false}
          />

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={handleSendByEmail} variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Envoyer par Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}