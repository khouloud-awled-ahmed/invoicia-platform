import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { 
  PenTool, Type, Calendar, CheckSquare, User,
  Send, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Trash2, Move, Loader2
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { Document, Page } from "react-pdf";
// Configuration du worker PDF.js - importée depuis le fichier de config global
import "../lib/pdf-worker-config";

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  color: string;
  signatureRequired?: boolean; // true = doit signer, false = copie seulement
}

interface Envelope {
  id: string;
  title: string;
  documentName?: string;
  documents?: Array<{ id: string; fileName: string; fileUrl: string; order: number }>;
  signers: Signer[];
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
  documentId?: string; // ID du document auquel ce champ appartient
}

interface DocumentPreparationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envelope: Envelope;
  onSave: (fields: SignatureField[]) => void;
}

const FIELD_TYPES = [
  { type: "signature", label: "Signature", icon: PenTool, defaultWidth: 200, defaultHeight: 60, color: "bg-blue-500" },
  { type: "initials", label: "Paraphe", icon: Type, defaultWidth: 80, defaultHeight: 40, color: "bg-purple-500" },
  { type: "date", label: "Date", icon: Calendar, defaultWidth: 120, defaultHeight: 30, color: "bg-green-500" },
  { type: "text", label: "Champ Texte", icon: Type, defaultWidth: 200, defaultHeight: 30, color: "bg-yellow-500" },
  { type: "checkbox", label: "Case à cocher", icon: CheckSquare, defaultWidth: 20, defaultHeight: 20, color: "bg-red-500" }
] as const;

