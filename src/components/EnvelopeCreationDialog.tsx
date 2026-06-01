import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Plus, X, Upload, ArrowUp, ArrowDown, Users, Mail, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

interface EnvelopeCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => void;
}

interface Signer {
  name: string;
  email: string;
  role: string;
  order: number;
  signatureRequired: boolean; // true = doit signer, false = copie seulement
}

interface DocumentFile {
  file: File;
  name: string;
  url: string;
  id?: string;
}

export function EnvelopeCreationDialog({ open, onOpenChange, onCreate }: EnvelopeCreationDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [expiresIn, setExpiresIn] = useState("30");
  const [signers, setSigners] = useState<Signer[]>([
    { name: "", email: "", role: 'SIGNER', order: 1, signatureRequired: true }
  ]);

  const handleAddSigner = () => {
    setSigners([...signers, { name: "", email: "", role: 'SIGNER', order: signers.length + 1, signatureRequired: true }]);
  };

  const handleRemoveSigner = (index: number) => {
    if (signers.length > 1) {
      const newSigners = signers.filter((_, i) => i !== index);
      // Réorganiser les numéros d'ordre
      newSigners.forEach((s, i) => s.order = i + 1);
      setSigners(newSigners);
    }
  };

  const handleUpdateSigner = (index: number, field: keyof Signer, value: string) => {
    const newSigners = [...signers];
    newSigners[index] = { ...newSigners[index], [field]: value };
    setSigners(newSigners);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newSigners = [...signers];
      [newSigners[index - 1], newSigners[index]] = [newSigners[index], newSigners[index - 1]];
      // Réorganiser les numéros d'ordre
      newSigners.forEach((s, i) => s.order = i + 1);
      setSigners(newSigners);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < signers.length - 1) {
      const newSigners = [...signers];
      [newSigners[index], newSigners[index + 1]] = [newSigners[index + 1], newSigners[index]];
      // Réorganiser les numéros d'ordre
      newSigners.forEach((s, i) => s.order = i + 1);
      setSigners(newSigners);
    }
  };

  const canProceedToStep2 = title.trim() && documents.length > 0 && documents.every(d => d.url && d.url.trim());
  const canCreate = signers.every(s => s.name.trim() && s.email.trim());

  const handleAddDocuments = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      console.log('Aucun fichier sélectionné');
      return;
    }

    console.log(`${files.length} fichier(s) sélectionné(s)`);

    const pdfFiles = Array.from(files).filter(file => {
      const isPdf = file.type === 'application/pdf';
      if (!isPdf) {
        console.warn(`Fichier ignoré (pas PDF): ${file.name}, type: ${file.type}`);
      }
      return isPdf;
    });
    
    if (pdfFiles.length === 0) {
      toast.error('Seuls les fichiers PDF sont acceptés');
      return;
    }

    if (pdfFiles.length !== files.length) {
      toast.warning(`${files.length - pdfFiles.length} fichier(s) non-PDF ignoré(s)`);
    }

    console.log(`${pdfFiles.length} fichier(s) PDF à uploader`);

    // Uploader tous les fichiers
    setUploading(true);
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      setUploadingIndex(i);
      console.log(`Upload du fichier ${i + 1}/${pdfFiles.length}: ${file.name}`);
      
      try {
        const response = await apiClient.uploadAttachment('invoice', 'temp-envelope', file);
        console.log('Réponse upload complète:', response);
        
        // Vérifier la structure de la réponse
        const fileId = response?.data?.id || response?.id || '';
        
        if (!fileId) {
          console.error('Structure de réponse inattendue:', response);
          throw new Error('Aucun ID de fichier retourné par le serveur. Réponse: ' + JSON.stringify(response));
        }
        
        // Construire l'URL du fichier pour le téléchargement
        const fileUrl = apiClient.getAttachmentDownloadUrl(fileId);
        
        console.log(`Fichier uploadé avec succès. ID: ${fileId}, URL: ${fileUrl}`);
        
        setDocuments(prev => [...prev, {
          file,
          name: file.name,
          url: fileUrl,
          id: fileId
        }]);
        
        toast.success(`Document "${file.name}" chargé avec succès`);
      } catch (error: any) {
        console.error('Erreur upload:', error);
        let errorMessage = 'Erreur inconnue';
        if (error?.message) {
          try {
            const parsed = JSON.parse(error.message);
            errorMessage = parsed.message || parsed.error || error.message;
          } catch {
            errorMessage = error.message || error?.error || errorMessage;
          }
        }
        toast.error(`Erreur lors de l'upload de "${file.name}": ${errorMessage}`);
      }
    }
    
    // Réinitialiser l'état d'upload après tous les fichiers
    setUploading(false);
    setUploadingIndex(null);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!canCreate) {
      toast.error("Veuillez remplir tous les champs obligatoires des signataires");
      return;
    }

    if (documents.length === 0) {
      toast.error("Veuillez ajouter au moins un document");
      return;
    }

    setIsCreating(true);
    
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));

      // Transformer les signers en recipients avec la bonne structure
      const recipients = signers
        .filter(s => s.name.trim() && s.email.trim()) // Filtrer les signataires valides
        .map((signer) => ({
          name: signer.name.trim(),
          email: signer.email.trim(),
          role: 'SIGNER' as 'SIGNER' | 'VIEWER',
          // Le backend génère automatiquement l'ID et le routingOrder
        }));

      await onCreate({
        title,
        documents: documents.map((doc, index) => ({
          id: doc.id,
          fileName: doc.name,
          fileUrl: doc.url,
          order: index + 1
        })),
        message,
        expiresAt: expiresAt.toISOString(),
        recipients // Utiliser recipients au lieu de signers
      });

      // Reset seulement si la création réussit
      setStep(1);
      setTitle("");
      setDocuments([]);
      setMessage("");
      setExpiresIn("30");
      setSigners([{ name: "", email: "", role: 'SIGNER', order: 1, signatureRequired: true }]);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'enveloppe:', error);
      let errorMessage = "Erreur lors de la création de l'enveloppe";
      if (error?.message) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.message || parsed.error || error.message;
        } catch {
          errorMessage = error.message || error?.error || errorMessage;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Créer une Nouvelle Enveloppe
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "Étape 1/2 : Informations du document" : "Étape 2/2 : Définir les signataires et l'ordre"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Document Upload */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              onDragOver={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Drop event, fichiers:', e.dataTransfer.files.length);
                handleAddDocuments(e.dataTransfer.files);
              }}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-medium mb-1">Glissez-déposez vos documents PDF ici</p>
              <p className="text-sm text-muted-foreground mb-3">ou cliquez pour parcourir (plusieurs fichiers possibles)</p>
              <Input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  console.log('Input onChange, fichiers:', e.target.files?.length || 0);
                  handleAddDocuments(e.target.files);
                  // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
                  e.target.value = '';
                }}
                onClick={(e) => {
                  // Permettre de sélectionner à nouveau le même fichier
                  (e.target as HTMLInputElement).value = '';
                }}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const input = document.getElementById('file-upload') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
                disabled={uploading}
                type="button"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours... ({uploadingIndex !== null ? uploadingIndex + 1 : 0}/{documents.length})
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Parcourir les fichiers
                  </>
                )}
              </Button>
              
              {/* Liste des documents uploadés */}
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-700" />
                        <p className="text-sm text-green-700 font-medium">
                          ✓ {doc.name}
                        </p>
                        {uploadingIndex === index && (
                          <span className="ml-2 text-xs text-gray-500">(Upload en cours...)</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title">Titre de l'enveloppe *</Label>
              <Input
                id="title"
                placeholder="Ex: Contrat de Prestation IT - Q1 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Message pour les signataires</Label>
              <Textarea
                id="message"
                placeholder="Ex: Merci de signer ce contrat dans les meilleurs délais..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="expires">Expiration (jours)</Label>
              <Input
                id="expires"
                type="number"
                min="1"
                max="365"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'enveloppe expirera le {new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Signataires ({signers.length})</h3>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddSigner}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un signataire
              </Button>
            </div>

            <div className="space-y-4">
              {signers.map((signer, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-600">Signataire {index + 1}</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === signers.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      {signers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSigner(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nom complet *</Label>
                      <Input
                        placeholder="Jean Martin"
                        value={signer.name}
                        onChange={(e) => handleUpdateSigner(index, "name", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="jean.martin@email.com"
                        value={signer.email}
                        onChange={(e) => handleUpdateSigner(index, "email", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Rôle / Fonction</Label>
                    <Input
                      placeholder="Ex: Directeur Général, Client, etc."
                      value={signer.role}
                      onChange={(e) => handleUpdateSigner(index, "role", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <div>
                        <Label className="text-sm font-medium">Signature requise</Label>
                        <p className="text-xs text-muted-foreground">
                          {signer.signatureRequired 
                            ? "Ce signataire doit signer le document" 
                            : "Copie seulement (ne signe pas)"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={signer.signatureRequired}
                      onCheckedChange={(checked) => {
                        const newSigners = [...signers];
                        newSigners[index].signatureRequired = checked;
                        setSigners(newSigners);
                      }}
                    />
                  </div>

                  <div className={`text-xs p-2 rounded ${
                    signer.signatureRequired 
                      ? "text-muted-foreground bg-blue-50" 
                      : "text-orange-700 bg-orange-50 border border-orange-200"
                  }`}>
                    {signer.signatureRequired ? (
                      <>
                        <strong>Ordre de signature :</strong> Ce signataire recevra l'invitation en position #{index + 1}
                      </>
                    ) : (
                      <>
                        <strong>📧 Copie :</strong> Cette personne recevra uniquement une copie du document signé par email, sans possibilité de signature
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>📋 Ordre de signature :</strong> Les signataires recevront l'email dans l'ordre défini ci-dessus. 
                Le signataire 2 ne pourra signer qu'après que le signataire 1 ait signé, et ainsi de suite.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          {step === 1 ? (
                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={!canProceedToStep2 || uploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        "Suivant : Signataires"
                      )}
                    </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!canCreate || isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer et Préparer"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

