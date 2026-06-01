import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
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
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Building2, Loader2, FileText, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";
import type { Client } from "./ClientSelectDialog";
import { ClientContactsManager, type ClientContact } from "./ClientContactsManager";

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [clientForm, setClientForm] = useState<Partial<Client>>({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    siret: "",
    vatNumber: "",
  });
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getClients();
      // Normaliser les IDs
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

  const handleCreate = () => {
    setSelectedClient(null);
    setClientForm({
      name: "",
      businessName: "",
      email: "",
      phone: "",
      address: "",
      siret: "",
      vatNumber: "",
    });
    setClientContacts([]);
    setIsDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setClientForm({
      name: client.name,
      businessName: client.businessName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      siret: client.siret || "",
      vatNumber: client.vatNumber || "",
    });
    // Charger les contacts depuis le client
    setClientContacts((client as any).contacts || []);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!clientForm.name || clientForm.name.trim() === "") {
      toast.error("Le nom du client est requis");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedClient?.id) {
        // Mise à jour
        await apiClient.updateClient(selectedClient.id, {
          name: clientForm.name,
          businessName: clientForm.businessName || undefined,
          email: clientForm.email || undefined,
          phone: clientForm.phone || undefined,
          address: clientForm.address || undefined,
          siret: clientForm.siret || undefined,
          vatNumber: clientForm.vatNumber || undefined,
          contacts: clientContacts,
        });
        toast.success("Client mis à jour avec succès");
      } else {
        // Création
        await apiClient.createClient({
          name: clientForm.name,
          businessName: clientForm.businessName || undefined,
          email: clientForm.email || undefined,
          phone: clientForm.phone || undefined,
          address: clientForm.address || undefined,
          siret: clientForm.siret || undefined,
          vatNumber: clientForm.vatNumber || undefined,
          contacts: clientContacts,
        });
        toast.success("Client créé avec succès");
      }
      setIsDialogOpen(false);
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde du client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedClient?.id) return;

    try {
      await apiClient.deleteClient(selectedClient.id);
      toast.success("Client supprimé avec succès");
      setIsDeleteDialogOpen(false);
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du client");
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des clients</h1>
          <p className="text-muted-foreground">Gérez vos clients et leurs informations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Informations légales</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.businessName && (
                            <p className="text-sm text-muted-foreground">{client.businessName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{client.phone}</span>
                            </div>
                          )}
                          {client.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{client.address}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.siret && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">SIRET: {client.siret}</span>
                            </div>
                          )}
                          {client.vatNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">TVA: {client.vatNumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(client)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Aucun client trouvé" : "Aucun client. Créez-en un pour commencer."}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClient ? "Modifier le client" : "Nouveau client"}</DialogTitle>
            <DialogDescription>
              {selectedClient ? "Modifiez les informations du client" : "Ajoutez les informations du nouveau client"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du client *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Entreprise ABC"
                  value={clientForm.name || ""}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Raison sociale</Label>
                <Input
                  id="businessName"
                  placeholder="Raison sociale"
                  value={clientForm.businessName || ""}
                  onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
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
                  value={clientForm.email || ""}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  value={clientForm.phone || ""}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="123 Rue de Paris, 75001 Paris"
                value={clientForm.address || ""}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  placeholder="123 456 789 00012"
                  value={clientForm.siret || ""}
                  onChange={(e) => setClientForm({ ...clientForm, siret: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">N° TVA intracommunautaire</Label>
                <Input
                  id="vatNumber"
                  placeholder="FR 12 345678901"
                  value={clientForm.vatNumber || ""}
                  onChange={(e) => setClientForm({ ...clientForm, vatNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Gestion des contacts */}
            <div className="border-t pt-4">
              <ClientContactsManager
                contacts={clientContacts}
                onUpdate={setClientContacts}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le client "{selectedClient?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
