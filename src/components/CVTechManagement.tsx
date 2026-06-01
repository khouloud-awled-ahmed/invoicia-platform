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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  Plus,
  Download,
  Upload,
  FileText,
  Award,
  Briefcase,
  Code,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  GraduationCap,
  Cpu,
  Database,
  Globe,
  Zap,
  CheckCircle2,
  Clock,
  Users,
  UserPlus,
  Brain,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { CVAIReader } from "./CVAIReader";
import { apiClient } from "../lib/api-client-backend";
import { useEffect } from "react";

export interface StoredCVListItem {
  id: string;
  fileName: string;
  name?: string;
  email?: string;
  rawText?: string;
  createdAt: string;
}

export function CVTechManagement() {
  const [cvs, setCvs] = useState<StoredCVListItem[]>([]);
  const [isLoadingCVs, setIsLoadingCVs] = useState(true);
  const [selectedCV, setSelectedCV] = useState<StoredCVListItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const loadCVs = () => {
    setIsLoadingCVs(true);
    apiClient.getCVs().then((data) => {
      setCvs(Array.isArray(data) ? data : []);
    }).catch((err) => {
      console.error("Erreur chargement CV:", err);
      toast.error("Erreur lors du chargement des CV");
      setCvs([]);
    }).finally(() => setIsLoadingCVs(false));
  };

  useEffect(() => {
    loadCVs();
  }, []);

  const filteredCVs = searchQuery.trim() === ""
    ? cvs
    : cvs.filter((cv) => {
        const q = searchQuery.toLowerCase();
        return (cv.name?.toLowerCase().includes(q)) ||
          (cv.email?.toLowerCase().includes(q)) ||
          (cv.fileName?.toLowerCase().includes(q));
      });

  const handleViewCV = (cv: StoredCVListItem) => {
    setSelectedCV(cv);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>CV Tech</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des CV tech des salariés et intervenants externes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab("ai-reader")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Importer un CV (PDF / Word)
          </Button>
        </div>
      </div>

      {/* Tabs principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">
            <FileText className="w-4 h-4 mr-2" />
            Liste des CV
          </TabsTrigger>
          <TabsTrigger value="ai-reader">
            <Brain className="w-4 h-4 mr-2" />
            Lecture IA
          </TabsTrigger>
        </TabsList>

        {/* =============== ONGLET LISTE =============== */}
        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total CV</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{cvs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  CV extraits des fichiers (données réelles, pas de vérification)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou fichier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {isLoadingCVs ? (
                <div className="py-12 text-center text-muted-foreground">Chargement...</div>
              ) : filteredCVs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{cvs.length === 0 ? "Aucun CV. Importez un fichier PDF ou Word dans l'onglet Lecture & Import." : "Aucun résultat pour cette recherche."}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Fichier</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCVs.map((cv) => (
                      <TableRow key={cv.id}>
                        <TableCell className="font-medium">{cv.fileName}</TableCell>
                        <TableCell>{cv.name || "—"}</TableCell>
                        <TableCell>{cv.email || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString("fr-FR") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewCV(cv)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              {selectedCV && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedCV.fileName}</DialogTitle>
                    <DialogDescription>
                      Données extraites du fichier (lecture réelle, pas de vérification externe)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Nom</Label>
                        <p className="font-medium">{selectedCV.name || "—"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedCV.email || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Extrait du texte brut</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {selectedCV.rawText || "Aucun texte extrait."}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                      Fermer
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

        </TabsContent>

        {/* =============== ONGLET LECTURE IA =============== */}
        <TabsContent value="ai-reader" className="space-y-6">
          <CVAIReader onUploadSuccess={loadCVs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}