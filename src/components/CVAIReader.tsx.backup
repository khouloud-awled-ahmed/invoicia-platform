import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Upload,
  Download,
  FileText,
  Brain,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Mail,
  Sparkles,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Save,
  Copy,
  Settings,
  Zap,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Users,
  FileType,
  ShieldCheck,
  Search,
  Linkedin,
  Github,
  Twitter,
  Globe,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { apiClient } from "../lib/api-client-backend";

interface ExtractedSkill {
  name: string;
  category: string;
  level: number;
  years: number;
  verified?: boolean;
  source?: string;
}

interface ExtractedExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies: string[];
  verified?: boolean;
  source?: string;
}

interface ExtractedCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate: string | null;
  verified?: boolean;
  source?: string;
}

interface ExtractedData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  summary: string;
  yearsOfExperience: number;
  skills: ExtractedSkill[];
  experiences: ExtractedExperience[];
  certifications: ExtractedCertification[];
  languages: { language: string; level: string }[];
  education: { degree: string; school: string; year: string }[];
  address?: string;
  city?: string;
}

interface ProcessedCV {
  id: string;
  fileName: string;
  source: "upload" | "email";
  uploadedAt: string;
  status: "processing" | "completed" | "error" | "saved";
  extractedData: ExtractedData | null;
  errorMessage?: string;
  processingTime?: number;
}

interface CVAIReaderProps {
  onUploadSuccess?: () => void;
}

