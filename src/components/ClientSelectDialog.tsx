import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

export interface Client {
  _id?: string;
  id?: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  siret?: string;
  vatNumber?: string;
}

interface ClientSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (client: Client) => void;
  selectedClientId?: string;
  defaultTab?: "select" | "create";
}

export function ClientSelectDialog({ open, onOpenChange, onSelect, selectedClientId, defaultTab = "select" }: ClientSelectDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"select" | "create">(defaultTab);
  
  // Formulaire pour créer un nouveau client
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    siret: "",
    vatNumber: "",
  });

  // Charger les clients depuis l'API
  useEffect(() => {
    if (open) {
      loadClients();
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getClients();
      // Normaliser les IDs (backend utilise _id, frontend peut utiliser id)
      const normalizedClients = Array.isArray(data)
        ? data.map((client: any) => ({
            ...client,
            id: client._id || client.id,
          }))
        : [];
      setClients(normalizedClients);
    } catch (error: any) {
      console.error("Erreur lors du chargement des clients:", error);
      const errorMessage = error?.message || "Erreur lors du chargement des clients";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name || newClient.name.trim() === "") {
      toast.error("Le nom du client est requis");
      return;
    }

    setIsCreating(true);
    try {
      const created = await apiClient.createClient({
        name: newClient.name,
        businessName: newClient.businessName || undefined,
        email: newClient.email || undefined,
        phone: newClient.phone || undefined,
        address: newClient.address || undefined,
        siret: newClient.siret || undefined,
        vatNumber: newClient.vatNumber || undefined,
      });

      // Normaliser l'ID
      const normalizedClient: Client = {
        ...created,
        id: created._id || created.id,
      };

      toast.success("Client créé avec succès");
      
      // Sélectionner automatiquement le nouveau client
      onSelect(normalizedClient);
      onOpenChange(false);
      
      // Réinitialiser le formulaire
      setNewClient({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        address: "",
        siret: "",
        vatNumber: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      toast.error("Erreur lors de la création du client");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    onSelect(client);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner ou créer un client</DialogTitle>
          <DialogDescription>
            Choisissez un client existant ou créez-en un nouveau
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "select" | "create")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Sélectionner</TabsTrigger>
            <TabsTrigger value="create">Créer nouveau</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Liste des clients */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Aucun client trouvé" : "Aucun client disponible"}
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className={`
                      p-4 border rounded-lg cursor-pointer transition-colors
                      hover:bg-accent hover:border-primary
                      ${selectedClientId === client.id ? "bg-accent border-primary" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        {client.businessName && (
                          <p className="text-sm text-muted-foreground">{client.businessName}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          {client.email && (
                            <p className="text-xs text-muted-foreground">📧 {client.email}</p>
                          )}
                          {client.phone && (
                            <p className="text-xs text-muted-foreground">📞 {client.phone}</p>
                          )}
                          {client.address && (
                            <p className="text-xs text-muted-foreground">📍 {client.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du client *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Entreprise ABC"
                    value={newClient.name || ""}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Raison sociale</Label>
                  <Input
                    id="businessName"
                    placeholder="Raison sociale"
                    value={newClient.businessName || ""}
                    onChange={(e) => setNewClient({ ...newClient, businessName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@entreprise.fr"
                    value={newClient.email || ""}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    value={newClient.phone || ""}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="123 Rue de Paris, 75001 Paris"
                  value={newClient.address || ""}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    placeholder="123 456 789 00012"
                    value={newClient.siret || ""}
                    onChange={(e) => setNewClient({ ...newClient, siret: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber">N° TVA intracommunautaire</Label>
                  <Input
                    id="vatNumber"
                    placeholder="FR 12 345678901"
                    value={newClient.vatNumber || ""}
                    onChange={(e) => setNewClient({ ...newClient, vatNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateClient} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer et sélectionner
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
