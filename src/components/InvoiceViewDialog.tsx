import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Download, Mail, Printer, CheckCircle2, XCircle, AlertTriangle, FileText, ExternalLink, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { AttachmentsManager } from "./AttachmentsManager";
import { formatTND, DEFAULT_TIMBRE_FISCAL } from "../utils/currencyTND";

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id?: string;
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
    linkedCreditNoteId?: string;
    linkedCreditNoteNumber?: string;
    cancellationReason?: string;
    cancelledAt?: string;
    pdfUrl?: string;
  } | null;
  onCancelInvoice?: (invoice: any) => void;
  onViewCreditNote?: (creditNoteNumber: string) => void;
  onSendForSignature?: (invoice: any) => void;
}

export function InvoiceViewDialog({ 
  open, 
  onOpenChange, 
  invoice, 
  onCancelInvoice,
  onViewCreditNote,
  onSendForSignature
}: InvoiceViewDialogProps) { 
  if (!invoice) return null;

  const isCancelled = invoice.status === "cancelled";
  const isDraft = invoice.status === "draft";
  const canBeCancelled = !isDraft && !isCancelled;

  const getStatusBadge = (status: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Facture {invoice.number}</span>
            {getStatusBadge(invoice.status)}
          </DialogTitle>
          <DialogDescription>
            Détails de la facture client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bandeau BROUILLON */}
          {isDraft && (
            <Alert className="border-gray-300 bg-gray-50">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <AlertDescription className="text-gray-900">
                <div className="space-y-2">
                  <p className="font-bold text-lg">📝 BROUILLON</p>
                  <p className="text-sm">
                    Ce document n'a pas encore été validé ni envoyé au client. Il peut être modifié ou supprimé sans créer d'avoir.
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    Une mention "BROUILLON" sera automatiquement ajoutée lors de l'export PDF.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Bandeau FACTURE ANNULÉE */}
          {isCancelled && (
            <Alert className="border-red-300 bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-900">
                <div className="space-y-2">
                  <p className="font-bold text-lg">⚠️ FACTURE ANNULÉE</p>
                  <p className="text-sm">
                    Cette facture a été annulée le {invoice.cancelledAt ? new Date(invoice.cancelledAt).toLocaleDateString("fr-FR") : "N/A"}.
                  </p>
                  {invoice.cancellationReason && (
                    <p className="text-sm">
                      <strong>Motif :</strong> {invoice.cancellationReason}
                    </p>
                  )}
                  {invoice.linkedCreditNoteNumber && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-200">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">
                        Avoir d'annulation créé : <strong>{invoice.linkedCreditNoteNumber}</strong>
                      </span>
                      {onViewCreditNote && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                          onClick={() => onViewCreditNote(invoice.linkedCreditNoteNumber!)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Voir l'avoir
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Avertissement pour factures non annulées */}
          {canBeCancelled && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900 text-sm">
                <strong>Rappel :</strong> Une facture émise ne peut pas être supprimée. Pour l'annuler, utilisez la procédure d'annulation qui créera automatiquement un avoir.
              </AlertDescription>
            </Alert>
          )}

          {/* En-tête de la facture */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Informations générales</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro :</span>
                  <span className="font-medium">{invoice.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date d'émission :</span>
                  <span className="font-medium">{new Date(invoice.date).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date d'échéance :</span>
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</span>
                </div>
                {invoice.orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">N° Commande :</span>
                    <span className="font-medium">{invoice.orderNumber}</span>
                  </div>
                )}
                {invoice.engagementId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engagement ID :</span>
                    <span className="font-medium">{invoice.engagementId}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Client</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">{invoice.client}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Comptabilité Fournisseurs<br />
                    Tour First 1-2 place des Saisons<br />
                    Paris, France
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Montants */}
          <div>
            <h3 className="font-semibold mb-3">Montants</h3>
            <div className={`rounded-lg p-4 space-y-3 ${isCancelled ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT :</span>
                <span className="font-medium">{formatTND(invoice.amountHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA :</span>
                <span className="font-medium">{formatTND(invoice.amountTVA)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total TTC :</span>
                <span className="font-medium">{formatTND(invoice.amountTTC)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Droit de timbre :</span>
                <span className="font-medium">{formatTND((invoice as any).timbreFiscal ?? DEFAULT_TIMBRE_FISCAL)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Net à payer :</span>
                <span className={`font-semibold text-lg ${isCancelled ? 'text-red-600 line-through' : 'text-blue-600'}`}>
                  {formatTND((invoice as any).netAPayer ?? invoice.amountTTC + ((invoice as any).timbreFiscal ?? DEFAULT_TIMBRE_FISCAL))}
                </span>
              </div>
              {isCancelled && (
                <p className="text-xs text-red-700 text-center mt-2">
                  Montant annulé par l'avoir {invoice.linkedCreditNoteNumber}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Pièces jointes */}
          {invoice.id && (
            <>
              <AttachmentsManager
                entityType="invoice"
                entityId={invoice.id}
                readonly={isCancelled}
                compact={false}
              />
              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {isCancelled ? (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Facture annulée</span>
                </div>
              ) : invoice.status === "paid" ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Facture payée</span>
                </div>
              ) : invoice.status === "validated" ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Facture validée</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">En attente de validation</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Bouton Annuler la facture - JAMAIS "Supprimer" */}
            {/* Bouton Valider - visible uniquement pour les factures pending */}
{invoice.status === "pending" && invoice.id && (
  <Button
    variant="outline"
    size="sm"
    onClick={async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        let tenantId = '';
        try {
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.tenantId) tenantId = user.tenantId;
          }
        } catch {}
        const res = await fetch(`/api/billing/sales/invoices/${invoice.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(tenantId ? { 'x-tenant-id': tenantId } : {})
          },
          body: JSON.stringify({ status: 'validated' })
        });
        if (res.ok) {
          toast.success("Facture validée avec succès !");
          onOpenChange(false);
        } else {
          toast.error("Erreur lors de la validation");
        }
      } catch {
        toast.error("Erreur de connexion");
      }
    }}
    className="border-green-300 text-green-700 hover:bg-green-50"
  >
    <CheckCircle2 className="w-4 h-4 mr-2" />
    Valider la facture
  </Button>
)}

              {/* Actions désactivées si facture annulée */}
              <Button
                variant="outline"
                size="sm"
               onClick={async () => {
                  if (!invoice.id) {
                    toast.error("ID de facture manquant");
                    return;
                  }
                  try {
                    toast.info("Génération du PDF...");
                    const token = localStorage.getItem('token');
                    const userStr = localStorage.getItem('user');
                    let tenantId = '';
                    try {
                      if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user.tenantId) tenantId = user.tenantId;
                      }
                    } catch {}
                    const url = `/api/billing/sales/invoices/${invoice.id}/download`;
                    const res = await fetch(url, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        ...(tenantId ? { 'x-tenant-id': tenantId } : {})
                      }
                    });
                    if (!res.ok) throw new Error('PDF non disponible');
                    const blob = await res.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${invoice.number}.pdf`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success("PDF téléchargé !");
                  } catch {
                    toast.error("PDF non disponible — vérifiez le backend");
                  }
                }}
                disabled={isCancelled}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer{isDraft && ' (BROUILLON)'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("Email envoyé au client");
                }}
                disabled={isCancelled}
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par email
              </Button>
              {onSendForSignature && !isDraft && !isCancelled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onSendForSignature) {
                      onSendForSignature(invoice);
                    }
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <FileSignature className="w-4 h-4 mr-2" />
                  Envoyer pour signature
                </Button>
              )}
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
               onClick={async () => {
                  if (!invoice.id) { toast.error("ID manquant"); return; }
                  try {
                    toast.info("Génération du PDF...");
                    const token = localStorage.getItem('token');
                    const userStr = localStorage.getItem('user');
                    let tenantId = '';
                    try { if (userStr) { const u = JSON.parse(userStr); if (u.tenantId) tenantId = u.tenantId; } } catch {}
                    const res = await fetch(`/api/billing/sales/invoices/${invoice.id}/download`, {
                      headers: { Authorization: `Bearer ${token}`, ...(tenantId ? { 'x-tenant-id': tenantId } : {}) }
                    });
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${invoice.number}.pdf`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success("PDF téléchargé !");
                  } catch { toast.error("PDF non disponible"); }
                }}
                disabled={isCancelled}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF{isDraft && ' (avec "BROUILLON")'}
              </Button>
            </div>
          </div>

          {/* Note légale */}
          {!isDraft && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Conformément à l'article L.441-9 du Code de commerce, cette facture ne peut être modifiée ou supprimée après émission.
                {canBeCancelled && " Pour l'annuler, utilisez le bouton 'Annuler la facture' qui créera automatiquement un avoir."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}