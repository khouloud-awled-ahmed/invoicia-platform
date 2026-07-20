import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import {
  Plus,
  FileText,
  Eye,
  Search,
  Brain,
  GraduationCap,
  Code,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { CVAIReader } from "./CVAIReader";
import { apiClient } from "../lib/api-client-backend";

export interface StoredCVListItem {
  id: string;
  fileName: string;
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  summary?: string;
  yearsOfExperience?: number;
  seniorityLevel?: string;
  isManager?: boolean;
  skills?: any[];
  experiences?: any[];
  education?: any[];
  rawText?: string;
  createdAt: string;
}

type ProfileType = "etudiant" | "ingenieur" | "manager" | "inconnu";

function getProfileType(cv: StoredCVListItem): ProfileType {
  if (cv.isManager) return "manager";
  if (cv.seniorityLevel === "manager") return "manager";
  if (!cv.yearsOfExperience || cv.yearsOfExperience === 0) {
    if (!cv.experiences || cv.experiences.length === 0) return "etudiant";
  }
  if (!cv.title && !cv.yearsOfExperience) return "inconnu";
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

export function CVTechManagement() {
  const [cvs, setCvs] = useState<StoredCVListItem[]>([]);
  const [isLoadingCVs, setIsLoadingCVs] = useState(true);
  const [selectedCV, setSelectedCV] = useState<StoredCVListItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
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

  const filteredCVs = cvs.filter((cv) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matches =
        cv.name?.toLowerCase().includes(q) ||
        cv.email?.toLowerCase().includes(q) ||
        cv.fileName?.toLowerCase().includes(q) ||
        cv.title?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (profileFilter !== "all") {
      if (getProfileType(cv) !== profileFilter) return false;
    }
    return true;
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
            Gestion des CV tech des salaries et intervenants externes
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
                  CV extraits des fichiers (donnees reelles, pas de verification)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, poste ou fichier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {isLoadingCVs ? (
                <div className="py-12 text-center text-muted-foreground">Chargement...</div>
              ) : filteredCVs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{cvs.length === 0 ? "Aucun CV. Importez un fichier PDF ou Word dans l'onglet Lecture IA." : "Aucun resultat pour ces filtres."}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Fichier</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Profil</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCVs.map((cv) => (
                      <TableRow key={cv.id}>
                        <TableCell className="font-medium">{cv.fileName}</TableCell>
                        <TableCell>{cv.name || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cv.title || "-"}</TableCell>
                        <TableCell>{getProfileBadge(getProfileType(cv))}</TableCell>
                        <TableCell className="text-sm">
                          {cv.yearsOfExperience ? `${cv.yearsOfExperience} ans` : "-"}
                        </TableCell>
                        <TableCell>{cv.email || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString("fr-FR") : "-"}
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
                    <DialogTitle className="flex items-center gap-3">
                      {selectedCV.fileName}
                      {getProfileBadge(getProfileType(selectedCV))}
                    </DialogTitle>
                    <DialogDescription>
                      Donnees extraites du fichier (lecture reelle, pas de verification externe)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Nom</Label>
                        <p className="font-medium">{selectedCV.name || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedCV.email || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Telephone</Label>
                        <p className="font-medium">{selectedCV.phone || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Poste</Label>
                        <p className="font-medium">{selectedCV.title || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Experience</Label>
                        <p className="font-medium">
                          {selectedCV.yearsOfExperience ? `${selectedCV.yearsOfExperience} ans` : "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Niveau</Label>
                        <p className="font-medium">{selectedCV.seniorityLevel || "-"}</p>
                      </div>
                    </div>

                    {selectedCV.summary && (
                      <div>
                        <Label className="text-muted-foreground">Resume</Label>
                        <p className="text-sm mt-1">{selectedCV.summary}</p>
                      </div>
                    )}

                    {selectedCV.skills && selectedCV.skills.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground">Competences</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCV.skills.map((skill: any, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {typeof skill === "string" ? skill : skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCV.experiences && selectedCV.experiences.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground">Experiences</Label>
                        <div className="space-y-3 mt-2">
                          {selectedCV.experiences.map((exp: any, idx: number) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium text-sm">{exp.title}</div>
                                  <div className="text-xs text-muted-foreground">{exp.company}</div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {exp.startDate} - {exp.endDate || "Aujourd'hui"}
                                </div>
                              </div>
                              {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCV.education && selectedCV.education.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground">Formation</Label>
                        <div className="space-y-2 mt-2">
                          {selectedCV.education.map((edu: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{edu.degree}</div>
                              <div className="text-muted-foreground">{edu.school || edu.institution} {edu.year ? `- ${edu.year}` : ""}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-muted-foreground">Extrait du texte brut</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
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
