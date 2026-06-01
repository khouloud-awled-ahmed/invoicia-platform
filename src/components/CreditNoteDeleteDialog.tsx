import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client-backend";

interface CreditNote {
  id: string;
  number: string;
  client: string;
  amountTTC: number;
}

interface CreditNoteDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote: CreditNote | null;
  onDeleted?: () => void;
}

export function CreditNoteDeleteDialog({
  open,
  onOpenChange,
  creditNote,
  onDeleted,
}: CreditNoteDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!creditNote) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiClient.deleteCreditNote(creditNote.id);
      toast.success(`Avoir ${creditNote.number} supprimé avec succès`);
      onOpenChange(false);
      onDeleted?.(); // Refresh the list
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 mt-2">
              <p>Êtes-vous sûr de vouloir supprimer l'avoir suivant ?</p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-900">{creditNote.number}</p>
                <p className="text-sm text-red-700 mt-1">
                  {creditNote.client} - {creditNote.amountTTC.toFixed(2)} €
                </p>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Cette action est irréversible et peut avoir des impacts comptables.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? "Suppression..." : "Supprimer l'avoir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}