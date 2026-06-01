import { useState, useEffect, useMemo } from "react";
import { Document, Page } from "react-pdf";
// Configuration du worker PDF.js - importée depuis le fichier de config global
import "../lib/pdf-worker-config";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { 
  PenTool, CheckCircle2, ChevronLeft, ChevronRight,
  Shield, Mail, Clock, FileText, Loader2, XCircle, AlertCircle,
  ZoomIn, ZoomOut
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

interface Field {
  id: string;
  type: 'SIGNATURE' | 'INITIALS' | 'DATE' | 'TEXT' | 'CHECKBOX';
  pageNumber: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  assignedRecipientId: string;
  linkedDocumentId: string;
  label?: string;
  required: boolean;
  value?: string;
  defaultValue?: boolean;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: 'SIGNER' | 'VIEWER';
  routingOrder: number;
  status: string;
  securityCode?: string;
}

interface Envelope {
  _id: string;
  id?: string;
  title: string;
  status: string;
  message?: string;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    order: number;
  }>;
  recipients: Recipient[];
  fields: Field[];
  expiresAt?: string;
  currentRoutingOrder: number;
}

export function PublicSignaturePage() {
  // Récupérer les paramètres depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const envelopeId = urlParams.get('id') || window.location.pathname.split('/sign/')[1]?.split('?')[0];
  const email = urlParams.get('email') || '';
  const securityCode = urlParams.get('code') || '';

  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  
  // État des signatures
  const [signatureData, setSignatureData] = useState<Record<string, string>>({}); // fieldId -> base64 image
  const [typedSignatures, setTypedSignatures] = useState<Record<string, string>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [checkboxValues, setCheckboxValues] = useState<Record<string, boolean>>({});
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');

  // Trouver le recipient actuel
  const currentRecipient = envelope?.recipients.find(r => r.email === email);
  const recipientFields = envelope?.fields.filter(f => f.assignedRecipientId === currentRecipient?.id) || [];
  const pdfUrl = envelope?.documents && envelope.documents.length > 0 
    ? envelope.documents[0].fileUrl 
    : null;

  // Créer l'objet PDF avec headers d'authentification si nécessaire
  // Pour les pages publiques, on peut avoir un token dans l'URL ou dans localStorage
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || new URLSearchParams(window.location.search).get('token')) : null;
  const pdfFile = useMemo(() => {
    if (!pdfUrl) return null;
    
    // Si c'est une URL relative ou absolue vers notre API, ajouter les headers
    if (pdfUrl.startsWith('/api/') || pdfUrl.includes('localhost') || (typeof window !== 'undefined' && pdfUrl.includes(window.location.hostname))) {
      return {
        url: pdfUrl,
        httpHeaders: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
      };
    }
    
    // Pour les URLs externes, retourner l'URL telle quelle
    return pdfUrl;
  }, [pdfUrl, token]);

  useEffect(() => {
    if (!envelopeId || !email) {
      setError("Paramètres manquants: ID de l'enveloppe et email requis");
      setLoading(false);
      return;
    }

    loadEnvelope();
  }, [envelopeId, email]);

  const loadEnvelope = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEnvelope(envelopeId!);
      setEnvelope(data);
      
      // Vérifier que l'utilisateur est autorisé
      if (!data.recipients.find((r: Recipient) => r.email === email)) {
        setError("Vous n'êtes pas autorisé à accéder à cette enveloppe");
        return;
      }

      // Vérifier que c'est le tour de ce signataire
      const recipient = data.recipients.find((r: Recipient) => r.email === email);
      if (recipient.routingOrder !== data.currentRoutingOrder) {
        setError("Ce n'est pas encore votre tour de signer. Vous serez notifié lorsque votre tour arrivera.");
        return;
      }

      // Pré-remplir les valeurs existantes
      data.fields.forEach((field: Field) => {
        if (field.assignedRecipientId === recipient.id) {
          if (field.type === 'CHECKBOX' && field.defaultValue !== undefined) {
            setCheckboxValues(prev => ({ ...prev, [field.id]: field.defaultValue! }));
          }
        }
      });

      setError(null);
    } catch (err: any) {
      console.error('Erreur lors du chargement de l\'enveloppe:', err);
      setError(err.message || "Erreur lors du chargement de l'enveloppe");
      toast.error("Impossible de charger l'enveloppe");
    } finally {
      setLoading(false);
    }
  };

  const allRequiredFieldsFilled = (): boolean => {
    if (!currentRecipient || !envelope) return false;

    const requiredFields = recipientFields.filter(f => f.required);
    
    return requiredFields.every(field => {
      if (field.type === 'SIGNATURE') {
        return signatureData[field.id] || typedSignatures[field.id]?.length > 0;
      }
      if (field.type === 'INITIALS') {
        return textValues[field.id]?.length > 0;
      }
      if (field.type === 'DATE') {
        return true; // Auto-rempli
      }
      if (field.type === 'TEXT') {
        return textValues[field.id]?.length > 0;
      }
      if (field.type === 'CHECKBOX') {
        return checkboxValues[field.id] === true;
      }
      return false;
    });
  };

  const handleSign = async () => {
    if (!envelope || !currentRecipient) return;

    if (!allRequiredFieldsFilled()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!hasAcceptedTerms) {
      toast.error("Veuillez accepter les conditions de signature électronique");
      return;
    }

    if (currentRecipient.securityCode && securityCode !== currentRecipient.securityCode) {
      toast.error("Code de sécurité invalide");
      return;
    }

    setIsSigning(true);

    try {
      // Préparer les valeurs de champs
      const fieldValues = recipientFields.map(field => {
        let value = '';
        let sigData = '';

        if (field.type === 'SIGNATURE') {
          sigData = signatureData[field.id] || '';
          value = typedSignatures[field.id] || '';
        } else if (field.type === 'INITIALS') {
          value = textValues[field.id] || '';
        } else if (field.type === 'DATE') {
          value = new Date().toISOString().split('T')[0];
        } else if (field.type === 'TEXT') {
          value = textValues[field.id] || '';
        } else if (field.type === 'CHECKBOX') {
          value = checkboxValues[field.id] ? 'true' : 'false';
        }

        return {
          fieldId: field.id,
          value,
          signatureData: sigData,
        };
      });

      await apiClient.signEnvelope(envelope._id || envelope.id!, email, {
        securityCode: currentRecipient.securityCode || undefined,
        fieldValues,
      });

      toast.success("Document signé avec succès !", {
        description: "Vous allez être redirigé...",
        duration: 3000,
      });

      // Rediriger après 2 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      console.error('Erreur lors de la signature:', err);
      toast.error(err.message || "Erreur lors de la signature");
    } finally {
      setIsSigning(false);
    }
  };

  const handleRefuse = async () => {
    if (!envelope || !currentRecipient || !refuseReason.trim()) {
      toast.error("Veuillez fournir un motif de refus");
      return;
    }

    setIsSigning(true);

    try {
      await apiClient.refuseEnvelope(envelope._id || envelope.id!, email, {
        reason: refuseReason,
        securityCode: currentRecipient.securityCode || undefined,
      });

      toast.success("Document refusé", {
        description: "Tous les participants ont été notifiés",
        duration: 3000,
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      console.error('Erreur lors du refus:', err);
      toast.error(err.message || "Erreur lors du refus");
    } finally {
      setIsSigning(false);
      setShowRefuseDialog(false);
    }
  };

  // Dessiner une signature
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);

  const startDrawing = (fieldId: string, e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setCurrentFieldId(fieldId);
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentFieldId) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = (fieldId: string) => {
    if (!isDrawing || !currentFieldId || currentFieldId !== fieldId) return;
    setIsDrawing(false);
    
    const canvas = canvasRef;
    if (!canvas) return;
    
    // Convertir le canvas en base64
    const dataURL = canvas.toDataURL('image/png');
    setSignatureData(prev => ({ ...prev, [fieldId]: dataURL }));
    setCurrentFieldId(null);
  };

  const clearSignature = (fieldId: string) => {
    setSignatureData(prev => {
      const newData = { ...prev };
      delete newData[fieldId];
      return newData;
    });
    setTypedSignatures(prev => {
      const newData = { ...prev };
      delete newData[fieldId];
      return newData;
    });
    
    const canvas = canvasRef;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'enveloppe...</p>
        </div>
      </div>
    );
  }

  if (error || !envelope || !currentRecipient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error || "Enveloppe ou signataire introuvable"}</p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si déjà signé
  if (currentRecipient.status === 'SIGNED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Document déjà signé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Vous avez déjà signé ce document le {currentRecipient.signedAt 
                ? new Date(currentRecipient.signedAt).toLocaleString('fr-FR')
                : 'récemment'}.
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si refusé
  if (currentRecipient.status === 'REFUSED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Document refusé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-2">
              Vous avez refusé de signer ce document.
            </p>
            {currentRecipient.refusalReason && (
              <p className="text-sm text-gray-600 mb-4">
                <strong>Motif:</strong> {currentRecipient.refusalReason}
              </p>
            )}
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtenir les champs de la page actuelle
  const currentPageFields = recipientFields.filter(f => f.pageNumber === currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{envelope.title}</h1>
              <p className="text-sm text-gray-600">{currentRecipient.name} ({currentRecipient.email})</p>
            </div>
            <Badge className="bg-blue-600">
              <Shield className="w-3 h-3 mr-1" />
              Signature Sécurisée
            </Badge>
          </div>
        </div>
      </div>

      {/* Message */}
      {envelope.message && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-sm text-yellow-800">
              <strong>Message:</strong> {envelope.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Document à signer</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm w-16 text-center">{zoom}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto bg-gray-100 p-4 rounded-lg">
                  {pdfFile ? (
                    <div className="flex justify-center">
                      <Document
                        file={pdfFile}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          </div>
                        }
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        onLoadError={(err) => {
                          console.error('PDF load error:', err);
                          toast.error("Erreur lors du chargement du PDF");
                        }}
                      >
                        <div className="relative inline-block" style={{ position: 'relative' }}>
                          <Page
                            pageNumber={currentPage}
                            scale={zoom / 100}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={595}
                            className="border border-gray-200 shadow-lg"
                          />
                          
                          {/* Overlay des champs */}
                          {currentPageFields.map((field) => {
                            const fieldValue = 
                              field.type === 'SIGNATURE' 
                                ? (signatureData[field.id] || typedSignatures[field.id])
                                : field.type === 'DATE'
                                ? new Date().toLocaleDateString('fr-FR')
                                : textValues[field.id] || checkboxValues[field.id]?.toString() || '';

                            return (
                              <div
                                key={field.id}
                                className="absolute border-2 border-dashed rounded"
                                style={{
                                  left: `${field.xPosition}px`,
                                  top: `${field.yPosition}px`,
                                  width: `${field.width}px`,
                                  height: `${field.height}px`,
                                  borderColor: field.required ? '#ef4444' : '#6b7280',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                }}
                              >
                                {field.type === 'SIGNATURE' && (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                    {signatureData[field.id] ? (
                                      <img 
                                        src={signatureData[field.id]} 
                                        alt="Signature" 
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    ) : typedSignatures[field.id] ? (
                                      <p className="text-lg font-signature italic">{typedSignatures[field.id]}</p>
                                    ) : (
                                      <div className="text-center">
                                        <PenTool className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                                        <p className="text-xs text-gray-400">Signature</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {field.type === 'INITIALS' && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Input
                                      placeholder="Initiales"
                                      value={textValues[field.id] || ''}
                                      onChange={(e) => setTextValues(prev => ({ ...prev, [field.id]: e.target.value.toUpperCase() }))}
                                      className="h-full text-center font-semibold"
                                      maxLength={3}
                                    />
                                  </div>
                                )}
                                {field.type === 'DATE' && (
                                  <div className="w-full h-full flex items-center justify-center text-sm">
                                    {new Date().toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                                {field.type === 'TEXT' && (
                                  <Input
                                    placeholder={field.label || 'Texte'}
                                    value={textValues[field.id] || ''}
                                    onChange={(e) => setTextValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                    className="h-full text-sm"
                                  />
                                )}
                                {field.type === 'CHECKBOX' && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Checkbox
                                      checked={checkboxValues[field.id] || false}
                                      onCheckedChange={(checked) => 
                                        setCheckboxValues(prev => ({ ...prev, [field.id]: checked as boolean }))
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Document>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-gray-500">Aucun document disponible</p>
                    </div>
                  )}

                  {/* Navigation pages */}
                  {numPages && numPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} / {numPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                        disabled={currentPage === numPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Signature Input Panel */}
            {currentPageFields.some(f => f.type === 'SIGNATURE') && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Signature</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPageFields
                    .filter(f => f.type === 'SIGNATURE')
                    .map((field) => (
                      <div key={field.id} className="space-y-3">
                        {field.label && <Label>{field.label} {field.required && '*'}</Label>}
                        
                        {/* Options de signature */}
                        <div className="flex gap-2 mb-3">
                          <Button
                            variant={signatureData[field.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              // Dessiner signature
                              // Pour simplifier, on utilise une zone de dessin
                            }}
                          >
                            Dessiner
                          </Button>
                          <Button
                            variant={typedSignatures[field.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const name = prompt("Tapez votre nom complet pour signer:");
                              if (name) {
                                setTypedSignatures(prev => ({ ...prev, [field.id]: name }));
                              }
                            }}
                          >
                            Taper
                          </Button>
                          {(signatureData[field.id] || typedSignatures[field.id]) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => clearSignature(field.id)}
                            >
                              Effacer
                            </Button>
                          )}
                        </div>

                        {/* Zone de signature */}
                        <div className="border-2 border-dashed rounded-lg p-4 bg-white">
                          {signatureData[field.id] ? (
                            <img src={signatureData[field.id]} alt="Signature" className="max-w-full h-32 object-contain mx-auto" />
                          ) : typedSignatures[field.id] ? (
                            <p className="text-center text-2xl font-signature italic py-8">{typedSignatures[field.id]}</p>
                          ) : (
                            <div className="h-32 flex items-center justify-center text-gray-400">
                              <p>Votre signature apparaîtra ici</p>
                            </div>
                          )}
                        </div>

                        {/* Canvas caché pour dessiner */}
                        <canvas
                          ref={setCanvasRef}
                          width={300}
                          height={100}
                          className="border rounded hidden"
                          onMouseDown={(e) => startDrawing(field.id, e)}
                          onMouseMove={draw}
                          onMouseUp={() => stopDrawing(field.id)}
                          onMouseLeave={() => stopDrawing(field.id)}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Fields List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Champs à compléter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipientFields.map((field) => {
                  let isCompleted = false;
                  if (field.type === 'SIGNATURE') {
                    isCompleted = !!(signatureData[field.id] || typedSignatures[field.id]);
                  } else if (field.type === 'DATE') {
                    isCompleted = true;
                  } else if (field.type === 'TEXT' || field.type === 'INITIALS') {
                    isCompleted = !!(textValues[field.id]?.length > 0);
                  } else if (field.type === 'CHECKBOX') {
                    isCompleted = checkboxValues[field.id] === true;
                  }

                  return (
                    <div
                      key={field.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        isCompleted ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
                      } ${field.pageNumber === currentPage ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setCurrentPage(field.pageNumber)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {field.label || field.type}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Page {field.pageNumber}</span>
                        {field.required && (
                          <Badge variant="outline" className="text-xs">Requis</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={hasAcceptedTerms}
                      onCheckedChange={(checked) => setHasAcceptedTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-xs cursor-pointer">
                      <strong>J'accepte d'utiliser la signature électronique *</strong>
                      <p className="text-gray-600 mt-1">
                        Je reconnais que ma signature électronique a la même valeur légale qu'une signature manuscrite
                        conformément au règlement eIDAS.
                      </p>
                    </label>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">Sécurité garantie</p>
                        <p className="text-blue-800">
                          Votre signature est protégée par cryptographie et horodatage certifié.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Button
                    onClick={handleSign}
                    disabled={!allRequiredFieldsFilled() || !hasAcceptedTerms || isSigning}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {isSigning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signature en cours...
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4 mr-2" />
                        Signer le document
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowRefuseDialog(true)}
                    variant="destructive"
                    className="w-full"
                    disabled={isSigning}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Refuser de signer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Refuse Dialog */}
      {showRefuseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Refuser de signer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Veuillez indiquer la raison de votre refus. Tous les participants seront notifiés.
              </p>
              <Textarea
                placeholder="Motif du refus..."
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefuseDialog(false);
                    setRefuseReason('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRefuse}
                  disabled={!refuseReason.trim() || isSigning}
                >
                  {isSigning ? "Envoi..." : "Confirmer le refus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
