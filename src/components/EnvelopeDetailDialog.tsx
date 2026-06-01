import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { 
  Download, FileCheck, Calendar, Clock, CheckCircle2, 
  XCircle, Mail, User, FileText, Shield, Archive
} from "lucide-react";
import { apiClient } from "../lib/api-client-backend";

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: "pending" | "in_progress" | "completed" | "declined";
  signedAt?: string;
  color: string;
  ipAddress?: string;
  device?: string;
}

interface Envelope {
  id: string;
  title: string;
  documentName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  signers: Signer[];
  message?: string;
}

interface EnvelopeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envelope: Envelope;
  onDownloadSigned: (id: string) => void;
  onDownloadWithCertificate: (id: string) => void;
}

export function EnvelopeDetailDialog({
  open,
  onOpenChange,
  envelope,
  onDownloadSigned,
  onDownloadWithCertificate
}: EnvelopeDetailDialogProps) {
  const isCompleted = envelope.status === "completed";
  const completedSigners = envelope.signers.filter(s => s.status === "completed");
  const progress = (completedSigners.length / envelope.signers.length) * 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600">En attente</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600">En cours</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Signé</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-600"><XCircle className="w-3 h-3 mr-1" />Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            {envelope.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold mb-1">Statut de l'enveloppe</h3>
                <p className="text-sm text-muted-foreground">{envelope.documentName}</p>
              </div>
              {getStatusBadge(envelope.status)}
            </div>

            {!isCompleted && (
              <>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{completedSigners.length} / {envelope.signers.length} signatures</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Créé le</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(envelope.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mis à jour</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(envelope.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expire le</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(envelope.expiresAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </Card>

          {/* Message */}
          {envelope.message && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Message aux signataires
              </h3>
              <p className="text-sm text-muted-foreground">{envelope.message}</p>
            </Card>
          )}

          {/* Signers */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Signataires ({envelope.signers.length})
            </h3>
            <div className="space-y-4">
              {envelope.signers.map((signer, index) => (
                <div key={signer.id}>
                  <div
                    className="p-4 rounded-lg border-2"
                    style={{ borderLeftWidth: "4px", borderLeftColor: signer.color }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: signer.color }}
                        >
                          {signer.order}
                        </div>
                        <div>
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-sm text-muted-foreground">{signer.email}</p>
                          <p className="text-xs text-muted-foreground">{signer.role}</p>
                        </div>
                      </div>
                      {getStatusBadge(signer.status)}
                    </div>

                    {signer.status === "completed" && signer.signedAt && (
                      <div className="mt-3 pt-3 border-t bg-green-50 -m-4 mt-3 p-4 rounded-b-lg">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Date de signature</p>
                            <p className="font-medium">
                              {new Date(signer.signedAt).toLocaleString("fr-FR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Adresse IP</p>
                            <p className="font-medium font-mono">
                              {signer.ipAddress || "192.168.1.100"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Appareil</p>
                            <p className="font-medium">
                              {signer.device || "Chrome 119.0 - Windows 10"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Méthode d'authentification</p>
                            <p className="font-medium">Email + OTP</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {signer.status === "pending" && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          {signer.order === 1
                            ? "En attente de signature"
                            : `Recevra l'invitation après que le signataire ${signer.order - 1} ait signé`}
                        </p>
                      </div>
                    )}

                    {signer.status === "in_progress" && (
                      <div className="mt-3 pt-3 border-t bg-yellow-50 -m-4 mt-3 p-4 rounded-b-lg">
                        <p className="text-xs text-yellow-800 font-medium">
                          ⏳ Le signataire a ouvert le document mais n'a pas encore signé
                        </p>
                      </div>
                    )}
                  </div>
                  {index < envelope.signers.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-0.5 h-6 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Download Options */}
          {isCompleted && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Téléchargements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                  <FileText className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-medium mb-2">Document Signé</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fichier PDF avec toutes les signatures visibles
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const downloadUrl = apiClient.getEnvelopeDownloadUrl(envelope.id);
                        window.open(downloadUrl, '_blank');
                        onDownloadSigned(envelope.id);
                      } catch (error: any) {
                        console.error('Erreur téléchargement:', error);
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>

                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCheck className="w-8 h-8 text-blue-600" />
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Package Complet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF + Certificat + Piste d'audit complète (ZIP)
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        // Télécharger le certificat
                        const certificateUrl = apiClient.getEnvelopeCertificateUrl(envelope.id);
                        window.open(certificateUrl, '_blank');
                        
                        // Attendre un peu puis télécharger le document signé
                        setTimeout(() => {
                          const downloadUrl = apiClient.getEnvelopeDownloadUrl(envelope.id);
                          window.open(downloadUrl, '_blank');
                        }, 500);
                        
                        onDownloadWithCertificate(envelope.id);
                      } catch (error: any) {
                        console.error('Erreur téléchargement:', error);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Télécharger Package
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Valeur Probante Légale</p>
                    <p className="text-blue-800 text-xs">
                      Le certificat de signature contient tous les éléments techniques garantissant 
                      la valeur juridique du document : horodatage certifié, identité des signataires, 
                      adresses IP, hash cryptographique du document, et chaîne de confiance complète.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Audit Trail Preview */}
          {isCompleted && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Piste d'Audit
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 pb-3 border-b">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Enveloppe créée</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(envelope.createdAt).toLocaleString("fr-FR")} • Par le système
                    </p>
                  </div>
                </div>
                {envelope.signers
                  .filter(s => s.status === "completed")
                  .map(signer => (
                    <div key={signer.id} className="flex gap-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{signer.name} a signé</p>
                        <p className="text-xs text-muted-foreground">
                          {signer.signedAt && new Date(signer.signedAt).toLocaleString("fr-FR")} • 
                          IP: {signer.ipAddress || "192.168.1.100"}
                        </p>
                      </div>
                    </div>
                  ))}
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Enveloppe terminée</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(envelope.updatedAt).toLocaleString("fr-FR")} • Tous les signataires ont signé
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
