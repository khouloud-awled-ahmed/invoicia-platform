import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Search, Filter, Eye, Edit, Trash2, MoreVertical, Download, Plus, CheckCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

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
  relatedInvoiceId?: string;
  relatedInvoiceNumber?: string;
  tvaRate: number;
}

interface CreditNotesTabContentProps {
  filteredCreditNotes: CreditNote[];
  totalCreditNotes: number;
  creditNoteSearchTerm: string;
  setCreditNoteSearchTerm: (value: string) => void;
  creditNoteStatusFilter: string;
  setCreditNoteStatusFilter: (value: string) => void;
  getCreditNoteStatusBadge: (status: CreditNote["status"]) => JSX.Element;
  getReasonLabel: (reason: string) => string;
  handleViewCreditNote: (creditNote: CreditNote) => void;
  handleEditCreditNote: (creditNote: CreditNote) => void;
  handleDeleteCreditNote: (creditNote: CreditNote) => void;
  setShowCreditNoteDialog: (value: boolean) => void;
  setRelatedInvoiceForCreditNote: (invoice: null) => void;
  onRefresh?: () => void;
}

export function CreditNotesTabContent({
  filteredCreditNotes,
  totalCreditNotes,
  creditNoteSearchTerm,
  setCreditNoteSearchTerm,
  creditNoteStatusFilter,
  setCreditNoteStatusFilter,
  getCreditNoteStatusBadge,
  getReasonLabel,
  handleViewCreditNote,
  handleEditCreditNote,
  handleDeleteCreditNote,
  setShowCreditNoteDialog,
  setRelatedInvoiceForCreditNote,
  onRefresh,
}: CreditNotesTabContentProps) {

  const handleValidate = async (creditNote: CreditNote) => {
    try {
      await apiClient.request(`/billing/sales/credit-notes/${creditNote.id}/validate`, {
        method: 'PATCH',
      });
      toast.success(`Avoir ${creditNote.number} validé avec succès`);
      onRefresh?.();
    } catch (error: any) {
      toast.error(`Erreur lors de la validation: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Gestion des Avoirs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredCreditNotes.length} avoir(s) • Total: {totalCreditNotes.toFixed(2)} €
          </p>
        </div>
        <Button
          onClick={() => {
            setRelatedInvoiceForCreditNote(null);
            setShowCreditNoteDialog(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un Avoir
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, client ou facture..."
                  value={creditNoteSearchTerm}
                  onChange={(e) => setCreditNoteSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={creditNoteStatusFilter} onValueChange={setCreditNoteStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="validated">Validés</SelectItem>
                <SelectItem value="sent">Envoyés</SelectItem>
                <SelectItem value="applied">Appliqués</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setCreditNoteSearchTerm("");
                setCreditNoteStatusFilter("all");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Facture liée</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead className="text-right">Montant HT</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreditNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Aucun avoir trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredCreditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{creditNote.number}</TableCell>
                    <TableCell>{new Date(creditNote.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{creditNote.client}</TableCell>
                    <TableCell>
                      {creditNote.relatedInvoiceNumber ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {creditNote.relatedInvoiceNumber}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getReasonLabel(creditNote.reason)}</span>
                    </TableCell>
                    <TableCell className="text-right">{(creditNote.amountHT || 0).toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{(creditNote.amountTVA || 0).toFixed(2)} €</TableCell>
                    <TableCell className="text-right font-medium">{(creditNote.amountTTC || 0).toFixed(2)} €</TableCell>
                    <TableCell>{getCreditNoteStatusBadge(creditNote.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCreditNote(creditNote)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          {creditNote.status === "draft" && (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleValidate(creditNote)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Valider
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditCreditNote(creditNote)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Éditer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {/* Download PDF */}}>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCreditNote(creditNote)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}