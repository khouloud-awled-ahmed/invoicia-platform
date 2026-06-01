import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sparkles,
  Upload,
  Wand2,
  FileImage,
  FileText,
  CheckCircle2,
  Loader2,
  Eye,
  Download,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logo?: string;
  customFields: any[];
  showFooter: boolean;
  footerText: string;
  showBankDetails: boolean;
  showQRCode: boolean;
  layout: "classic" | "modern" | "minimal";
}

interface AITemplateGeneratorProps {
  onTemplateGenerated: (config: TemplateConfig) => void;
}

export function AITemplateGenerator({ onTemplateGenerated }: AITemplateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [textDescription, setTextDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedConfig, setGeneratedConfig] = useState<TemplateConfig | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        return;
      }

      const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Format non supporté. Utilisez PNG, JPG ou PDF");
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      
      toast.success(`Fichier "${file.name}" chargé avec succès`);
    }
  };

  const handleGenerateFromText = async () => {
    if (!textDescription.trim()) {
      toast.error("Veuillez saisir une description");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // TODO: Implémenter generateTemplateFromText dans api-client-backend.ts
      // const result = await apiClient.generateTemplateFromText(textDescription);
      // setGeneratedConfig(result);
      
      toast.error("Fonctionnalité de génération de template IA en cours d'implémentation");
      setGenerationProgress(100);
    } catch (error: any) {
      console.error("Erreur lors de la génération:", error);
      toast.error(error?.message || "Erreur lors de la génération du template");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromImage = async () => {
    if (!uploadedFile) {
      toast.error("Veuillez importer un fichier");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // TODO: Implémenter generateTemplateFromImage dans api-client-backend.ts
      // const formData = new FormData();
      // formData.append('file', uploadedFile);
      // const result = await apiClient.generateTemplateFromImage(formData);
      // setGeneratedConfig(result);
      
      toast.error("Fonctionnalité de génération de template IA depuis image en cours d'implémentation");
      setGenerationProgress(100);
    } catch (error: any) {
      console.error("Erreur lors de la génération:", error);
      toast.error(error?.message || "Erreur lors de la génération du template");
    } finally {
      setIsGenerating(false);
    }
  };


  const handleApplyTemplate = () => {
    if (generatedConfig) {
      onTemplateGenerated(generatedConfig);
      toast.success("Modèle appliqué avec succès !");
    }
  };

  const renderGeneratedPreview = () => {
    if (!generatedConfig) return null;

    return (
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle>Modèle Généré par IA</CardTitle>
            </div>
            <Badge className="bg-blue-600">
              Confiance: {analysisResult?.confidence}%
            </Badge>
          </div>
          <CardDescription>
            Votre modèle personnalisé est prêt à être utilisé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mise en page</Label>
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span className="text-sm capitalize">{generatedConfig.layout}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Police</Label>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="text-sm">{generatedConfig.fontFamily}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Couleur principale</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: generatedConfig.primaryColor }}
                />
                <span className="text-sm">{generatedConfig.primaryColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Couleur secondaire</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: generatedConfig.secondaryColor }}
                />
                <span className="text-sm">{generatedConfig.secondaryColor}</span>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {generatedConfig.customFields.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Champs détectés ({generatedConfig.customFields.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {generatedConfig.customFields.map((field: any) => (
                  <Badge key={field.id} variant="outline">
                    {field.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mini Preview */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="space-y-2">
              <div
                className="h-2 rounded"
                style={{ backgroundColor: generatedConfig.primaryColor }}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-gray-100 rounded" />
                <div className="h-8 bg-gray-100 rounded" />
              </div>
              <div
                className="h-16 rounded"
                style={{ 
                  background: `linear-gradient(135deg, ${generatedConfig.primaryColor}22 0%, ${generatedConfig.secondaryColor}22 100%)` 
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleApplyTemplate} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Appliquer ce modèle
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Aperçu du Modèle IA</DialogTitle>
                  <DialogDescription>
                    Prévisualisation de votre modèle généré par intelligence artificielle
                  </DialogDescription>
                </DialogHeader>
                <div className="border rounded-lg p-6 bg-white">
                  <div
                    className="border-b-2 pb-4 mb-4"
                    style={{ borderColor: generatedConfig.primaryColor }}
                  >
                    <h2
                      className="text-2xl mb-2"
                      style={{ 
                        color: generatedConfig.primaryColor,
                        fontFamily: generatedConfig.fontFamily 
                      }}
                    >
                      FACTURE
                    </h2>
                    <p className="text-sm text-gray-600">N° FAC-2025-001</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-gray-100 rounded" />
                      <div className="h-16 bg-gray-100 rounded" />
                    </div>
                    <div
                      className="h-32 rounded"
                      style={{ 
                        background: `linear-gradient(135deg, ${generatedConfig.primaryColor}11 0%, ${generatedConfig.secondaryColor}11 100%)` 
                      }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl tracking-tight">Assistant IA de Création</h2>
        </div>
        <p className="text-muted-foreground">
          Décrivez votre facture idéale ou importez un modèle existant
        </p>
      </div>

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            Description Textuelle
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <FileImage className="h-4 w-4" />
            Import d'Image
          </TabsTrigger>
        </TabsList>

        {/* Text Description Tab */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Décrivez votre facture
              </CardTitle>
              <CardDescription>
                Utilisez le langage naturel pour décrire le style de facture souhaité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Exemple: Je veux une facture moderne avec des couleurs bleues, une police élégante, un QR code pour le paiement, et des champs pour le numéro de commande et le code projet. Le design doit être épuré et professionnel."
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Astuce: Mentionnez les couleurs, le style (moderne/classique/minimal), les polices, et les informations spécifiques à inclure
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <Label className="text-sm">Exemples de descriptions</Label>
                <div className="space-y-2">
                  {[
                    "Facture minimaliste avec couleurs vertes, police Arial, et champ pour numéro de commande",
                    "Modèle classique avec couleurs bleues traditionnelles, police Times New Roman, et coordonnées bancaires",
                    "Design moderne et épuré avec violet, QR code de paiement, et champs projet + engagement",
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setTextDescription(example)}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateFromText}
                disabled={isGenerating || !textDescription.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer le modèle avec l'IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Upload Tab */}
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importer un modèle
              </CardTitle>
              <CardDescription>
                Téléchargez une image ou un PDF de facture existante à reproduire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fichier modèle</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-md mx-auto">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full rounded-lg border"
                        />
                      </div>
                      <div>
                        <p className="text-sm mb-2">
                          <strong>{uploadedFile?.name}</strong>
                        </p>
                        <label htmlFor="file-upload-replace" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Changer le fichier
                            </span>
                          </Button>
                        </label>
                        <input
                          id="file-upload-replace"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-16 w-16 mx-auto text-blue-600" />
                      <p className="text-sm">
                        <strong>{uploadedFile.name}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF téléchargé</p>
                      <label htmlFor="file-upload-replace-2" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Changer le fichier
                          </span>
                        </Button>
                      </label>
                      <input
                        id="file-upload-replace-2"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-16 w-16 mx-auto text-gray-400" />
                      <div>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Sélectionner un fichier
                            </span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG ou PDF • Max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  L'IA va analyser :
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Les couleurs dominantes et le schéma chromatique</li>
                  <li>• La structure et la mise en page (colonnes, sections)</li>
                  <li>• Le style typographique et les polices utilisées</li>
                  <li>• Les éléments visuels (logo, QR code, etc.)</li>
                  <li>• Les champs d'information présents</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateFromImage}
                disabled={isGenerating || !uploadedFile}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyser et générer le modèle
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-blue-500">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Génération en cours...
                </span>
                <span className="text-muted-foreground">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Template Preview */}
      {generatedConfig && !isGenerating && renderGeneratedPreview()}
    </div>
  );
}
