import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Search, Loader2, Building2, Link2 } from "lucide-react";

interface Institution {
  id: string;
  name: string;
  logo?: string;
  bic?: string;
  country?: string;
}

interface BankSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankSelectionModal({ open, onOpenChange }: BankSelectionModalProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadInstitutions();
    }
  }, [open]);

  useEffect(() => {
    // Filtrer les institutions selon le terme de recherche
    if (!searchTerm.trim()) {
      setFilteredInstitutions(institutions);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredInstitutions(
        institutions.filter(
          (inst) =>
            inst.name.toLowerCase().includes(term) ||
            inst.bic?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, institutions]);

  const loadInstitutions = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getBankingInstitutions('FR');
      setInstitutions(data);
      setFilteredInstitutions(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement des banques:", error);
      toast.error(error?.message || "Erreur lors du chargement de la liste des banques");
      setInstitutions([]);
      setFilteredInstitutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBank = async (institution: Institution) => {
    setIsConnecting(institution.id);
    try {
      // Générer l'URL de connexion OAuth
      const { url, state } = await apiClient.generateBankConnectUrl(
        institution.id,
        'GOCARDLESS' // Par défaut GoCardless pour l'instant
      );

      // Stocker le state dans localStorage pour la vérification au retour
      localStorage.setItem('banking_oauth_state', state);

      // Rediriger vers l'URL OAuth de l'agrégateur
      window.location.href = url;
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      toast.error(error?.message || "Erreur lors de la connexion à la banque");
      setIsConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choisissez votre banque</DialogTitle>
          <DialogDescription>
            Sélectionnez votre banque pour connecter votre compte en toute sécurité
          </DialogDescription>
        </DialogHeader>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher une banque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste des banques */}
        <div className="flex-1 overflow-auto border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des banques...</span>
            </div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm ? "Aucune banque trouvée" : "Aucune banque disponible"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
              {filteredInstitutions.map((institution) => (
                <Button
                  key={institution.id}
                  variant="outline"
                  className="h-auto p-4 flex items-center justify-start gap-3 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSelectBank(institution)}
                  disabled={isConnecting === institution.id}
                >
                  {isConnecting === institution.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : institution.logo ? (
                    <img
                      src={institution.logo}
                      alt={institution.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback si le logo ne charge pas
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium">{institution.name}</p>
                    {institution.bic && (
                      <p className="text-xs text-muted-foreground">BIC: {institution.bic}</p>
                    )}
                  </div>
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Information de sécurité */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 border-t">
          <p className="font-medium mb-1">🔒 Sécurité</p>
          <p>
            Vous serez redirigé vers votre banque pour vous authentifier.
            Nous ne stockons jamais vos identifiants bancaires.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