function FieldPaletteItem({ type, label, icon: Icon, color }: any) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FIELD",
    item: { fieldType: type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`p-3 border-2 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 ${color} rounded flex items-center justify-center text-white`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

function DroppedField({ field, signer, onUpdate, onDelete, isSelected, onSelect }: any) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PLACED_FIELD",
    item: { id: field.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
  const Icon = fieldType?.icon || PenTool;

  return (
    <div
      ref={drag}
      onClick={() => onSelect(field.id)}
      className={`absolute cursor-move border-2 rounded flex items-center justify-center text-xs font-medium text-white transition-all ${
        isSelected ? "ring-4 ring-blue-300" : ""
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
      style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        backgroundColor: signer.color,
        borderColor: isSelected ? "#3B82F6" : signer.color
      }}
    >
      <Icon className="w-4 h-4 mr-1" />
      <span className="text-xs">{fieldType?.label}</span>
      {field.required && <span className="ml-1">*</span>}
    </div>
  );
}

interface DocumentPageProps {
  pageNumber: number;
  fields: SignatureField[];
  activeSigner: Signer;
  onDropField: (fieldType: string, page: number, x: number, y: number) => void;
  onUpdateField: (field: SignatureField) => void;
  onDeleteField: (fieldId: string) => void;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  pdfUrl?: string | null;
  zoom: number;
  allSigners: Signer[];
  documentId?: string;
}

function DocumentPage({ 
  pageNumber, 
  fields, 
  activeSigner, 
  onDropField, 
  onUpdateField, 
  onDeleteField,
  selectedFieldId,
  onSelectField,
  pdfUrl,
  zoom,
  allSigners,
  documentId
}: DocumentPageProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "FIELD",
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      const dropArea = document.getElementById(`page-${pageNumber}`);
      if (offset && dropArea) {
        const rect = dropArea.getBoundingClientRect();
        const x = offset.x - rect.left;
        const y = offset.y - rect.top;
        onDropField(item.fieldType, pageNumber, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  // Filtrer les champs pour cette page et ce document
  const pageFields = fields.filter((f: SignatureField) => 
    f.page === pageNumber && (!documentId || f.documentId === documentId)
  );

  return (
    <div
      id={`page-${pageNumber}`}
      ref={drop}
      className={`relative bg-white border-2 rounded-lg shadow-lg mx-auto transition-colors ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
      }`}
      style={{ 
        minWidth: "595px", 
        minHeight: "842px",
        position: 'relative',
      }}
    >
      {/* PDF Page Render - Le Page est rendu à l'intérieur du Document parent */}
      {pdfUrl ? (
        <div className="relative" style={{ position: 'relative', display: 'block', width: '595px', minHeight: '842px' }}>
          <Page
            pageNumber={pageNumber}
            scale={zoom / 100}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={595}
            className="border border-gray-200"
            loading={
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50" style={{ width: '595px', height: '842px' }}>
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            }
          />
        </div>
      ) : (
        // Fallback si pas de PDF
        <div className="absolute inset-0 p-12 text-gray-300 text-sm">
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            <div className="mt-8 h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-4/5"></div>
          </div>
        </div>
      )}

      {/* Page number */}
      <div className="absolute bottom-4 right-4 bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium">
        Page {pageNumber}
      </div>

      {/* Dropped fields */}
      {pageFields.map((field: SignatureField) => {
        const signer = allSigners.find(s => s.id === field.signerId) || activeSigner;
        return (
          <DroppedField
            key={field.id}
            field={field}
            signer={signer}
            onUpdate={onUpdateField}
            onDelete={onDeleteField}
            isSelected={selectedFieldId === field.id}
            onSelect={onSelectField}
          />
        );
      })}

      {/* Drop hint */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 pointer-events-none">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            Déposez le champ ici
          </div>
        </div>
      )}
    </div>
  );
}

export function DocumentPreparationDialog({ 
  open, 
  onOpenChange, 
  envelope, 
  onSave 
}: DocumentPreparationDialogProps) {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [activeSignerIndex, setActiveSignerIndex] = useState(0);
  const [fields, setFields] = useState<SignatureField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [documentPageCounts, setDocumentPageCounts] = useState<{ [key: number]: number }>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Récupérer le document actuel
  const currentDocument = envelope.documents && envelope.documents.length > 0
    ? envelope.documents[currentDocumentIndex]
    : null;
  const pdfUrl = currentDocument?.fileUrl || null;
  
  // Créer l'objet PDF avec headers d'authentification
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const pdfFile = useMemo(() => {
    if (!pdfUrl) return null;
    
    // Si c'est une URL relative ou absolue vers notre API, ajouter les headers
    const isApiUrl = pdfUrl.startsWith('/api/') || 
                     pdfUrl.includes('localhost') || 
                     (typeof window !== 'undefined' && pdfUrl.includes(window.location.hostname));
    
    if (isApiUrl) {
      const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:3001${pdfUrl}`;
      return {
        url: fullUrl,
        httpHeaders: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
      };
    }
    
    // Pour les URLs externes, retourner l'URL telle quelle
    return pdfUrl;
  }, [pdfUrl, token]);
  
  const totalPages = numPages || 1;
  
  // Réinitialiser la page quand on change de document
  useEffect(() => {
    setCurrentPage(1);
    setNumPages(documentPageCounts[currentDocumentIndex] || null);
  }, [currentDocumentIndex]);

  const activeSigner = envelope.signers[activeSignerIndex];
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleDropField = (fieldType: string, page: number, x: number, y: number) => {
    const fieldTypeConfig = FIELD_TYPES.find(ft => ft.type === fieldType);
    console.log('DROP:', fieldType, page, x, y, 'doc:', currentDocument?.id);
    if (!fieldTypeConfig || !currentDocument) { console.log('BLOCKED - fieldTypeConfig:', fieldTypeConfig, 'currentDocument:', currentDocument); return; }

    const newField: SignatureField = {
      id: `field-${Date.now()}-${Math.random()}`,
      type: fieldType as any,
      signerId: activeSigner.id,
      page,
      x: Math.max(0, Math.min(x - fieldTypeConfig.defaultWidth / 2, 595 - fieldTypeConfig.defaultWidth)),
      y: Math.max(0, Math.min(y - fieldTypeConfig.defaultHeight / 2, 842 - fieldTypeConfig.defaultHeight)),
      width: fieldTypeConfig.defaultWidth,
      height: fieldTypeConfig.defaultHeight,
      required: fieldType === "signature", // Signature is required by default
      documentId: currentDocument.id
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`Champ "${fieldTypeConfig.label}" ajouté`);
  };

  const handleDeleteField = () => {
    if (selectedFieldId) {
      setFields(fields.filter(f => f.id !== selectedFieldId));
      setSelectedFieldId(null);
      toast.success("Champ supprimé");
    }
  };

  const handleToggleRequired = () => {
    if (selectedField) {
      setFields(fields.map(f => 
        f.id === selectedFieldId ? { ...f, required: !f.required } : f
      ));
    }
  };

  const handleSend = async () => {
    // Filtrer les signataires qui doivent effectivement signer (exclure les copies)
    const signersWhoMustSign = envelope.signers.filter(s => s.signatureRequired !== false);
    
    // Validate: each signer (who must sign) must have at least one signature field
    const signersWithSignature = new Set(
      fields.filter(f => f.type === "signature").map(f => f.signerId)
    );

    const missingSigners = signersWhoMustSign.filter(s => !signersWithSignature.has(s.id));

    if (missingSigners.length > 0) {
      toast.error(
        `Chaque signataire doit avoir au moins un champ Signature. Manquant pour : ${missingSigners.map(s => s.name).join(", ")}`
      );
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('fields before map:', JSON.stringify(fields));
      // Convertir les champs au format attendu par l'API
      const fieldsToSave = fields.map(field => ({
        type: field.type.toUpperCase() as 'SIGNATURE' | 'INITIALS' | 'DATE' | 'TEXT' | 'CHECKBOX',
        pageNumber: field.page,
        xPosition: field.x,
        yPosition: field.y,
        width: field.width,
        height: field.height,
        assignedRecipientId: field.signerId,
        linkedDocumentId: field.documentId || currentDocument?.id || envelope.documents?.[0]?.id || '',
        label: field.label,
        required: field.required,
      }));

      await onSave(fieldsToSave);
      toast.success("Enveloppe envoyée avec succès !");
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      let errorMessage = 'Erreur lors de l\'envoi de l\'enveloppe';
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
      setIsSaving(false);
    }
  };

  const activeSignerFields = fields.filter(f => f.signerId === activeSigner.id);

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <div className="flex h-full">
            {/* Left Sidebar - Palette */}
            <div className="w-80 border-r p-6 overflow-y-auto bg-gray-50">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-lg">Préparer le Document</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {envelope.title}
                </p>
              </DialogHeader>

              {/* Signer Selector */}
              <div className="mb-6">
                <Label className="mb-2 block">Signataire actif</Label>
                <div className="space-y-2">
                  {envelope.signers.map((signer, index) => (
                    <button
                      key={signer.id}
                      onClick={() => {
                        setActiveSignerIndex(index);
                        setSelectedFieldId(null);
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        activeSignerIndex === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: signer.color
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: signer.color }}
                          >
                            {signer.order}
                          </div>
                          <span className="font-medium text-sm">{signer.name}</span>
                        </div>
                        {signer.signatureRequired === false && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">📧 Copie</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{signer.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {signer.signatureRequired === false 
                          ? "Copie uniquement (ne signe pas)"
                          : `${fields.filter(f => f.signerId === signer.id).length} champ(s) placé(s)`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Signer Info */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${activeSigner.color}15` }}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" style={{ color: activeSigner.color }} />
                  <span className="font-semibold text-sm">Placer des champs pour :</span>
                </div>
                <p className="text-sm font-medium">{activeSigner.name}</p>
                <p className="text-xs text-muted-foreground">{activeSignerFields.length} champ(s) placé(s)</p>
              </div>

              {/* Field Palette */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold">Champs disponibles</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Glissez-déposez les champs sur le document
                </p>
                {FIELD_TYPES.map((fieldType) => (
                  <FieldPaletteItem key={fieldType.type} {...fieldType} />
                ))}
              </div>

              {/* Field Properties */}
              {selectedField && (
                <div className="border-t pt-4 space-y-4">
                  <Label className="text-sm font-semibold">Propriétés du champ</Label>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Type :</strong> {FIELD_TYPES.find(ft => ft.type === selectedField.type)?.label}
                    </p>
                    <p className="text-sm">
                      <strong>Page :</strong> {selectedField.page}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="required" className="text-sm">Champ obligatoire</Label>
                    <Switch
                      id="required"
                      checked={selectedField.required}
                      onCheckedChange={handleToggleRequired}
                    />
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleDeleteField}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer ce champ
                  </Button>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                <p className="font-semibold text-blue-900">💡 Instructions :</p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Sélectionnez un signataire</li>
                  <li>Glissez un champ sur le document</li>
                  <li>Répétez pour tous les signataires</li>
                  <li>Chaque signataire doit avoir ≥1 signature</li>
                </ul>
              </div>
            </div>

            {/* Main Area - Document */}
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="border-b p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Sélecteur de document */}
                  {envelope.documents && envelope.documents.length > 1 && (
                    <>
                      <span className="text-sm text-muted-foreground">Document:</span>
                      <select
                        value={currentDocumentIndex}
                        onChange={(e) => setCurrentDocumentIndex(parseInt(e.target.value))}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {envelope.documents.map((doc, index) => (
                          <option key={index} value={index}>
                            {doc.fileName || `Document ${index + 1}`}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-muted-foreground">|</span>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(150, zoom + 10))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={isSaving || fields.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer pour signature
                    </>
                  )}
                </Button>
              </div>

              {/* Document View */}
              <div className="flex-1 overflow-auto p-8 bg-gray-100">
                {pdfFile ? (
                  <div className="flex justify-center">
                    <Document
                      file={pdfFile}
                      loading={
                        <div className="flex items-center justify-center h-full min-h-[600px]">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Chargement du PDF...</p>
                          </div>
                        </div>
                      }
                      onLoadSuccess={({ numPages }) => {
                        setNumPages(numPages);
                        setDocumentPageCounts(prev => ({ ...prev, [currentDocumentIndex]: numPages }));
                        setPdfLoading(false);
                      }}
                      onLoadError={(error) => {
                        console.error('PDF load error:', error);
                        setPdfError(`Erreur lors du chargement du PDF: ${error.message}`);
                        setPdfLoading(false);
                        toast.error("Erreur lors du chargement du PDF");
                      }}
                      onLoadStart={() => {
                        setPdfLoading(true);
                        setPdfError(null);
                      }}
                      error={
                        <div className="flex items-center justify-center min-h-[600px] p-8">
                          <div className="text-center text-red-600">
                            <p className="mb-2">Erreur lors du chargement du PDF</p>
                            {pdfError && <p className="text-sm">{pdfError}</p>}
                          </div>
                        </div>
                      }
                    >
                      <DocumentPage
                        pageNumber={currentPage}
                        fields={fields}
                        activeSigner={activeSigner}
                        onDropField={handleDropField}
                        onUpdateField={(field) => {
                          setFields(fields.map(f => f.id === field.id ? field : f));
                        }}
                        onDeleteField={handleDeleteField}
                        selectedFieldId={selectedFieldId}
                        onSelectField={setSelectedFieldId}
                        pdfUrl={pdfUrl}
                        zoom={zoom}
                        allSigners={envelope.signers}
                        documentId={currentDocument?.id}
                      />
                    </Document>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[600px]">
                    <div className="text-center text-gray-500">
                      <p className="mb-2">Aucun document PDF disponible</p>
                      <p className="text-sm">Veuillez ajouter un document à l'enveloppe</p>
                    </div>
                  </div>
                )}
                {pdfError && (
                  <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
                    {pdfError}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="border-t p-3 bg-white flex items-center justify-between text-xs">
                <div className="flex gap-6">
                  <span>Total des champs : <strong>{fields.length}</strong></span>
                  <span>Page actuelle : <strong>{fields.filter(f => f.page === currentPage).length}</strong></span>
                </div>
                <span className="text-muted-foreground">
                  Cliquez sur un champ pour le sélectionner et modifier ses propriétés
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}



