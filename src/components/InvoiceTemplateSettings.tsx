import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Palette,
  Settings,
  Save,
  Check,
  Image as ImageIcon,
  Type,
  Layout,
  Upload,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AITemplateGenerator } from "./AITemplateGenerator";
import { useInvoiceTemplate } from "../utils/invoiceTemplateContext";
import type { CustomField, TemplateConfig } from "../utils/invoiceTemplateContext";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { useEffect } from "react";

const PREDEFINED_TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    name: "Classique",
    description: "Modèle traditionnel avec toutes les informations",
    primaryColor: "#1e40af",
    secondaryColor: "#60a5fa",
    fontFamily: "Arial",
    customFields: [],
    showFooter: true,
    footerText: "Merci pour votre confiance",
    showBankDetails: true,
    showQRCode: false,
    layout: "classic",
  },
  {
    id: "modern",
    name: "Moderne",
    description: "Design épuré et contemporain",
    primaryColor: "#7c3aed",
    secondaryColor: "#c084fc",
    fontFamily: "Helvetica",
    customFields: [],
    showFooter: true,
    footerText: "Paiement par virement ou carte bancaire accepté",
    showBankDetails: true,
    showQRCode: true,
    layout: "modern",
  },
  {
    id: "minimal",
    name: "Minimaliste",
    description: "Simple et élégant, l'essentiel uniquement",
    primaryColor: "#0f172a",
    secondaryColor: "#64748b",
    fontFamily: "Verdana",
    customFields: [],
    showFooter: false,
    footerText: "",
    showBankDetails: true,
    showQRCode: false,
    layout: "minimal",
  },
];

const COMMON_CUSTOM_FIELDS = [
  { label: "Numéro de commande", type: "text" as const },
  { label: "ID d'engagement", type: "text" as const },
  { label: "Code projet", type: "text" as const },
  { label: "Référence client", type: "text" as const },
  { label: "Date de livraison", type: "date" as const },
  { label: "Mode de paiement", type: "select" as const, options: ["Virement", "Carte", "Chèque", "Espèces"] },
  { label: "Conditions de paiement", type: "select" as const, options: ["Immédiat", "30 jours", "60 jours", "90 jours"] },
  { label: "N° bon de commande", type: "text" as const },
  { label: "Code affaire", type: "text" as const },
  { label: "Contact client", type: "text" as const },
];

