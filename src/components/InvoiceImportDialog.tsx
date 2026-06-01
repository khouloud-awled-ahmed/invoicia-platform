import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

interface InvoiceImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (invoices: any[]) => void;
}

export function InvoiceImportDialog({ open, onOpenChange, onImport }: InvoiceImportDialogProps) {
  const [importType, setImportType] = useState<"csv" | "excel" | "ai">("csv");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    total: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file && importType !== "ai") {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      // TODO: Implémenter importInvoices dans api-client-backend.ts
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('type', importType);
      // const result = await apiClient.importInvoices(formData);
      // setImportResult(result);
      // onImport(result.invoices || []);
      
      toast.error("Fonctionnalité d'import en cours d'implémentation");
      setProgress(100);
    } catch (error: any) {
      console.error("Erreur lors de l'import:", error);
      toast.error(error?.message || "Erreur lors de l'import des factures");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIImport = async () => {
    if (!file) {
      toast.error("Veuillez d'abord sélectionner un fichier");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      const result = await apiClient.parseDocument(file, 'INVOICE');
      
      if (result.status === 'LEARNING_NEEDED') {
        const shouldLearn = window.confirm(
          "Ce format de facture est inconnu. Voulez-vous apprendre à l'IA comment le lire ?"
        );
        
        if (shouldLearn) {
          const documentData = {
            documentId: result.documentId,
            rawData: result.rawData,
            rawText: result.rawText,
            type: 'INVOICE',
          };
          localStorage.setItem('pending_learning', JSON.stringify(documentData));
          window.location.href = '/settings/ai-lab';
          return;
        } else {
          toast.info("Import annulé. Vous pouvez essayer un autre format.");
          return;
        }
      }
      
      if (result.status === 'SUCCESS' && result.data) {
        const invoiceData = result.data as any;
        // Transformer en format Invoice pour l'import
        const importedInvoice = {
          id: `imported_${Date.now()}`,
          number: invoiceData.invoiceNumber || `FA-IMPORT-${Date.now()}`,
          date: invoiceData.date ? new Date(invoiceData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          client: invoiceData.supplierName || "Fournisseur",
          amountHT: invoiceData.totalHT || 0,
          amountTVA: invoiceData.totalTVA || 0,
          amountTTC: invoiceData.totalTTC || 0,
          status: "draft" as const,
          extractionConfidence: result.confidence ? Math.round(result.confidence * 100) : undefined,
        };
        
        onImport([importedInvoice]);
        toast.success(`Facture "${invoiceData.invoiceNumber || 'importée'}" analysée avec succès !`);
      }
      
      setProgress(100);
    } catch (error: any) {
      console.error("Erreur lors de l'import IA:", error);
      toast.error(error?.message || "Erreur lors de l'import IA des factures");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = (type: "csv" | "excel") => {
    const csvContent = `Numéro;Date;Date d'échéance;Client;Montant HT;TVA (%);Montant TTC;Statut
FA-2025-XXX;2025-11-27;2025-12-27;Nom du Client;1000;20;1200;pending
FA-2025-YYY;2025-11-26;2025-12-26;Autre Client;2000;20;2400;validated`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `template_factures.${type === "csv" ? "csv" : "xlsx"}`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Modèle ${type.toUpperCase()} téléchargé`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importer des Factures
          </DialogTitle>
          <DialogDescription>
            Importez vos factures via CSV, Excel ou scan IA
          </DialogDescription>
        </DialogHeader>

        <Tabs value={importType} onValueChange={(v) => setImportType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="excel">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              Scan IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Alert>
              <AlertDescription>
                Le fichier CSV doit contenir les colonnes : Numéro, Date, Date d'échéance, Client, Montant HT, TVA (%), Montant TTC, Statut
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="csv-file">Fichier CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Fichier sélectionné : {file.name}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate("csv")}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le modèle CSV
            </Button>
          </TabsContent>

          <TabsContent value="excel" className="space-y-4">
            <Alert>
              <AlertDescription>
                Le fichier Excel doit contenir une feuille avec les colonnes : Numéro, Date, Date d'échéance, Client, Montant HT, TVA (%), Montant TTC, Statut
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="excel-file">Fichier Excel</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Fichier sélectionné : {file.name}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate("excel")}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le modèle Excel
            </Button>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Alert className="border-purple-200 bg-purple-50">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-900">
                L'IA va scanner vos factures PDF et extraire automatiquement les informations (numéro, dates, montants, clients)
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="ai-file">Factures PDF</Label>
              <Input
                id="ai-file"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800">
                  Document prêt pour l'analyse IA : {file.name}
                </span>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
              <h4 className="font-medium text-sm">Formats supportés :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF (factures scannées ou générées)</li>
                <li>• Images (JPG, PNG)</li>
                <li>• Taux de confiance affiché pour chaque extraction</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Traitement en cours...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {importResult && (
          <Alert className={importResult.errors > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
            {importResult.errors > 0 ? (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Résultat de l'import :</p>
                <ul className="text-sm space-y-1">
                  <li className="text-green-700">✓ {importResult.success} factures importées avec succès</li>
                  {importResult.errors > 0 && (
                    <li className="text-yellow-700">⚠ {importResult.errors} erreurs détectées</li>
                  )}
                  <li className="text-gray-700">Total traité : {importResult.total}</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            onClick={importType === "ai" ? handleAIImport : handleImport}
            disabled={isProcessing || (!file && importType !== "ai")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {importType === "ai" ? "Lancer le scan IA" : "Importer"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
