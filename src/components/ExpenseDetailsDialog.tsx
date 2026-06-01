import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  FileText,
  Calendar,
  Building2,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Download,
  Edit,
  Sparkles,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { AttachmentsManager } from "./AttachmentsManager";

interface ExpenseDetailsDialogProps {
  expense: any;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (id: string) => void;
}

export function ExpenseDetailsDialog({ 
  expense, 
  isOpen, 
  onClose, 
  onValidate 
}: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails de la Dépense
          </DialogTitle>
          <DialogDescription>
            {expense.id} • {expense.supplier}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {expense.status === "pending" && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  En attente de validation
                </Badge>
              )}
              {expense.status === "verified" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  Validée
                </Badge>
              )}
              {expense.status === "exported" && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  Exportée
                </Badge>
              )}
            </div>
            {expense.extractionConfidence && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  Confiance IA: <strong>{expense.extractionConfidence}%</strong>
                </span>
              </div>
            )}
          </div>

          {/* Duplicate Warning */}
          {expense.isDuplicate && (
            <Card className="border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 mb-1">Duplicata Possible Détecté</p>
                    <p className="text-sm text-red-700">
                      Cette dépense semble similaire à une autre dépense déjà enregistrée. 
                      Veuillez vérifier avant de valider.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Information */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Fournisseur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{expense.supplier}</p>
                <p className="text-sm text-muted-foreground mt-1">{expense.category}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {new Date(expense.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Amounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Montants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Montant HT</span>
                <span className="font-medium">{expense.amountHT.toFixed(2)} {expense.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span className="font-medium">{expense.amountTVA.toFixed(2)} {expense.currency}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Montant TTC</span>
                <span className="text-xl font-bold text-blue-600">
                  {expense.amountTTC.toFixed(2)} {expense.currency}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-4">
            {expense.paymentMethod && (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Mode de paiement</p>
                  <p className="text-sm font-medium">{expense.paymentMethod}</p>
                </div>
              </div>
            )}

            {expense.documentType && (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type de document</p>
                  <p className="text-sm font-medium">{expense.documentType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {expense.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Preview */}
          {expense.documentType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document Original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {expense.documentType} • Document scanné
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le document
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{expense.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Pièces jointes */}
          <AttachmentsManager
            entityType="purchase_invoice"
            entityId={expense.id}
            readonly={expense.status === "exported"}
            compact={false}
          />
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fermer
            </Button>
            {expense.status === "pending" && (
              <>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  onClick={() => onValidate(expense.id)} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}