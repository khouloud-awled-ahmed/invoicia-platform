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
  GraduationCap,
  Code,
  Crown,
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
  seniorityLevel?: string;
  isManager?: boolean;
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

// Determine profile type from extracted data: Etudiant / Ingenieur / Manager
type ProfileType = "etudiant" | "ingenieur" | "manager" | "inconnu";

function getProfileType(data: ExtractedData | null): ProfileType {
  if (!data) return "inconnu";
  if (data.isManager) return "manager";
  if (data.seniorityLevel === "manager") return "manager";
  if (!data.yearsOfExperience || data.yearsOfExperience === 0) {
    // No professional experience found -> likely a student / junior profile
    if (!data.experiences || data.experiences.length === 0) return "etudiant";
  }
  return "ingenieur";
}

function getProfileBadge(type: ProfileType) {
  switch (type) {
    case "manager":
      return (
        <Badge className="bg-amber-100 text-amber-800 gap-1">
          <Crown className="w-3 h-3" />
          Manager
        </Badge>
      );
    case "ingenieur":
      return (
        <Badge className="bg-blue-100 text-blue-700 gap-1">
          <Code className="w-3 h-3" />
          Ingenieur
        </Badge>
      );
    case "etudiant":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
          <GraduationCap className="w-3 h-3" />
          Etudiant
        </Badge>
      );
    default:
      return <Badge variant="outline">-</Badge>;
  }
}