export function CVAIReader({ onUploadSuccess }: CVAIReaderProps = {}) {
  const [processedCVs, setProcessedCVs] = useState<ProcessedCV[]>([]);
  const [selectedCV, setSelectedCV] = useState<ProcessedCV | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [emailAddress] = useState("cv-reception@votreentreprise.fr");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      // Vérifier le type de fichier
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Format non supporté : ${file.name}`);
        continue;
      }

      toast.info(`Traitement en cours de ${file.name}...`);
      
      const newCV: ProcessedCV = {
        id: `CV${Date.now()}`,
        fileName: file.name,
        source: "upload",
        uploadedAt: new Date().toISOString(),
        status: "processing",
        extractedData: null
      };

      setProcessedCVs(prev => [newCV, ...prev]);

      try {
        const startTime = Date.now();
        const saved = await apiClient.uploadCV(file);
        const processingTime = (Date.now() - startTime) / 1000;
        const nameParts = (saved.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        setProcessedCVs(prev => prev.map(cv =>
          cv.id === newCV.id
            ? {
                ...cv,
                status: "completed",
                processingTime,
                extractedData: {
                  firstName,
                  lastName,
                  email: saved.email || "",
                  phone: "",
                  title: "",
                  summary: "",
                  yearsOfExperience: 0,
                  skills: [],
                  experiences: [],
                  certifications: [],
                  languages: [],
                  education: [],
                },
              }
            : cv
        ));
        toast.success(`CV "${file.name}" importé et enregistré.`);
        onUploadSuccess?.();
      } catch (error: any) {
        console.error("Erreur lors de l'upload du CV:", error);
        setProcessedCVs(prev => prev.map(cv =>
          cv.id === newCV.id
            ? { ...cv, status: "error", errorMessage: error?.message || "Impossible de lire le fichier." }
            : cv
        ));
        toast.error(error?.message || "Erreur lors de l'import du CV.");
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleViewDetails = (cv: ProcessedCV) => {
    setSelectedCV(cv);
    setShowDetailDialog(true);
  };

  const handleExport = (cv: ProcessedCV) => {
    setSelectedCV(cv);
    setShowExportDialog(true);
  };

  const handleSaveToDatabase = (cv: ProcessedCV) => {
    setProcessedCVs(prev => prev.map(c => 
      c.id === cv.id ? { ...c, status: "saved" as const } : c
    ));
    toast.success("CV enregistré dans la base de données !");
  };

  const handleReprocess = (cv: ProcessedCV) => {
    setProcessedCVs(prev => prev.map(c => 
      c.id === cv.id ? { ...c, status: "processing" as const } : c
    ));
    
    setTimeout(() => {
      setProcessedCVs(prev => prev.map(c => 
        c.id === cv.id ? { ...c, status: "completed" as const } : c
      ));
      toast.success("CV retraité avec succès !");
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700 gap-1"><Clock className="w-3 h-3 animate-spin" />En cours</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />Traité</Badge>;
      case "saved":
        return <Badge className="bg-purple-100 text-purple-700 gap-1"><Save className="w-3 h-3" />Enregistré</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 gap-1"><XCircle className="w-3 h-3" />Erreur</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === "email") {
      return <Badge variant="outline" className="gap-1"><Mail className="w-3 h-3" />Email</Badge>;
    }
    return <Badge variant="outline" className="gap-1"><Upload className="w-3 h-3" />Upload</Badge>;
  };

  // Statistiques
  const totalProcessed = processedCVs.length;
  const totalCompleted = processedCVs.filter(cv => cv.status === "completed" || cv.status === "saved").length;
  const totalSaved = processedCVs.filter(cv => cv.status === "saved").length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Lecture IA de CV
          </h1>
          <p className="text-muted-foreground mt-1">
            Extraction automatique des données des CV par intelligence artificielle
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Configuration
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">CV Traités</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalProcessed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCompleted} réussis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Enregistrés</CardTitle>
            <Save className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">{totalSaved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dans la base CV Tech
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">
              {processedCVs.filter(cv => cv.status === "processing").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Traitement en cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zone d'Upload */}
      <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
        <CardContent className="pt-6">
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-12 text-center transition-all",
              isDragging ? "border-purple-500 bg-purple-100" : "border-purple-300 bg-white"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Télécharger des CV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground">
                  Formats acceptés : PDF, DOC, DOCX • Taille max : 10 MB
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => document.getElementById('cv-file-input')?.click()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Sélectionner des fichiers
                </Button>
                <input
                  id="cv-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Réception par Email</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Les candidats peuvent aussi envoyer leur CV directement à :
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="px-3 py-1.5 bg-white border border-blue-300 rounded text-sm font-mono text-blue-900">
                    {emailAddress}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(emailAddress);
                      toast.success("Adresse email copiée !");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Les CV reçus seront automatiquement traités et apparaîtront dans la liste ci-dessous
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des CV traités */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>CV Traités ({processedCVs.length})</CardTitle>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Traités</SelectItem>
                  <SelectItem value="saved">Enregistrés</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Fichier</TableHead>
                <TableHead>Candidat</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date de traitement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Temps</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedCVs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun CV traité pour le moment. Glissez-déposez un PDF ou Word ci-dessus.
                  </TableCell>
                </TableRow>
              ) : (
                processedCVs.map((cv) => (
                  <TableRow key={cv.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium text-sm">{cv.fileName}</div>
                          <div className="text-xs text-muted-foreground">{cv.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cv.extractedData ? (
                        <div>
                          <div className="font-medium">
                            {cv.extractedData.firstName} {cv.extractedData.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{cv.extractedData.title}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSourceBadge(cv.source)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(cv.uploadedAt).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(cv.uploadedAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(cv.status)}
                      {cv.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">{cv.errorMessage}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {cv.processingTime ? (
                        <span className="text-sm">{cv.processingTime}s</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cv.status === "completed" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(cv)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSaveToDatabase(cv)}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Enregistrer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExport(cv)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </>
                        )}
                        {cv.status === "saved" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(cv)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExport(cv)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </>
                        )}
                        {cv.status === "error" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReprocess(cv)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retraiter
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Détails */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedCV && selectedCV.extractedData && (
            <>
              <DialogHeader>
                <DialogTitle>Données extraites du CV</DialogTitle>
                <DialogDescription>
                  {selectedCV.fileName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Informations personnelles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informations Personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prénom</Label>
                        <Input value={selectedCV.extractedData.firstName} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label>Nom</Label>
                        <Input value={selectedCV.extractedData.lastName} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={selectedCV.extractedData.email} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input value={selectedCV.extractedData.phone} className="mt-1" readOnly />
                      </div>
                      <div className="col-span-2">
                        <Label>Titre du poste</Label>
                        <Input value={selectedCV.extractedData.title} className="mt-1" readOnly />
                      </div>
                      <div className="col-span-2">
                        <Label>Résumé</Label>
                        <Textarea value={selectedCV.extractedData.summary} rows={3} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label>Années d'expérience</Label>
                        <Input type="number" value={selectedCV.extractedData.yearsOfExperience} className="mt-1" readOnly />
                      </div>
                      {selectedCV.extractedData.city && (
                        <div>
                          <Label>Ville</Label>
                          <Input value={selectedCV.extractedData.city} className="mt-1" readOnly />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Compétences */}
                {selectedCV.extractedData.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compétences Techniques ({selectedCV.extractedData.skills.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCV.extractedData.skills.map((skill, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{skill.name}</div>
                              <div className="text-sm text-muted-foreground">{skill.category} • {skill.years} ans</div>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div 
                                  key={star}
                                  className={cn(
                                    "w-3 h-3 rounded-full",
                                    star <= skill.level ? "bg-yellow-400" : "bg-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Expériences */}
                {selectedCV.extractedData.experiences.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Expériences Professionnelles ({selectedCV.extractedData.experiences.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedCV.extractedData.experiences.map((exp, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium">{exp.title}</div>
                                <div className="text-sm text-muted-foreground">{exp.company}</div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {exp.startDate} - {exp.endDate || "Aujourd'hui"}
                              </div>
                            </div>
                            <p className="text-sm mb-2">{exp.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {exp.technologies.map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications */}
                {selectedCV.extractedData.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Certifications ({selectedCV.extractedData.certifications.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCV.extractedData.certifications.map((cert, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{cert.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {cert.issuer} • {cert.date}
                              {cert.expiryDate && ` • Expire le ${cert.expiryDate}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Fermer
                </Button>
                <Button variant="outline" onClick={() => handleExport(selectedCV)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleSaveToDatabase(selectedCV)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer dans CV Tech
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Export */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exporter le CV au format standard</DialogTitle>
            <DialogDescription>
              Choisissez le format et le template pour l'export
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Format d'export</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Modèle Entreprise</SelectItem>
                  <SelectItem value="docx">Word (DOCX)</SelectItem>
                  <SelectItem value="json">JSON - Données brutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template de présentation</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Modèle Standard - Professional</SelectItem>
                  <SelectItem value="modern">Modèle Moderne - Coloré</SelectItem>
                  <SelectItem value="minimal">Modèle Minimal - Épuré</SelectItem>
                  <SelectItem value="technical">Modèle Technique - Détaillé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Modèle Unique d'Entreprise</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Le CV sera exporté selon votre template personnalisé avec votre logo et charte graphique.
                      Tous les CV exportés auront une présentation uniforme et professionnelle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Options supplémentaires</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inclure les compétences techniques</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inclure les expériences détaillées</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inclure les certifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Anonymiser les données personnelles</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                toast.success("CV exporté avec succès !");
                setShowExportDialog(false);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter le CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Paramètres */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuration IA</DialogTitle>
            <DialogDescription>
              Paramètres de lecture et d'extraction automatique des CV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Réception par Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Adresse email dédiée</Label>
                  <div className="flex gap-2">
                    <Input value={emailAddress} readOnly />
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cette adresse est automatiquement surveillée pour les nouveaux CV
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Notification auto</Label>
                  <Select defaultValue="instant">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instantanée</SelectItem>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Paramètres d'extraction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Langue par défaut</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="auto">Détection automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Extraction automatique des compétences</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Catégorisation automatique des compétences</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Extraction des liens (LinkedIn, GitHub, etc.)</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template d'Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Modèle par défaut</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Modèle Standard</SelectItem>
                      <SelectItem value="modern">Modèle Moderne</SelectItem>
                      <SelectItem value="minimal">Modèle Minimal</SelectItem>
                      <SelectItem value="technical">Modèle Technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger votre template personnalisé
                </Button>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                toast.success("Paramètres sauvegardés !");
                setShowSettingsDialog(false);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}