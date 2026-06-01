import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, ArrowLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useEffect } from "react";
// Simple dropzone implementation sans dépendance externe
const useDropzone = (options: { onDrop: (files: File[]) => void; accept?: any; maxFiles?: number }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (options.accept) {
      // Filtrer par extension
      const acceptedExtensions = Object.values(options.accept).flat() as string[];
      const filtered = files.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedExtensions.some(acc => acc.toLowerCase() === ext);
      });
      options.onDrop(filtered.slice(0, options.maxFiles || 1));
    } else {
      options.onDrop(files.slice(0, options.maxFiles || 1));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (options.accept) {
        const acceptedExtensions = Object.values(options.accept).flat() as string[];
        const filtered = files.filter(file => {
          const ext = '.' + file.name.split('.').pop()?.toLowerCase();
          return acceptedExtensions.some(acc => acc.toLowerCase() === ext);
        });
        options.onDrop(filtered.slice(0, options.maxFiles || 1));
      } else {
        options.onDrop(files.slice(0, options.maxFiles || 1));
      }
    }
  };

  return {
    getRootProps: () => ({
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onClick: () => {
        // Déclencher le clic sur l'input file
        const input = document.getElementById('file-upload-input') as HTMLInputElement;
        if (input) input.click();
      },
    }),
    getInputProps: () => ({
      id: 'file-upload-input',
      type: 'file',
      onChange: handleFileInput,
      accept: options.accept ? Object.values(options.accept).flat().join(',') : undefined,
      multiple: false,
      style: { display: 'none' },
    }),
    isDragActive,
  };
};

interface ParsedTransaction {
  date: Date | string;
  label: string;
  amount: number;
  rawLine?: string[];
}

interface AnalyzeResult {
  status: 'SUCCESS' | 'LEARNING_NEEDED' | 'UNKNOWN_FORMAT';
  transactions?: ParsedTransaction[];
  rawData?: string[][];
  templateId?: string;
  templateName?: string;
  message?: string;
  documentId?: string;
  rawText?: string;
}

type Step = 'upload' | 'mapping' | 'review' | 'success';

