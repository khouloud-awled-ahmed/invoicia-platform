import { useState, useEffect } from "react";
import * as React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { 
  FileText, Plus, Users, Eye, Download, Mail, 
  CheckCircle2, Clock, XCircle, Send, Archive,
  AlertCircle, Shield, FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { EnvelopeCreationDialog } from "./EnvelopeCreationDialog";
import { DocumentPreparationDialog } from "./DocumentPreparationDialog";
import { EnvelopeDetailDialog } from "./EnvelopeDetailDialog";
import { SigningExperienceDialog } from "./SigningExperienceDialog";
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
}

interface SignatureField {
  id: string;
  type: "signature" | "initials" | "date" | "text" | "checkbox";
  signerId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  label?: string;
}

interface Envelope {
  id: string;
  title: string;
  documentName: string;
  documents?: Array<{ id: string; fileName: string; fileUrl: string }>;
  status: "draft" | "sent" | "in_progress" | "completed" | "declined" | "expired";
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  signers: Signer[];
  fields: SignatureField[];
  message?: string;
  currentSignerIndex: number;
}


export function ElectronicSignature() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreationDialog, setShowCreationDialog] = useState(false);
  const [showPreparationDialog, setShowPreparationDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSigningDialog, setShowSigningDialog] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null);
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "sent" | "in_progress" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les enveloppes depuis l'API
  React.useEffect(() => {
    loadEnvelopes();
  }, []);

  const loadEnvelopes = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEnvelopes();
      // Convertir les données de l'API vers le format local
      const convertedEnvelopes: Envelope[] = data.map((env: any) => ({
        id: env._id || env.id,
        title: env.title,
        documentName: env.documents?.[0]?.fileName || 'Document',
        documents: env.documents?.map((doc: any) => ({
          id: doc.id || doc._id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
        })),
        status: env.status?.toLowerCase().replace('IN_PROGRESS', 'in_progress') || 'draft',
        createdAt: env.createdAt || new Date().toISOString(),
        updatedAt: env.updatedAt || new Date().toISOString(),
        expiresAt: env.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentSignerIndex: env.currentRoutingOrder - 1 || 0,
        message: env.message,
        signers: env.recipients?.map((r: any, idx: number) => ({
          id: r.id || r._id,
          name: r.name,
          email: r.email,
          role: r.role || 'SIGNER',
          order: r.routingOrder || idx + 1,
          status: r.status?.toLowerCase() || 'pending',
          signedAt: r.signedAt,
          color: r.color || ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"][idx % 6],
        })) || [],
        fields: env.fields?.map((f: any) => ({
          id: f.id,
          type: f.type?.toLowerCase(),
          signerId: f.assignedRecipientId,
          page: f.pageNumber,
          x: f.xPosition,
          y: f.yPosition,
          width: f.width,
          height: f.height,
          required: f.required,
          label: f.label,
        })) || [],
      }));
      setEnvelopes(convertedEnvelopes);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des enveloppes:', error);
      toast.error(error?.message || 'Erreur lors du chargement des enveloppes');
      setEnvelopes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300"><FileText className="w-3 h-3 mr-1" />Brouillon</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><Send className="w-3 h-3 mr-1" />Envoyé</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Terminé</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Refusé</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300"><AlertCircle className="w-3 h-3 mr-1" />Expiré</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSignerStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">En attente</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 text-xs">En cours</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 text-xs">Signé</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-600 text-xs">Refusé</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const filteredEnvelopes = envelopes.filter(env => {
    const matchesTab = currentTab === "all" || env.status === currentTab;
    const matchesSearch = env.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         env.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         env.signers.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: envelopes.length,
    draft: envelopes.filter(e => e.status === "draft").length,
    sent: envelopes.filter(e => e.status === "sent").length,
    in_progress: envelopes.filter(e => e.status === "in_progress").length,
    completed: envelopes.filter(e => e.status === "completed").length
  };

  const [isCreatingEnvelope, setIsCreatingEnvelope] = useState(false);
  const [isSavingFields, setIsSavingFields] = useState(false);

  const handleCreateEnvelope = async (envelopeData: any) => {
    setIsCreatingEnvelope(true);
    try {
      // Préparer les documents - gérer plusieurs documents
      if (!envelopeData.documents || envelopeData.documents.length === 0) {
        // Compatibilité avec l'ancien format (document unique)
        if (envelopeData.documentUrl) {
          envelopeData.documents = [{
            fileName: envelopeData.documentName || 'document.pdf',
            fileUrl: envelopeData.documentUrl,
            order: 1,
          }];
        } else {
          toast.error('Aucun document uploadé');
          return;
        }
      }

      const documents = envelopeData.documents.map((doc: any, index: number) => ({
        fileName: doc.fileName || `document-${index + 1}.pdf`,
        fileUrl: doc.fileUrl,
        order: doc.order || index + 1,
      }));

      // Préparer les recipients
      const recipients = envelopeData.recipients.map((s: any) => ({
        name: s.name,
        email: s.email,
        role: s.signatureRequired ? 'SIGNER' : 'VIEWER',
        securityCode: s.securityCode,
      }));

      // Calculer la date d'expiration
      const expiresAt = envelopeData.expiresAt 
        ? new Date(envelopeData.expiresAt).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const newEnvelopeData = await apiClient.createEnvelope({
        title: envelopeData.title,
        message: envelopeData.message,
        expiresAt,
        documents,
        recipients,
      });

      // Convertir pour l'affichage local
      const newEnvelope: Envelope = {
        id: newEnvelopeData._id || newEnvelopeData.id,
        title: newEnvelopeData.title,
        documentName: documents[0]?.fileName || 'Document',
        status: "draft",
        createdAt: newEnvelopeData.createdAt || new Date().toISOString(),
        updatedAt: newEnvelopeData.updatedAt || new Date().toISOString(),
        expiresAt,
        currentSignerIndex: 0,
        message: envelopeData.message,
        signers: newEnvelopeData.recipients?.map((r: any, index: number) => ({
          id: r.id || r._id,
          name: r.name,
          email: r.email,
          role: r.role || 'SIGNER',
          order: r.routingOrder || index + 1,
          status: "pending" as const,
          color: r.color || ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"][index % 6]
        })) || [],
        fields: [],
        documents: newEnvelopeData.documents?.map((doc: any) => ({
          id: doc.id || doc._id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
        }))
      };

      setEnvelopes([newEnvelope, ...envelopes]);
      setSelectedEnvelope(newEnvelope);
      setShowCreationDialog(false);
      setShowPreparationDialog(true);
      
      toast.success("Enveloppe créée avec succès ! Placez maintenant les champs de signature.");
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'enveloppe:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'enveloppe');
    }
  };

  const handleSaveFields = async (fields: SignatureField[]) => {
    if (!selectedEnvelope) return;

    setIsSavingFields(true);
    try {
      // Les fields sont déjà convertis par DocumentPreparationDialog
      const fieldsForAPI = fields;

      console.log('fieldsForAPI:', JSON.stringify(fieldsForAPI));
      // Sauvegarder les champs
      await apiClient.addFieldsToEnvelope(selectedEnvelope.id, fieldsForAPI);

      // Envoyer l'enveloppe
      await apiClient.sendEnvelope(selectedEnvelope.id);

      // Recharger les enveloppes
      await loadEnvelopes();

      setShowPreparationDialog(false);
      
      toast.success(
        <div>
          <div className="font-semibold">Enveloppe envoyée !</div>
          <div className="text-sm">Les signataires vont recevoir un email.</div>
        </div>
      );
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des champs:', error);
      const errorMessage = error?.message || error?.error || 'Erreur lors de la sauvegarde des champs';
      toast.error(errorMessage);
      throw error; // Re-throw pour que le dialog puisse gérer l'erreur
    } finally {
      setIsSavingFields(false);
    }
  };

  const handleViewEnvelope = (envelope: Envelope) => {
    setSelectedEnvelope(envelope);
    setShowDetailDialog(true);
  };

  const handleSignDocument = (envelope: Envelope) => {
    setSelectedEnvelope(envelope);
    setShowSigningDialog(true);
  };

  const handleDownloadSigned = async (envelopeId: string) => {
    try {
      const downloadUrl = apiClient.getEnvelopeDownloadUrl(envelopeId);
      // Ouvrir dans un nouvel onglet pour télécharger
      apiClient.downloadEnvelope(envelopeId);
      toast.success("Téléchargement du document signé...");
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error(error?.message || "Erreur lors du téléchargement du document signé");
    }
  };

  const handleDownloadWithCertificate = async (envelopeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const certResp = await fetch(`/api/envelopes/${envelopeId}/download-certificate`, { headers });
      const certBlob = await certResp.blob();
      const certUrl = URL.createObjectURL(certBlob);
      const certLink = document.createElement('a');
      certLink.href = certUrl; certLink.download = `certificate-${envelopeId}.pdf`; certLink.click();
      setTimeout(async () => { const docResp = await fetch(`/api/envelopes/${envelopeId}/download`, { headers }); const docBlob = await docResp.blob(); const docUrl = URL.createObjectURL(docBlob); const docLink = document.createElement('a'); docLink.href = docUrl; docLink.download = `document-${envelopeId}.pdf`; docLink.click(); }, 500);

      
      toast.success(
        <div>
          <div className="font-semibold">Téléchargement du package complet</div>
          <div className="text-sm">• Document signé (PDF)</div>
          <div className="text-sm">• Certificat de signature</div>
          <div className="text-sm">• Piste d'audit complète</div>
        </div>
      );
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error(error?.message || "Erreur lors du téléchargement");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Signature Électronique
          </h1>
          <p className="text-muted-foreground mt-1">
            Envoyez et gérez vos documents à signer en toute sécurité
          </p>
        </div>
        <Button onClick={() => setShowCreationDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Enveloppe
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chargement des enveloppes...</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Brouillons</p>
              <p className="text-2xl font-semibold mt-1">{stats.draft}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Envoyés</p>
              <p className="text-2xl font-semibold mt-1">{stats.sent}</p>
            </div>
            <Send className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En cours</p>
              <p className="text-2xl font-semibold mt-1">{stats.in_progress}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Terminés</p>
              <p className="text-2xl font-semibold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une enveloppe, un document ou un signataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
          <TabsTrigger value="draft">Brouillons ({stats.draft})</TabsTrigger>
          <TabsTrigger value="sent">Envoyés ({stats.sent})</TabsTrigger>
          <TabsTrigger value="in_progress">En cours ({stats.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Terminés ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="space-y-4 mt-6">
          {!loading && filteredEnvelopes.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune enveloppe</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Aucun résultat pour votre recherche" : "Créez votre première enveloppe pour commencer"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreationDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une enveloppe
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEnvelopes.map(envelope => (
                <Card key={envelope.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{envelope.title}</h3>
                        {getStatusBadge(envelope.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {envelope.documentName}
                        </span>
                        <span>Créé le {new Date(envelope.createdAt).toLocaleDateString("fr-FR")}</span>
                        <span>Expire le {new Date(envelope.expiresAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewEnvelope(envelope)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      {envelope.status === "completed" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadSigned(envelope.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadWithCertificate(envelope.id)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <FileCheck className="w-4 h-4 mr-2" />
                            + Certificat
                          </Button>
                        </>
                      )}
                      {envelope.status === "draft" && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedEnvelope(envelope);
                            setShowPreparationDialog(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Préparer et Envoyer
                        </Button>
                      )}
                      {(envelope.status === "sent" || envelope.status === "in_progress") && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSignDocument(envelope)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          Signer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Signers */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Signataires :</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {envelope.signers.map(signer => (
                        <div 
                          key={signer.id} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderLeftWidth: '4px', borderLeftColor: signer.color }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                              style={{ backgroundColor: signer.color }}
                            >
                              {signer.order}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{signer.name}</p>
                              <p className="text-xs text-muted-foreground">{signer.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSignerStatusBadge(signer.status)}
                            {signer.signedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(signer.signedAt).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EnvelopeCreationDialog
        open={showCreationDialog}
        onOpenChange={setShowCreationDialog}
        onCreate={handleCreateEnvelope}
      />

      {selectedEnvelope && (
        <>
          <DocumentPreparationDialog
            open={showPreparationDialog}
            onOpenChange={setShowPreparationDialog}
            envelope={selectedEnvelope}
            onSave={handleSaveFields}
          />

          <EnvelopeDetailDialog
            open={showDetailDialog}
            onOpenChange={setShowDetailDialog}
            envelope={selectedEnvelope}
            onDownloadSigned={handleDownloadSigned}
            onDownloadWithCertificate={handleDownloadWithCertificate}
          />

          <SigningExperienceDialog
            open={showSigningDialog}
            onOpenChange={setShowSigningDialog}
            envelope={selectedEnvelope}
            onComplete={() => {
              setShowSigningDialog(false);
              toast.success("Document signé avec succès !");
            }}
          />
        </>
      )}
    </div>
  );
}