export function InvoiceTemplateSettings() {
  const { templateConfig, setTemplateConfig, updateLogo } = useInvoiceTemplate();
  const { tenant } = useCompanySettings();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templateConfig.id);
  const [currentConfig, setCurrentConfig] = useState<TemplateConfig>(templateConfig);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date" | "select">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Synchroniser le logo du tenant avec le template config
  useEffect(() => {
    if (tenant?.logo) {
      if (!templateConfig.logo || templateConfig.logo !== tenant.logo) {
        updateLogo(tenant.logo);
        setCurrentConfig(prev => ({ ...prev, logo: tenant.logo }));
      }
    }
  }, [tenant?.logo, templateConfig.logo, updateLogo]);

  const handleTemplateSelect = (templateId: string) => {
    const template = PREDEFINED_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCurrentConfig({ ...template });
      toast.success(`Modèle "${template.name}" sélectionné`);
    }
  };

  const handleColorChange = (type: "primary" | "secondary", color: string) => {
    setCurrentConfig({
      ...currentConfig,
      [type === "primary" ? "primaryColor" : "secondaryColor"]: color,
    });
  };

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) {
      toast.error("Le nom du champ est requis");
      return;
    }

    const newField: CustomField = {
      id: `field-${Date.now()}`,
      label: newFieldLabel,
      type: newFieldType,
      required: newFieldRequired,
    };

    setCurrentConfig({
      ...currentConfig,
      customFields: [...currentConfig.customFields, newField],
    });

    toast.success(`Champ "${newFieldLabel}" ajouté`);
    setIsAddFieldDialogOpen(false);
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
  };

  const handleRemoveCustomField = (fieldId: string) => {
    setCurrentConfig({
      ...currentConfig,
      customFields: currentConfig.customFields.filter((f) => f.id !== fieldId),
    });
    toast.success("Champ supprimé");
  };

  const handleAddCommonField = (field: typeof COMMON_CUSTOM_FIELDS[0]) => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      label: field.label,
      type: field.type,
      required: false,
      options: field.options,
    };

    setCurrentConfig({
      ...currentConfig,
      customFields: [...currentConfig.customFields, newField],
    });

    toast.success(`Champ "${field.label}" ajouté`);
  };

  const handleSaveTemplate = () => {
    setTemplateConfig(currentConfig);
    console.log("Saving template configuration:", currentConfig);
    toast.success("Modèle de facture enregistré avec succès !");
  };

  const renderPreview = () => {
    return (
      <div className="border rounded-lg p-8 bg-white shadow-lg max-w-2xl mx-auto">
        <style>
          {`
            .invoice-preview {
              font-family: ${currentConfig.fontFamily}, sans-serif;
            }
          `}
        </style>
        <div className="invoice-preview">
          {/* Header */}
          <div
            className="flex justify-between items-start mb-8 pb-4 border-b-2"
            style={{ borderColor: currentConfig.primaryColor }}
          >
            <div>
              {currentConfig.logo ? (
                <img
                  src={currentConfig.logo}
                  alt="Logo"
                  className="h-16 w-auto max-w-xs object-contain mb-2"
                />
              ) : (
                <div>
                  <h1
                    className="text-2xl mb-2"
                    style={{ color: currentConfig.primaryColor }}
                  >
                    Votre Entreprise
                  </h1>
                  <p className="text-sm text-gray-600">123 Rue de la Paix, 75000 Paris</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <h2
                className="text-3xl mb-2"
                style={{ color: currentConfig.primaryColor }}
              >
                FACTURE
              </h2>
              <p className="text-sm text-gray-600">N° FAC-2025-001</p>
              <p className="text-sm text-gray-600">Date: 11/11/2025</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3
                className="text-sm mb-2"
                style={{ color: currentConfig.secondaryColor }}
              >
                FACTURER À
              </h3>
              <p className="text-sm">Client Example SARL</p>
              <p className="text-sm text-gray-600">456 Avenue des Champs</p>
              <p className="text-sm text-gray-600">69000 Lyon</p>
            </div>

            {currentConfig.customFields.length > 0 && (
              <div>
                <h3
                  className="text-sm mb-2"
                  style={{ color: currentConfig.secondaryColor }}
                >
                  INFORMATIONS COMPLÉMENTAIRES
                </h3>
                {currentConfig.customFields.slice(0, 4).map((field) => (
                  <div key={field.id} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{field.label}:</span>
                    <span className="text-gray-800">
                      {field.type === "date" ? "11/11/2025" : "Exemple"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead>
              <tr
                className="text-left text-sm"
                style={{ 
                  backgroundColor: currentConfig.layout === "minimal" ? "#f8f9fa" : currentConfig.primaryColor,
                  color: currentConfig.layout === "minimal" ? "#000" : "#fff"
                }}
              >
                <th className="p-2">Description</th>
                <th className="p-2 text-center">Qté</th>
                <th className="p-2 text-right">Prix Unit.</th>
                <th className="p-2 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="p-2">Prestation exemple</td>
                <td className="p-2 text-center">1</td>
                <td className="p-2 text-right">1 000,00 €</td>
                <td className="p-2 text-right">1 000,00 €</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Total HT:</span>
                <span>1 000,00 €</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">TVA (20%):</span>
                <span>200,00 €</span>
              </div>
              <div
                className="flex justify-between text-lg pt-2 border-t-2"
                style={{ borderColor: currentConfig.primaryColor }}
              >
                <span className="font-bold">Total TTC:</span>
                <span
                  className="font-bold"
                  style={{ color: currentConfig.primaryColor }}
                >
                  1 200,00 €
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {currentConfig.showBankDetails && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="text-sm mb-2" style={{ color: currentConfig.secondaryColor }}>
                COORDONNÉES BANCAIRES
              </h3>
              <p className="text-xs text-gray-600">
                IBAN: FR76 1234 5678 9012 3456 7890 123
              </p>
              <p className="text-xs text-gray-600">BIC: BNPAFRPPXXX</p>
            </div>
          )}

          {/* Footer */}
          {currentConfig.showFooter && currentConfig.footerText && (
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              {currentConfig.footerText}
            </div>
          )}

          {/* QR Code */}
          {currentConfig.showQRCode && (
            <div className="flex justify-center mt-6">
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl tracking-tight">Modèles de Facture</h2>
          <p className="text-muted-foreground mt-1">
            Personnalisez l'apparence de vos factures
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Masquer" : "Aperçu"}
          </Button>
          <Button onClick={handleSaveTemplate} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">
            <Layout className="w-4 h-4 mr-2" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Assistant IA
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selection */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Choisir un Modèle
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez un modèle prédéfini ou créez le vôtre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PREDEFINED_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === template.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="mb-3">
                          <div
                            className="w-full h-32 rounded border-2 mb-2"
                            style={{
                              borderColor: template.primaryColor,
                              background: `linear-gradient(135deg, ${template.primaryColor}22 0%, ${template.secondaryColor}22 100%)`,
                            }}
                          />
                        </div>
                        <h3 className="text-lg mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="colors" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="colors">Couleurs</TabsTrigger>
                  <TabsTrigger value="fields">Champs</TabsTrigger>
                  <TabsTrigger value="layout">Mise en page</TabsTrigger>
                  <TabsTrigger value="advanced">Avancé</TabsTrigger>
                </TabsList>

                {/* Colors Tab */}
                <TabsContent value="colors">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Personnalisation des Couleurs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Couleur Principale</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={currentConfig.primaryColor}
                              onChange={(e) => handleColorChange("primary", e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={currentConfig.primaryColor}
                              onChange={(e) => handleColorChange("primary", e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Couleur Secondaire</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={currentConfig.secondaryColor}
                              onChange={(e) => handleColorChange("secondary", e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={currentConfig.secondaryColor}
                              onChange={(e) => handleColorChange("secondary", e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Police de caractères</Label>
                        <Select
                          value={currentConfig.fontFamily}
                          onValueChange={(value) =>
                            setCurrentConfig({ ...currentConfig, fontFamily: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Custom Fields Tab */}
                <TabsContent value="fields">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5" />
                            Champs Personnalisés
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Ajoutez des informations supplémentaires à vos factures
                          </CardDescription>
                        </div>
                        <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Nouveau Champ Personnalisé</DialogTitle>
                              <DialogDescription>
                                Créez un champ supplémentaire pour vos factures
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Nom du champ *</Label>
                                <Input
                                  placeholder="Ex: Numéro de commande"
                                  value={newFieldLabel}
                                  onChange={(e) => setNewFieldLabel(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Type de champ</Label>
                                <Select
                                  value={newFieldType}
                                  onValueChange={(value: any) => setNewFieldType(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Texte</SelectItem>
                                    <SelectItem value="number">Nombre</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="select">Liste déroulante</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={newFieldRequired}
                                  onCheckedChange={setNewFieldRequired}
                                />
                                <Label>Champ obligatoire</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
                                Annuler
                              </Button>
                              <Button onClick={handleAddCustomField}>Ajouter</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Quick Add Common Fields */}
                      <div>
                        <Label className="text-sm mb-2 block">Champs Fréquents</Label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_CUSTOM_FIELDS.map((field) => (
                            <Button
                              key={field.label}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddCommonField(field)}
                              className="text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {field.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Current Custom Fields */}
                      <div>
                        <Label className="text-sm mb-2 block">
                          Champs Actifs ({currentConfig.customFields.length})
                        </Label>
                        {currentConfig.customFields.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Aucun champ personnalisé</p>
                            <p className="text-xs">Cliquez sur "Ajouter" pour commencer</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentConfig.customFields.map((field) => (
                              <div
                                key={field.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{field.label}</span>
                                    {field.required && (
                                      <Badge variant="secondary" className="text-xs">
                                        Requis
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Type: {field.type === "text" ? "Texte" : 
                                           field.type === "number" ? "Nombre" :
                                           field.type === "date" ? "Date" : "Liste"}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveCustomField(field.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Options de Mise en Page
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Afficher le pied de page</Label>
                          <p className="text-sm text-muted-foreground">
                            Message en bas de facture
                          </p>
                        </div>
                        <Switch
                          checked={currentConfig.showFooter}
                          onCheckedChange={(checked) =>
                            setCurrentConfig({ ...currentConfig, showFooter: checked })
                          }
                        />
                      </div>

                      {currentConfig.showFooter && (
                        <div className="space-y-2">
                          <Label>Texte du pied de page</Label>
                          <Input
                            value={currentConfig.footerText}
                            onChange={(e) =>
                              setCurrentConfig({ ...currentConfig, footerText: e.target.value })
                            }
                            placeholder="Ex: Merci pour votre confiance"
                          />
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Afficher les coordonnées bancaires</Label>
                          <p className="text-sm text-muted-foreground">
                            IBAN et BIC sur la facture
                          </p>
                        </div>
                        <Switch
                          checked={currentConfig.showBankDetails}
                          onCheckedChange={(checked) =>
                            setCurrentConfig({ ...currentConfig, showBankDetails: checked })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Afficher le QR Code</Label>
                          <p className="text-sm text-muted-foreground">
                            Code QR pour paiement rapide
                          </p>
                        </div>
                        <Switch
                          checked={currentConfig.showQRCode}
                          onCheckedChange={(checked) =>
                            setCurrentConfig({ ...currentConfig, showQRCode: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Options Avancées
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Logo de l'entreprise</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          {currentConfig.logo ? (
                            <div className="space-y-2">
                              <div className="w-32 h-32 mx-auto bg-gray-100 rounded flex items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-gray-400" />
                              </div>
                              <Button variant="outline" size="sm">
                                Changer le logo
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-12 w-12 mx-auto text-gray-400" />
                              <div>
                                <Button variant="outline" size="sm">
                                  Télécharger un logo
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG jusqu'à 2MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Style de mise en page</Label>
                        <Select
                          value={currentConfig.layout}
                          onValueChange={(value: any) =>
                            setCurrentConfig({ ...currentConfig, layout: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Classique (2 colonnes)</SelectItem>
                            <SelectItem value="modern">Moderne (Gauche aligné)</SelectItem>
                            <SelectItem value="minimal">Minimal (Centré)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Aperçu en Temps Réel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="scale-50 origin-top-left" style={{ width: "200%", height: "200%" }}>
                      {renderPreview()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Full Preview Modal */}
          {!showPreview && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir l'aperçu complet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Aperçu du Modèle de Facture</DialogTitle>
                  <DialogDescription>
                    Prévisualisation complète de votre modèle de facture personnalisé
                  </DialogDescription>
                </DialogHeader>
                {renderPreview()}
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <AITemplateGenerator 
            onTemplateGenerated={(config) => {
              setCurrentConfig(config);
              setSelectedTemplate(config.id);
              toast.success("Modèle IA appliqué ! Vous pouvez maintenant le personnaliser.");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}