export function BankImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name?: string; iban?: string; [k: string]: any }>>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  // État pour le mapping manuel
  const [mappingConfig, setMappingConfig] = useState({
    name: '',
    signature: '',
    startRow: 0,
    dateColumn: 0,
    labelColumn: 1,
    amountColumn: 2,
    dateFormat: 'DD/MM/YYYY',
    hasHeader: true,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Utiliser le parser universel pour les fichiers bancaires
      const result = await apiClient.parseDocument(file, 'BANK');
      
      if (result.status === 'LEARNING_NEEDED') {
        // Proposer d'apprendre le format
        const shouldLearn = window.confirm(
          "Ce format de fichier bancaire est inconnu. Voulez-vous apprendre à l'IA comment le lire ?"
        );
        
        if (shouldLearn) {
          // Stocker les données pour l'apprentissage
          const documentData = {
            documentId: result.documentId,
            rawData: result.rawData,
            rawText: result.rawText,
            type: 'BANK',
          };
          localStorage.setItem('pending_learning', JSON.stringify(documentData));
          window.location.href = '/settings/ai-lab';
          return;
        } else {
          // Mode mapping manuel - extraire les lignes brutes
          const rawData: string[][] = [];
          if (result.rawData && Array.isArray(result.rawData)) {
            rawData.push(...result.rawData);
          } else if (result.rawText) {
            // Si on a du texte brut, le découper en lignes
            const lines = result.rawText.split('\n').slice(0, 20);
            rawData.push(...lines.map(line => line.split(/\s+/).filter(cell => cell.trim())));
          }
          
          setAnalyzeResult({
            status: 'UNKNOWN_FORMAT',
            rawData: rawData.length > 0 ? rawData : [['Aucune donnée extraite']],
          });
          setStep('mapping');
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          setMappingConfig(prev => ({
            ...prev,
            name: fileName,
            signature: result.rawText?.substring(0, 50) || fileName,
          }));
          toast.info("Format inconnu. Veuillez configurer le mapping.");
        }
      } else if (result.status === 'SUCCESS' && result.data) {
        // Transformer les données du parser en format attendu
        // Le service retourne directement un tableau de transactions pour BANK
        let transactions: ParsedTransaction[] = [];
        
        if (Array.isArray(result.data)) {
          // Si c'est directement un tableau (cas BANK)
          transactions = result.data.map((tx: any) => ({
            date: tx.date ? (typeof tx.date === 'string' ? new Date(tx.date) : tx.date) : new Date(),
            label: tx.label || tx.description || '',
            amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
          }));
        } else if (result.data.transactions && Array.isArray(result.data.transactions)) {
          // Si c'est un objet avec une propriété transactions
          transactions = result.data.transactions.map((tx: any) => ({
            date: tx.date ? (typeof tx.date === 'string' ? new Date(tx.date) : tx.date) : new Date(),
            label: tx.label || tx.description || '',
            amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
          }));
        }
        
        if (transactions.length === 0) {
          toast.warning("Aucune transaction trouvée dans le fichier");
          setStep('upload');
          return;
        }
        
        setAnalyzeResult({
          status: 'SUCCESS',
          transactions,
          templateName: result.templateName,
          message: result.message,
        });
        setStep('review');
        toast.success(result.message || `${transactions.length} transaction(s) extraite(s) avec succès`);
      } else {
        // Format inconnu sans LEARNING_NEEDED (fallback)
        const rawData: string[][] = [];
        if (result.rawData && Array.isArray(result.rawData)) {
          rawData.push(...result.rawData);
        } else if (result.rawText) {
          const lines = result.rawText.split('\n').slice(0, 20);
          rawData.push(...lines.map(line => line.split(/\s+/).filter(cell => cell.trim())));
        }
        
        setAnalyzeResult({
          status: 'UNKNOWN_FORMAT',
          rawData: rawData.length > 0 ? rawData : [['Aucune donnée extraite']],
        });
        setStep('mapping');
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setMappingConfig(prev => ({
          ...prev,
          name: fileName,
          signature: result.rawText?.substring(0, 50) || fileName,
        }));
        toast.info("Format inconnu. Veuillez configurer le mapping.");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'analyse:", error);
      let errorMessage = "Erreur lors de l'analyse du fichier";
      
      try {
        const errorJson = JSON.parse(error.message);
        errorMessage = errorJson.message || errorMessage;
        
        // Message spécifique pour les dépendances manquantes
        if (errorMessage.includes('pdf-parse') || errorMessage.includes('csv-parse')) {
          errorMessage = "Modules manquants. Veuillez installer les dépendances dans le backend: npm install pdf-parse csv-parse";
        }
      } catch {
        errorMessage = error?.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLearnAndImport = async () => {
    if (!mappingConfig.name || !mappingConfig.signature) {
      toast.error("Veuillez remplir le nom et la signature");
      return;
    }

    setIsLearning(true);
    try {
      await apiClient.learnDocumentFormat({
        name: mappingConfig.name,
        signature: mappingConfig.signature,
        type: 'BANK',
        config: {
          startRow: mappingConfig.startRow,
          dateColumn: mappingConfig.dateColumn,
          labelColumn: mappingConfig.labelColumn,
          amountColumn: mappingConfig.amountColumn,
          dateFormat: mappingConfig.dateFormat,
          hasHeader: mappingConfig.hasHeader,
        },
        fileType: file?.name.endsWith('.pdf') ? 'PDF' : 'CSV',
      });

      toast.success("Format appris avec succès ! Réanalyse du fichier...");
      
      // Réanalyser le fichier avec le nouveau format
      if (file) {
        const result = await apiClient.parseDocument(file, 'BANK');
        if (result.status === 'SUCCESS' && result.data) {
          let transactions: ParsedTransaction[] = [];
          
          if (Array.isArray(result.data)) {
            transactions = result.data.map((tx: any) => ({
              date: tx.date ? (typeof tx.date === 'string' ? new Date(tx.date) : tx.date) : new Date(),
              label: tx.label || tx.description || '',
              amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
            }));
          } else if (result.data.transactions && Array.isArray(result.data.transactions)) {
            transactions = result.data.transactions.map((tx: any) => ({
              date: tx.date ? (typeof tx.date === 'string' ? new Date(tx.date) : tx.date) : new Date(),
              label: tx.label || tx.description || '',
              amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
            }));
          }
          
          if (transactions.length > 0) {
            setAnalyzeResult({
              status: 'SUCCESS',
              transactions,
              templateName: result.templateName,
              message: result.message,
            });
            setStep('review');
            toast.success(`${transactions.length} transaction(s) extraite(s) avec succès !`);
          } else {
            toast.error("Aucune transaction trouvée après apprentissage");
          }
        } else {
          toast.error("Erreur lors de la réanalyse du fichier");
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de l'apprentissage:", error);
      toast.error(error?.message || "Erreur lors de l'apprentissage du format");
    } finally {
      setIsLearning(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalyzeResult(null);
    setStep('upload');
    setMappingConfig({
      name: '',
      signature: '',
      startRow: 0,
      dateColumn: 0,
      labelColumn: 1,
      amountColumn: 2,
      dateFormat: 'DD/MM/YYYY',
      hasHeader: true,
    });
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return date;
    }
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Bancaire</h1>
          <p className="text-muted-foreground mt-1">
            Importez vos relevés bancaires (PDF ou CSV) avec apprentissage automatique
          </p>
        </div>
        {step !== 'upload' && (
          <Button variant="outline" onClick={handleReset}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nouvel import
          </Button>
        )}
      </div>

      {/* Étape 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload du fichier</CardTitle>
            <CardDescription>
              Sélectionnez un fichier PDF ou CSV de relevé bancaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div>
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formats supportés: PDF, CSV
                  </p>
                </div>
              )}
            </div>

            {file && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Analyser le fichier
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 2: Mapping (format inconnu) */}
      {step === 'mapping' && analyzeResult?.rawData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Configuration du format
            </CardTitle>
            <CardDescription>
              Le format de ce fichier n'est pas reconnu. Configurez le mapping manuellement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du format</Label>
                <Input
                  value={mappingConfig.name}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Format BNP"
                />
              </div>
              <div className="space-y-2">
                <Label>Signature (mot-clé unique)</Label>
                <Input
                  value={mappingConfig.signature}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, signature: e.target.value }))}
                  placeholder="Ex: BNP PARIBAS SA"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ligne de début (0 = première ligne)</Label>
                <Input
                  type="number"
                  value={mappingConfig.startRow}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, startRow: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Format de date</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={mappingConfig.dateFormat}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  <input
                    type="checkbox"
                    checked={mappingConfig.hasHeader}
                    onChange={(e) => setMappingConfig(prev => ({ ...prev, hasHeader: e.target.checked }))}
                    className="mr-2"
                  />
                  Première ligne = en-tête
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Colonne Date (index)</Label>
                <Input
                  type="number"
                  value={mappingConfig.dateColumn}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, dateColumn: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Colonne Libellé (index)</Label>
                <Input
                  type="number"
                  value={mappingConfig.labelColumn}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, labelColumn: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Colonne Montant (index)</Label>
                <Input
                  type="number"
                  value={mappingConfig.amountColumn}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, amountColumn: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Aperçu des données brutes */}
            <div className="space-y-2">
              <Label>Aperçu des données (10 premières lignes)</Label>
              <div className="border rounded-lg overflow-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {analyzeResult.rawData[0]?.map((_, idx) => (
                        <TableHead key={idx} className="min-w-[100px]">
                          Col {idx}
                          {idx === mappingConfig.dateColumn && (
                            <Badge variant="outline" className="ml-1">Date</Badge>
                          )}
                          {idx === mappingConfig.labelColumn && (
                            <Badge variant="outline" className="ml-1">Libellé</Badge>
                          )}
                          {idx === mappingConfig.amountColumn && (
                            <Badge variant="outline" className="ml-1">Montant</Badge>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyzeResult.rawData.slice(0, 10).map((row, rowIdx) => (
                      <TableRow
                        key={rowIdx}
                        className={rowIdx === mappingConfig.startRow ? 'bg-blue-50' : ''}
                      >
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className="font-mono text-xs">
                            {cell || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Button
              onClick={handleLearnAndImport}
              disabled={isLearning}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLearning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Apprentissage en cours...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Mémoriser ce format et Importer
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Review (transactions extraites) */}
      {step === 'review' && analyzeResult?.transactions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Transactions extraites
            </CardTitle>
            <CardDescription>
              {analyzeResult.templateName && (
                <span>Format reconnu: <strong>{analyzeResult.templateName}</strong></span>
              )}
              {analyzeResult.transactions.length} transaction(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyzeResult.transactions.map((tx, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell>{tx.label}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatAmount(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Compte bancaire (destination)</Label>
                <Select value={selectedBankAccountId} onValueChange={setSelectedBankAccountId}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Choisir le compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((acc) => (
                      <SelectItem key={acc.id || acc._id} value={acc.id || acc._id}>
                        {acc.name || acc.iban || acc.id || "Compte"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bankAccounts.length === 0 && (
                  <span className="text-sm text-amber-600">Créez un compte dans Paramètres → Banque</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveToBank}
                  disabled={isSaving || !selectedBankAccountId || bankAccounts.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Enregistrer dans la Banque
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Success */}
      {step === 'success' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold mb-2">Import réussi !</h2>
              <p className="text-muted-foreground mb-6">
                Les transactions ont été importées avec succès.
              </p>
              <Button onClick={handleReset} variant="outline">
                Importer un autre fichier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