export function CVAIReader({ onUploadSuccess }: CVAIReaderProps = {}) {
  const [processedCVs, setProcessedCVs] = useState<ProcessedCV[]>([]);
  const [selectedCV, setSelectedCV] = useState<ProcessedCV | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [emailAddress] = useState("cv-reception@votreentreprise.fr");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [profileFilter, setProfileFilter] = useState<string>("all");

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
      // Verifier le type de fichier
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!validTypes.includes(file.type)) {
        toast.error(`Format non supporte : ${file.name}`);
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

        // Utilise directement les donnees extraites par le backend (Groq),
        // avec un filet de securite si un champ manque.
        const backendData = saved.extractedData || {};
        const nameParts = (saved.name || "").trim().split(/\s+/);

        const mergedData: ExtractedData = {
          firstName: backendData.firstName || nameParts[0] || "",
          lastName: backendData.lastName || nameParts.slice(1).join(" ") || "",
          email: backendData.email || saved.email || "",
          phone: backendData.phone || "",
          title: backendData.title || "",
          summary: backendData.summary || "",
          yearsOfExperience: backendData.yearsOfExperience || 0,
          seniorityLevel: backendData.seniorityLevel || undefined,
          isManager: backendData.isManager || false,
          city: backendData.city || "",
          skills: Array.isArray(backendData.skills) ? backendData.skills : [],
          experiences: Array.isArray(backendData.experiences) ? backendData.experiences : [],
          education: Array.isArray(backendData.education) ? backendData.education : [],
          certifications: Array.isArray(backendData.certifications) ? backendData.certifications : [],
          languages: Array.isArray(backendData.languages) ? backendData.languages : [],
        };

        setProcessedCVs(prev => prev.map(cv =>
          cv.id === newCV.id
            ? {
                ...cv,
                status: "completed",
                processingTime,
                extractedData: mergedData,
              }
            : cv
        ));
        toast.success(`CV "${file.name}" importe et enregistre.`);
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
    toast.success("CV enregistre dans la base de donnees !");
  };

  const handleReprocess = (cv: ProcessedCV) => {
    setProcessedCVs(prev => prev.map(c =>
      c.id === cv.id ? { ...c, status: "processing" as const } : c
    ));

    setTimeout(() => {
      setProcessedCVs(prev => prev.map(c =>
        c.id === cv.id ? { ...c, status: "completed" as const } : c
      ));
      toast.success("CV retraite avec succes !");
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700 gap-1"><Clock className="w-3 h-3 animate-spin" />En cours</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />Traite</Badge>;
      case "saved":
        return <Badge className="bg-purple-100 text-purple-700 gap-1"><Save className="w-3 h-3" />Enregistre</Badge>;
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

  // Filtrage combine : statut + type de profil
  const filteredCVs = processedCVs.filter((cv) => {
    if (statusFilter !== "all" && cv.status !== statusFilter) return false;
    if (profileFilter !== "all") {
      const type = getProfileType(cv.extractedData);
      if (type !== profileFilter) return false;
    }
    return true;
  });

  // Statistiques (sur l'ensemble, pas seulement le filtre)
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
            Extraction automatique des donnees des CV par intelligence artificielle
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
            <CardTitle className="text-sm">CV Traites</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalProcessed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCompleted} reussis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Enregistres</CardTitle>
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
                <h3 className="text-lg font-semibold mb-2">Telecharger des CV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Glissez-deposez vos fichiers ici ou cliquez pour selectionner
                </p>
                <p className="text-xs text-muted-foreground">
                  Formats acceptes : PDF, DOC, DOCX - Taille max : 10 MB
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => document.getElementById('cv-file-input')?.click()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selectionner des fichiers
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
                <h4 className="font-medium text-blue-900">Reception par Email</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Les candidats peuvent aussi envoyer leur CV directement a :
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
                      toast.success("Adresse email copiee !");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Les CV recus seront automatiquement traites et apparaitront dans la liste ci-dessous
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des CV traites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>CV Traites ({filteredCVs.length}{filteredCVs.length !== processedCVs.length ? ` / ${processedCVs.length}` : ""})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Type de profil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les profils</SelectItem>
                  <SelectItem value="etudiant">Etudiant</SelectItem>
                  <SelectItem value="ingenieur">Ingenieur</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Traites</SelectItem>
                  <SelectItem value="saved">Enregistres</SelectItem>
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
                <TableHead>Profil</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date de traitement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCVs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {processedCVs.length === 0
                      ? "Aucun CV traite pour le moment. Glissez-deposez un PDF ou Word ci-dessus."
                      : "Aucun CV ne correspond aux filtres selectionnes."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCVs.map((cv) => (
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
                          <div className="text-xs text-muted-foreground">{cv.extractedData.title || "-"}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cv.status === "completed" || cv.status === "saved"
                        ? getProfileBadge(getProfileType(cv.extractedData))
                        : <span className="text-muted-foreground text-sm">-</span>}
                    </TableCell>
                    <TableCell>
                      {cv.extractedData && (cv.status === "completed" || cv.status === "saved") ? (
                        <span className="text-sm">
                          {cv.extractedData.yearsOfExperience > 0
                            ? `${cv.extractedData.yearsOfExperience} ans`
                            : "Debutant"}
                        </span>
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

      {/* Dialog Details */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedCV && selectedCV.extractedData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  Donnees extraites du CV
                  {getProfileBadge(getProfileType(selectedCV.extractedData))}
                </DialogTitle>
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
                        <Label>Prenom</Label>
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
                        <Label>Telephone</Label>
                        <Input value={selectedCV.extractedData.phone} className="mt-1" readOnly />
                      </div>
                      <div className="col-span-2">
                        <Label>Titre du poste</Label>
                        <Input value={selectedCV.extractedData.title} className="mt-1" readOnly />
                      </div>
                      <div className="col-span-2">
                        <Label>Resume</Label>
                        <Textarea value={selectedCV.extractedData.summary} rows={3} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label>Annees d'experience</Label>
                        <Input type="number" value={selectedCV.extractedData.yearsOfExperience} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label>Niveau de seniorite</Label>
                        <Input value={selectedCV.extractedData.seniorityLevel || "-"} className="mt-1" readOnly />
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

                {/* Competences */}
                {selectedCV.extractedData.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Competences Techniques ({selectedCV.extractedData.skills.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCV.extractedData.skills.map((skill: any, idx) => (
                          <Badge key={idx} variant="outline">
                            {typeof skill === "string" ? skill : skill.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Experiences */}
                {selectedCV.extractedData.experiences.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Experiences Professionnelles ({selectedCV.extractedData.experiences.length})</CardTitle>
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
                              {(exp.technologies || []).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {selectedCV.extractedData.education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Formation ({selectedCV.extractedData.education.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCV.extractedData.education.map((edu, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{(edu as any).degree}</div>
                            <div className="text-sm text-muted-foreground">
                              {(edu as any).school || (edu as any).institution} {(edu as any).year ? `- ${(edu as any).year}` : ""}
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
                              {cert.issuer} - {cert.date}
                              {cert.expiryDate && ` - Expire le ${cert.expiryDate}`}
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
                  <SelectItem value="pdf">PDF - Modele Entreprise</SelectItem>
                  <SelectItem value="docx">Word (DOCX)</SelectItem>
                  <SelectItem value="json">JSON - Donnees brutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template de presentation</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Modele Standard - Professional</SelectItem>
                  <SelectItem value="modern">Modele Moderne - Colore</SelectItem>
                  <SelectItem value="minimal">Modele Minimal - Epure</SelectItem>
                  <SelectItem value="technical">Modele Technique - Detaille</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Modele Unique d'Entreprise</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Le CV sera exporte selon votre template personnalise avec votre logo et charte graphique.
                      Tous les CV exportes auront une presentation uniforme et professionnelle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Options supplementaires</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inclure les competences techniques</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inclure les experiences detaillees</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inclure les certifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Anonymiser les donnees personnelles</span>
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
                toast.success("CV exporte avec succes !");
                setShowExportDialog(false);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter le CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Parametres */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuration IA</DialogTitle>
            <DialogDescription>
              Parametres de lecture et d'extraction automatique des CV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reception par Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Adresse email dediee</Label>
                  <div className="flex gap-2">
                    <Input value={emailAddress} readOnly />
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cette adresse est automatiquement surveillee pour les nouveaux CV
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notification auto</Label>
                  <Select defaultValue="instant">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instantanee</SelectItem>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parametres d'extraction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Langue par defaut</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Francais</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="auto">Detection automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Extraction automatique des competences</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Categorisation automatique des competences</span>
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
                  <Label>Modele par defaut</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Modele Standard</SelectItem>
                      <SelectItem value="modern">Modele Moderne</SelectItem>
                      <SelectItem value="minimal">Modele Minimal</SelectItem>
                      <SelectItem value="technical">Modele Technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Telecharger votre template personnalise
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
                toast.success("Parametres sauvegardes !");
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
