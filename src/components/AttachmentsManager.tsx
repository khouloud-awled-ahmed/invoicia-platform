import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "../lib/api-client-backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import {
  Paperclip,
  Upload,
  Loader2,
  Eye,
  Download,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  File,
} from "lucide-react";

export interface Attachment {
  id: string;
  entityType: "invoice" | "purchase_invoice" | "credit_note";
  entityId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface AttachmentsManagerProps {
  entityType: "invoice" | "purchase_invoice" | "credit_note";
  entityId: string;
  readonly?: boolean;
  compact?: boolean;
}

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AttachmentsManager({
  entityType,
  entityId,
  readonly = false,
  compact = false,
}: AttachmentsManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [entityId, entityType]);

  const loadAttachments = async () => {
    try {
      const result = await apiClient.getAttachments(entityType, entityId);
      if (result.success && result.data) {
        setAttachments(result.data);
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pièces jointes:", error);
      toast.error("Erreur lors du chargement des pièces jointes");
      setAttachments([]);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (fileType === "application/pdf") return <FileText className="w-4 h-4" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheet className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validation du type de fichier
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Type de fichier non autorisé", {
        description: "Types acceptés : PDF, Images, Excel, Word, TXT",
      });
      return;
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Fichier trop volumineux", {
        description: `Taille maximale : ${formatFileSize(MAX_FILE_SIZE)}`,
      });
      return;
    }

    await uploadFile(file);
    
    // Réinitialiser l'input pour permettre de réuploader le même fichier
    e.target.value = "";
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload vers le backend MongoDB
      const result = await apiClient.uploadAttachment(entityType, entityId, file);
      clearInterval(progressInterval);
      
      if (result.success && result.data) {
        setUploadProgress(100);
        // Ajouter l'URL de téléchargement
        const attachment: Attachment = {
          ...result.data,
          fileUrl: apiClient.getAttachmentDownloadUrl(result.data.id),
        };
        setAttachments([...attachments, attachment]);
        toast.success("Fichier uploadé avec succès", {
          description: file.name,
        });
        
        // Rafraîchir la liste pour avoir les données complètes
        await loadAttachments();
      } else {
        setUploadProgress(0);
        console.error("Erreur lors de l'upload:", result.error);
        toast.error("Erreur lors de l'upload", {
          description: result.error || "Veuillez réessayer",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload", {
        description: "Veuillez réessayer",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      // Télécharger depuis le backend
      const downloadUrl = apiClient.getAttachmentDownloadUrl(attachment.id);
      
      // Récupérer le token et le tenantId
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let tenantId = '';
      
      try {
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role !== 'PLATFORM_ADMIN' && user.tenantId) {
            tenantId = user.tenantId;
          }
        }
      } catch (e) {
        console.warn("Erreur lecture user localStorage", e);
      }
      
      // Utiliser fetch pour télécharger avec le token d'authentification
      const headers: HeadersInit = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      };
      
      const response = await fetch(downloadUrl, { headers });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Téléchargement démarré", {
        description: attachment.fileName,
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handlePreview = async (attachment: Attachment) => {
    if (attachment.fileType.startsWith("image/")) {
      setPreviewFile(attachment);
      setPreviewFileUrl(attachment.fileUrl);
    } else if (attachment.fileType === "application/pdf") {
      setPreviewFile(attachment);
      // Charger le PDF avec authentification
      try {
        const downloadUrl = apiClient.getAttachmentDownloadUrl(attachment.id);
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        let tenantId = '';
        
        try {
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'PLATFORM_ADMIN' && user.tenantId) {
              tenantId = user.tenantId;
            }
          }
        } catch (e) {
          console.warn("Erreur lecture user localStorage", e);
        }
        
        const headers: HeadersInit = {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
        };
        
        const response = await fetch(downloadUrl, { headers });
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        setPreviewFileUrl(blobUrl);
      } catch (error) {
        console.error("Erreur lors du chargement du PDF:", error);
        toast.error("Erreur lors du chargement du PDF");
        setPreviewFile(null);
        setPreviewFileUrl(null);
      }
    } else {
      toast.info("Aperçu non disponible", {
        description: "Téléchargez le fichier pour le consulter",
      });
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      const result = await apiClient.deleteAttachment(attachment.id);
      if (result.success) {
        setAttachments(attachments.filter((a) => a.id !== attachment.id));
        toast.success("Pièce jointe supprimée", {
          description: attachment.fileName,
        });
        setDeleteConfirm(null);
      } else {
        console.error("Erreur lors de la suppression:", result.error);
        toast.error("Erreur lors de la suppression", {
          description: result.error || "Veuillez réessayer",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {attachments.length} pièce{attachments.length !== 1 ? "s" : ""} jointe{attachments.length !== 1 ? "s" : ""}
            </span>
          </div>
          {!readonly && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <Badge
                key={attachment.id}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => handlePreview(attachment)}
              >
                {getFileIcon(attachment.fileType)}
                <span className="text-xs truncate max-w-[150px]">
                  {attachment.fileName}
                </span>
              </Badge>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={ALLOWED_FILE_TYPES.join(",")}
        />

        {/* Dialog Preview */}
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewFile?.fileName}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {previewFile?.fileType.startsWith("image/") ? (
                <img
                  src={previewFile.fileUrl}
                  alt={previewFile.fileName}
                  className="w-full h-auto"
                />
              ) : previewFile?.fileType === "application/pdf" ? (
                <iframe
                  src={previewFile.fileUrl}
                  className="w-full h-[600px]"
                  title={previewFile.fileName}
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            <CardTitle>Pièces jointes</CardTitle>
            <Badge variant="secondary">
              {attachments.length}
            </Badge>
          </div>
          {!readonly && (
            <Button
              onClick={handleFileSelect}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upload en cours ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter un fichier
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Aucune pièce jointe. {!readonly && "Cliquez sur le bouton ci-dessus pour en ajouter."}
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(attachment.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {attachment.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {new Date(attachment.uploadedAt).toLocaleDateString("fr-FR")}
                        </span>
                        {attachment.uploadedBy && (
                          <>
                            <span>•</span>
                            <span>{attachment.uploadedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {(attachment.fileType.startsWith("image/") ||
                      attachment.fileType === "application/pdf") && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePreview(attachment)}
                        title="Prévisualiser"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDownload(attachment)}
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {!readonly && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(attachment)}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={ALLOWED_FILE_TYPES.join(",")}
        />

        {/* Dialog Preview */}
        <Dialog open={!!previewFile} onOpenChange={() => {
          setPreviewFile(null);
          // Nettoyer le blob URL si c'était un PDF
          if (previewFileUrl && previewFileUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(previewFileUrl);
          }
          setPreviewFileUrl(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(previewFile?.fileType || "")}
                {previewFile?.fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {previewFile?.fileType.startsWith("image/") && previewFileUrl ? (
                <img
                  src={previewFileUrl}
                  alt={previewFile.fileName}
                  className="w-full h-auto"
                />
              ) : previewFile?.fileType === "application/pdf" && previewFileUrl ? (
                <iframe
                  src={previewFileUrl}
                  className="w-full h-[600px]"
                  title={previewFile.fileName}
                />
              ) : previewFile ? (
                <div className="flex items-center justify-center h-[600px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => previewFile && handleDownload(previewFile)}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button onClick={() => {
                setPreviewFile(null);
                // Nettoyer le blob URL si c'était un PDF
                if (previewFileUrl && previewFileUrl.startsWith('blob:')) {
                  window.URL.revokeObjectURL(previewFileUrl);
                }
                setPreviewFileUrl(null);
              }}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog Delete */}
        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la pièce jointe{" "}
                <strong>{deleteConfirm?.fileName}</strong> ?<br />
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}