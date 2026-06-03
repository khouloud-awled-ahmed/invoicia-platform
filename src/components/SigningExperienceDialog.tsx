import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { 
  PenTool, CheckCircle2, ChevronLeft, ChevronRight,
  Shield, Mail, Clock, FileText
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

interface Envelope {
  id: string;
  title: string;
  documentName: string;
  message?: string;
  signers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    order: number;
    color: string;
    status?: string;
  }>;
  fields?: Array<{
    id: string;
    type: string;
    page: number;
    label?: string;
    required?: boolean;
  }>;
}

interface SigningExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envelope: Envelope;
  onComplete: () => void;
}

export function SigningExperienceDialog({
  open,
  onOpenChange,
  envelope,
  onComplete
}: SigningExperienceDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "upload">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [initialsValue, setInitialsValue] = useState("");
  const [textFieldValues, setTextFieldValues] = useState<Record<string, string>>({});
  const [checkboxValues, setCheckboxValues] = useState<Record<string, boolean>>({});
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Canvas refs and drawing logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPos.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = { x, y };
    // Mark canvas as having signature content
    setTypedSignature("__drawn__");
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTypedSignature("");
  };

  useEffect(() => {
    if (open) {
      setTypedSignature("");
      setHasAcceptedTerms(false);
      setCurrentPage(1);
    }
  }, [open]);

  const totalPages = 3;

  const currentSigner =
    envelope.signers.find(
      (s: any) =>
        s.status === "in_progress" ||
        s.status === "pending" ||
        s.status === "WAITING" ||
        s.status === "SENT"
    ) || envelope.signers[0];

  const signatureFields = envelope.fields || [];

  const allRequiredFieldsFilled = () => {
    return true;
  };

  const handleSign = async () => {
    if (!allRequiredFieldsFilled()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (!hasAcceptedTerms) {
      toast.error("Veuillez accepter les conditions de signature electronique");
      return;
    }
    try {
      const signatureData = {
        fieldValues: [
          ...Object.entries(textFieldValues).map(([fieldId, value]) => ({
            fieldId,
            value,
          })),
          ...(typedSignature
            ? [
                {
                  fieldId:
                    (
                      envelope.fields?.find(
                        (f) => f.type === "SIGNATURE" || f.type === "signature"
                      ) || envelope.fields?.[0]
                    )?.id || "signature",
                  value: typedSignature,
                  signatureData: typedSignature,
                },
              ]
            : []),
          ...(initialsValue
            ? [{ fieldId: "initials", value: initialsValue }]
            : []),
        ],
      };
      await apiClient.signEnvelope(envelope.id, signatureData, currentSigner.email);
      toast.success("Document signe avec succes !");
      onComplete();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la signature");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[95vh] p-0 flex flex-col">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="border-b p-6 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{envelope.title}</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {envelope.documentName}
                </p>
                <Badge className="bg-blue-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Signature Électronique Sécurisée
                </Badge>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Mail className="w-4 h-4" />
                  {currentSigner.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date().toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {envelope.message && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Message de l'expéditeur :</strong> {envelope.message}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Document Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg p-12 mb-6 min-h-[800px]">
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {envelope.title}
                      </h1>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>

                    {currentPage === 1 && (
                      <>
                        <p className="mb-4">
                          Ce document constitue un accord entre les parties mentionnées ci-dessous.
                        </p>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-6"></div>

                        {/* Signature Field */}
                        <div
                          className="mt-12 p-6 border-2 border-dashed rounded-lg"
                          style={{ borderColor: currentSigner.color }}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span
                              className="font-semibold"
                              style={{ color: currentSigner.color }}
                            >
                              <PenTool className="w-4 h-4 inline mr-2" />
                              Signature requise *
                            </span>
                            {typedSignature && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </div>

                          {/* Toggle buttons */}
                          <div className="flex gap-2 mb-3">
                            <button
                              onClick={() => setSignatureType("draw")}
                              className={
                                signatureType === "draw"
                                  ? "px-3 py-1 text-xs rounded bg-blue-600 text-white"
                                  : "px-3 py-1 text-xs rounded bg-gray-100"
                              }
                            >
                              Dessiner
                            </button>
                            <button
                              onClick={() => setSignatureType("type")}
                              className={
                                signatureType === "type"
                                  ? "px-3 py-1 text-xs rounded bg-blue-600 text-white"
                                  : "px-3 py-1 text-xs rounded bg-gray-100"
                              }
                            >
                              Taper
                            </button>
                          </div>

                          {/* Draw or Type */}
                          {signatureType === "draw" ? (
                            <div>
                              <canvas
                                ref={canvasRef}
                                width={380}
                                height={120}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="border-2 border-gray-300 rounded cursor-crosshair w-full"
                                style={{ background: "white" }}
                              />
                              <button
                                onClick={clearCanvas}
                                className="mt-1 text-xs text-red-500"
                              >
                                Effacer
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Input
                                placeholder="Tapez votre nom complet..."
                                value={typedSignature === "__drawn__" ? "" : typedSignature}
                                onChange={(e) => setTypedSignature(e.target.value)}
                                className="text-lg"
                              />
                              {typedSignature && typedSignature !== "__drawn__" && (
                                <p
                                  className="text-4xl font-serif italic mt-2"
                                  style={{ color: currentSigner.color }}
                                >
                                  {typedSignature}
                                </p>
                              )}
                              {!typedSignature && (
                                <p className="text-gray-400 text-sm mt-2">
                                  Votre signature apparaîtra ici
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Date Field */}
                        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                          <span className="font-semibold text-green-800">
                            Date de signature :{" "}
                            {new Date().toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </>
                    )}

                    {currentPage === 2 && (
                      <>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6 mb-6"></div>

                        {/* Initials Field */}
                        <div
                          className="mt-12 p-6 border-2 border-dashed rounded-lg"
                          style={{ borderColor: currentSigner.color }}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span
                              className="font-semibold"
                              style={{ color: currentSigner.color }}
                            >
                              Paraphe (Initiales) *
                            </span>
                            {initialsValue && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div className="bg-white border-2 rounded h-20 flex items-center justify-center mb-3">
                            {initialsValue ? (
                              <p
                                className="text-2xl font-semibold"
                                style={{ color: currentSigner.color }}
                              >
                                {initialsValue}
                              </p>
                            ) : (
                              <p className="text-gray-400 text-sm">
                                Vos initiales apparaîtront ici
                              </p>
                            )}
                          </div>
                          <Input
                            placeholder="Vos initiales (ex: JM)..."
                            value={initialsValue}
                            onChange={(e) =>
                              setInitialsValue(e.target.value.toUpperCase())
                            }
                            maxLength={3}
                            className="text-center"
                          />
                        </div>

                        {/* Text Field */}
                        <div
                          className="mt-6 p-4 border-2 rounded-lg"
                          style={{ borderColor: currentSigner.color }}
                        >
                          <label
                            className="font-semibold block mb-2"
                            style={{ color: currentSigner.color }}
                          >
                            Votre fonction (optionnel)
                          </label>
                          <Input
                            placeholder="Ex: Directeur Général, Responsable Achats..."
                            value={textFieldValues["text1"] || ""}
                            onChange={(e) =>
                              setTextFieldValues({
                                ...textFieldValues,
                                text1: e.target.value,
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {currentPage === 3 && (
                      <>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-4/5 mb-6"></div>

                        {/* Another Initials Field */}
                        <div
                          className="mt-6 p-4 border-2 border-dashed rounded-lg"
                          style={{ borderColor: currentSigner.color }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="font-semibold"
                              style={{ color: currentSigner.color }}
                            >
                              Paraphe page 3 *
                            </span>
                            {initialsValue && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div className="bg-white border-2 rounded h-16 flex items-center justify-center">
                            <p
                              className="text-xl font-semibold"
                              style={{ color: currentSigner.color }}
                            >
                              {initialsValue || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Checkbox Field */}
                        <div
                          className="mt-6 p-4 border-2 rounded-lg"
                          style={{ borderColor: currentSigner.color }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="check1"
                              checked={checkboxValues["check1"] || false}
                              onCheckedChange={(checked) =>
                                setCheckboxValues({
                                  ...checkboxValues,
                                  check1: checked as boolean,
                                })
                              }
                            />
                            <label htmlFor="check1" className="text-sm cursor-pointer">
                              <strong>J'accepte les termes et conditions *</strong>
                              <p className="text-muted-foreground mt-1">
                                Je certifie avoir lu et accepté l'intégralité du
                                présent document.
                              </p>
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Page Number */}
                  <div className="text-center text-sm text-gray-500 mt-8 pt-8 border-t">
                    Page {currentPage} sur {totalPages}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Progress */}
            <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
              <h3 className="font-semibold mb-4">Champs à compléter</h3>

              <div className="space-y-3 mb-6">
                {signatureFields.map((field) => {
                  let isCompleted = false;
                  if (field.type === "signature")
                    isCompleted = typedSignature.length > 0;
                  if (field.type === "initials")
                    isCompleted = initialsValue.length > 0;
                  if (field.type === "date") isCompleted = true;
                  if (field.type === "text")
                    isCompleted =
                      !field.required ||
                      textFieldValues[field.id]?.length > 0;
                  if (field.type === "checkbox")
                    isCompleted = checkboxValues[field.id];

                  return (
                    <div
                      key={field.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        isCompleted
                          ? "bg-green-50 border-green-300"
                          : "bg-white border-gray-200"
                      }`}
                      onClick={() => setCurrentPage(field.page)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{field.label}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Page {field.page}</span>
                        {field.required && (
                          <Badge variant="outline" className="text-xs">
                            Requis
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={hasAcceptedTerms}
                    onCheckedChange={(checked) =>
                      setHasAcceptedTerms(checked as boolean)
                    }
                  />
                  <label htmlFor="terms" className="text-xs cursor-pointer">
                    <strong>
                      J'accepte d'utiliser la signature électronique *
                    </strong>
                    <p className="text-muted-foreground mt-1">
                      Je reconnais que ma signature électronique a la même
                      valeur légale qu'une signature manuscrite conformément au
                      règlement eIDAS.
                    </p>
                  </label>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">
                        Sécurité garantie
                      </p>
                      <p className="text-blue-800">
                        Votre signature est protégée par cryptographie et
                        horodatage certifié.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-white flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Page précédente
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Page suivante
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Button
              onClick={handleSign}
              disabled={!allRequiredFieldsFilled() || !hasAcceptedTerms}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Finaliser la Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}