import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
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
import { Plus, Edit, Trash2, Mail, Phone, User, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ClientContact {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: 'principal' | 'commercial' | 'comptable' | 'technique' | 'autre';
  isPrimary: boolean;
  position?: string;
  notes?: string;
}

interface ClientContactsManagerProps {
  contacts: ClientContact[];
  onUpdate: (contacts: ClientContact[]) => void;
  readonly?: boolean;
}

const contactTypeLabels: Record<ClientContact['type'], string> = {
  principal: 'Principal',
  commercial: 'Commercial',
  comptable: 'Comptable',
  technique: 'Technique',
  autre: 'Autre',
};

const contactTypeColors: Record<ClientContact['type'], string> = {
  principal: 'bg-blue-100 text-blue-800',
  commercial: 'bg-green-100 text-green-800',
  comptable: 'bg-purple-100 text-purple-800',
  technique: 'bg-orange-100 text-orange-800',
  autre: 'bg-gray-100 text-gray-800',
};

export function ClientContactsManager({ contacts, onUpdate, readonly = false }: ClientContactsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null);
  
  const [contactForm, setContactForm] = useState<ClientContact>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "autre",
    isPrimary: false,
    position: "",
    notes: "",
  });

  const handleCreate = () => {
    setSelectedContact(null);
    setContactForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      type: "autre",
      isPrimary: false,
      position: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (contact: ClientContact) => {
    setSelectedContact(contact);
    setContactForm({ ...contact });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      toast.error("Le prénom, nom et email sont requis");
      return;
    }

    let updatedContacts: ClientContact[];
    
    if (selectedContact) {
      // Mise à jour
      updatedContacts = contacts.map(c => 
        c._id === selectedContact._id ? contactForm : c
      );
    } else {
      // Création
      const newContact: ClientContact = {
        ...contactForm,
        _id: `contact_${Date.now()}`,
      };
      updatedContacts = [...contacts, newContact];
    }

    // S'assurer qu'il n'y a qu'un seul contact principal
    if (contactForm.isPrimary) {
      updatedContacts = updatedContacts.map(c => 
        c._id !== contactForm._id ? { ...c, isPrimary: false } : c
      );
    }

    onUpdate(updatedContacts);
    setIsDialogOpen(false);
    toast.success(selectedContact ? "Contact mis à jour" : "Contact ajouté");
  };

  const handleDeleteClick = (contact: ClientContact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedContact) return;

    const updatedContacts = contacts.filter(c => c._id !== selectedContact._id);
    onUpdate(updatedContacts);
    setIsDeleteDialogOpen(false);
    toast.success("Contact supprimé");
  };

  const primaryContact = contacts.find(c => c.isPrimary);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les contacts du client (principal + multiples)
          </p>
        </div>
        {!readonly && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un contact
          </Button>
        )}
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          Aucun contact. Ajoutez un contact principal pour commencer.
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">
                    {contact.firstName} {contact.lastName}
                    {contact.isPrimary && (
                      <Star className="w-4 h-4 inline-block ml-2 fill-yellow-400 text-yellow-400" />
                    )}
                  </h4>
                  <Badge className={contactTypeColors[contact.type]}>
                    {contactTypeLabels[contact.type]}
                  </Badge>
                </div>
                {contact.position && (
                  <p className="text-sm text-muted-foreground mb-2">{contact.position}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              {!readonly && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(contact)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContact ? "Modifier le contact" : "Nouveau contact"}</DialogTitle>
            <DialogDescription>
              {selectedContact ? "Modifiez les informations du contact" : "Ajoutez un nouveau contact"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de contact *</Label>
                <Select
                  value={contactForm.type}
                  onValueChange={(value: ClientContact['type']) =>
                    setContactForm({ ...contactForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="comptable">Comptable</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  value={contactForm.position}
                  onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPrimary" className="cursor-pointer">
                  Contact principal (administratif)
                </Label>
              </div>
              {primaryContact && !contactForm.isPrimary && primaryContact._id !== selectedContact?._id && (
                <p className="text-xs text-muted-foreground">
                  Contact principal actuel : {primaryContact.firstName} {primaryContact.lastName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {selectedContact ? "Enregistrer" : "Ajouter"}
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
              Êtes-vous sûr de vouloir supprimer le contact "{selectedContact?.firstName} {selectedContact?.lastName}" ?
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
