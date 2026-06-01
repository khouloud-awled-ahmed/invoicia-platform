import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  FileText, FileSpreadsheet, File, Image, Upload, Download, Eye, Trash2,
  Folder, FolderOpen, MoreVertical, ChevronRight, ChevronDown, Home, Plus,
  Edit, Settings, FolderPlus, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

interface GEDFolder {
  _id: string;
  name: string;
  parentId?: string | null;
  path: string[];
  documentType: string;
  documentCount: number;
  totalSize: number;
  description?: string;
  children?: GEDFolder[];
}

interface GEDDocument {
  _id: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  folderId?: string | null;
  path: string[];
  documentType: string;
  metadata?: any;
  archived: boolean;
  createdAt: string;
}

interface ClassificationRule {
  _id: string;
  name: string;
  documentType: string;
  targetFolderId: string;
  keywords: string[];
  fileExtensions: string[];
  priority: number;
  isActive: boolean;
}

const DOCUMENT_TYPES = [
  { value: "facture", label: "Facture" },
  { value: "depense", label: "Dépense" },
  { value: "avoir", label: "Avoir" },
  { value: "devis", label: "Devis" },
  { value: "contrat", label: "Contrat" },
  { value: "document_fournisseur", label: "Document Fournisseur" },
  { value: "document_client", label: "Document Client" },
  { value: "document_societe", label: "Document Société" },
  { value: "general", label: "Général" },
  { value: "autre", label: "Autre" },
];

const normalizePath = (f: any): any => ({
  ...f,
  path: Array.isArray(f.path) ? f.path : (f.path ? f.path.split('/').filter(Boolean) : [f.name]),
  children: (f.children || []).map(normalizePath),
});

export function GEDManagement() {
  const [folders, setFolders] = useState<GEDFolder[]>([]);
  const [documents, setDocuments] = useState<GEDDocument[]>([]);
  const [classificationRules, setClassificationRules] = useState<ClassificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "tree">("tree");

  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<GEDFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<GEDFolder | null>(null);

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentId, setNewFolderParentId] = useState<string>("root");
  const [newFolderDocumentType, setNewFolderDocumentType] = useState("general");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<string>("root");
  const [uploadDocumentType, setUploadDocumentType] = useState("general");

  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDocumentType, setNewRuleDocumentType] = useState("facture");
  const [newRuleTargetFolderId, setNewRuleTargetFolderId] = useState("");
  const [newRuleKeywords, setNewRuleKeywords] = useState("");
  const [newRuleExtensions, setNewRuleExtensions] = useState("");
  const [newRulePriority, setNewRulePriority] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersData, documentsData, rulesData] = await Promise.all([
        apiClient.getGEDFolderTree(),
        apiClient.getGEDDocuments(),
        apiClient.getGEDClassificationRules(),
      ]);
      setFolders((foldersData || []).map(normalizePath));
      setDocuments((documentsData || []).map((d: any) => ({
        ...d,
        path: Array.isArray(d.path) ? d.path : (d.path ? d.path.split('/').filter(Boolean) : []),
      })));
      setClassificationRules(rulesData || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des données GED");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) { toast.error("Le nom du dossier est requis"); return; }
    try {
      await apiClient.createGEDFolder({
        name: newFolderName,
        parentId: newFolderParentId === "root" ? null : newFolderParentId,
        documentType: newFolderDocumentType,
        description: newFolderDescription || undefined,
      });
      toast.success("Dossier créé avec succès");
      setCreateFolderDialogOpen(false);
      setNewFolderName(""); setNewFolderParentId("root");
      setNewFolderDocumentType("general"); setNewFolderDescription("");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du dossier");
    }
  };

  const handleUpdateFolder = async () => {
    if (!selectedFolder || !newFolderName.trim()) { toast.error("Le nom du dossier est requis"); return; }
    try {
      await apiClient.updateGEDFolder(selectedFolder._id, {
        name: newFolderName,
        description: newFolderDescription || undefined,
        documentType: newFolderDocumentType,
      });
      toast.success("Dossier modifié avec succès");
      setEditFolderDialogOpen(false); setSelectedFolder(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification du dossier");
    }
  };

  const handleDeleteFolder = async (force: boolean = false) => {
    if (!folderToDelete) return;
    try {
      await apiClient.deleteGEDFolder(folderToDelete._id, force);
      toast.success("Dossier supprimé avec succès");
      setDeleteFolderDialogOpen(false); setFolderToDelete(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression du dossier");
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) { toast.error("Veuillez sélectionner un fichier"); return; }
    try {
      await apiClient.uploadGEDDocument(
        uploadFile,
        uploadFolderId === "root" ? undefined : uploadFolderId,
        uploadDocumentType !== "general" ? uploadDocumentType : undefined,
      );
      toast.success("Document uploadé avec succès");
      setUploadDialogOpen(false); setUploadFile(null); setUploadFolderId("root");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload du document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await apiClient.deleteGEDDocument(documentId);
      toast.success("Document supprimé avec succès");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression du document");
    }
  };

  const handleInitializeStructure = async () => {
    try {
      await apiClient.initializeGEDStructure();
      toast.success("Structure GED initialisée avec succès");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'initialisation");
    }
  };

  const handleCreateRule = async () => {
    if (!newRuleName.trim() || !newRuleTargetFolderId) { toast.error("Le nom et le dossier cible sont requis"); return; }
    try {
      await apiClient.createGEDClassificationRule({
        name: newRuleName,
        documentType: newRuleDocumentType,
        targetFolderId: newRuleTargetFolderId,
        keywords: newRuleKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0),
        fileExtensions: newRuleExtensions.split(",").map(e => e.trim()).filter(e => e.length > 0),
        priority: newRulePriority,
      });
      toast.success("Règle créée avec succès");
      setRulesDialogOpen(false);
      setNewRuleName(""); setNewRuleDocumentType("facture"); setNewRuleTargetFolderId("");
      setNewRuleKeywords(""); setNewRuleExtensions(""); setNewRulePriority(0);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la règle");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await apiClient.deleteGEDClassificationRule(ruleId);
      toast.success("Règle supprimée avec succès");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression de la règle");
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) newExpanded.delete(folderId);
    else newExpanded.add(folderId);
    setExpandedFolders(newExpanded);
  };

  const renderFolderTree = (nodes: GEDFolder[], level: number = 0): JSX.Element[] => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node._id);
      const hasChildren = node.children && node.children.length > 0;
      return (
        <div key={node._id}>
          <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group" style={{ marginLeft: `${level * 16}px` }}>
            {hasChildren ? (
              <button onClick={() => toggleFolder(node._id)} className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>
            ) : <div className="w-4" />}
            <button onClick={() => { setSelectedFolderId(node._id); toggleFolder(node._id); }} className="flex items-center gap-2 flex-1">
              {isExpanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />}
              <span className="text-sm flex-1 text-left">{node.name}</span>
            </button>
            <Badge variant="outline" className="text-xs">{node.documentCount}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSelectedFolder(node); setNewFolderName(node.name); setNewFolderDocumentType(node.documentType); setNewFolderDescription(node.description || ""); setEditFolderDialogOpen(true); }}>
                  <Edit className="w-4 h-4 mr-2" />Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setNewFolderParentId(node._id); setCreateFolderDialogOpen(true); }}>
                  <FolderPlus className="w-4 h-4 mr-2" />Créer un sous-dossier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setFolderToDelete(node); setDeleteFolderDialogOpen(true); }} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasChildren && isExpanded && <div>{renderFolderTree(node.children!, level + 1)}</div>}
        </div>
      );
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = documentTypeFilter === "all" || doc.documentType === documentTypeFilter;
    const matchesFolder = !selectedFolderId || doc.folderId === selectedFolderId;
    return matchesSearch && matchesType && matchesFolder;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return FileText;
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return FileSpreadsheet;
    if (mimeType?.includes("image")) return Image;
    return File;
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="text-muted-foreground">Chargement...</div></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion Électronique des Documents (GED)</h1>
          <p className="text-muted-foreground">Organisation et classement automatique des documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleInitializeStructure}>
            <Sparkles className="w-4 h-4 mr-2" />Initialiser la structure
          </Button>

          {/* Dialog Créer un dossier */}
          <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><FolderPlus className="w-4 h-4 mr-2" />Créer un dossier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau dossier</DialogTitle>
                <DialogDescription>Créez un nouveau dossier pour organiser vos documents</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nom du dossier *</Label>
                  <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Ex: Factures 2025" />
                </div>
                <div>
                  <Label>Dossier parent</Label>
                  <Select value={newFolderParentId} onValueChange={setNewFolderParentId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Racine (aucun)</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder._id} value={folder._id}>{folder.path.join(" / ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de document</Label>
                  <Select value={newFolderDocumentType} onValueChange={setNewFolderDocumentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description (optionnel)</Label>
                  <Textarea value={newFolderDescription} onChange={e => setNewFolderDescription(e.target.value)} placeholder="Description du dossier..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreateFolder}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Importer un document */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700"><Upload className="w-4 h-4 mr-2" />Importer un document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer un document</DialogTitle>
                <DialogDescription>Téléchargez un document qui sera classé selon les règles configurées</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Fichier *</Label>
                  <Input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Dossier de destination</Label>
                  <Select value={uploadFolderId} onValueChange={setUploadFolderId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Classement automatique</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder._id} value={folder._id}>{folder.path.join(" / ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de document</Label>
                  <Select value={uploadDocumentType} onValueChange={setUploadDocumentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleUploadDocument} disabled={!uploadFile}>Importer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total documents", value: documents.length, color: "" },
          { label: "Total dossiers", value: folders.length, color: "text-blue-600" },
          { label: "Règles de classement", value: classificationRules.length, color: "text-green-600" },
          { label: "Espace utilisé", value: formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0)), color: "" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle></CardHeader>
            <CardContent><div className={`text-2xl ${kpi.color}`}>{kpi.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={viewMode} onValueChange={v => setViewMode(v as "list" | "tree")}>
        <TabsList>
          <TabsTrigger value="tree"><Folder className="w-4 h-4 mr-2" />Arborescence</TabsTrigger>
          <TabsTrigger value="list"><FileText className="w-4 h-4 mr-2" />Liste</TabsTrigger>
          <TabsTrigger value="rules"><Settings className="w-4 h-4 mr-2" />Règles de classement</TabsTrigger>
        </TabsList>

        {/* ARBORESCENCE */}
        <TabsContent value="tree" className="space-y-4">
          <div className="grid md:grid-cols-12 gap-6">
            <Card className="md:col-span-4">
              <CardHeader><CardTitle className="flex items-center gap-2"><Folder className="w-5 h-5" />Structure des dossiers</CardTitle></CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-lg mb-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    <button onClick={() => setSelectedFolderId(null)} className="font-medium text-blue-600 flex-1 text-left">Racine</button>
                  </div>
                  {renderFolderTree(folders)}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Documents</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
                    <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                      <SelectTrigger className="w-48"><SelectValue placeholder="Tous les types" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Taille</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun document trouvé</TableCell></TableRow>
                    ) : filteredDocuments.map(doc => {
                      const FileIcon = getFileIcon(doc.fileType);
                      return (
                        <TableRow key={doc._id}>
                          <TableCell><div className="flex items-center gap-2"><FileIcon className="w-4 h-4 text-muted-foreground" /><span>{doc.name}</span></div></TableCell>
                          <TableCell><Badge variant="outline">{DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}</Badge></TableCell>
                          <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                          <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Voir</DropdownMenuItem>
                                <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Télécharger</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteDocument(doc._id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LISTE */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tous les documents</CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
                  <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Tous les types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nom</TableHead><TableHead>Dossier</TableHead><TableHead>Type</TableHead><TableHead>Taille</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucun document trouvé</TableCell></TableRow>
                  ) : filteredDocuments.map(doc => {
                    const FileIcon = getFileIcon(doc.fileType);
                    return (
                      <TableRow key={doc._id}>
                        <TableCell><div className="flex items-center gap-2"><FileIcon className="w-4 h-4 text-muted-foreground" /><span>{doc.name}</span></div></TableCell>
                        <TableCell><span className="text-sm text-muted-foreground">{doc.path.length > 0 ? doc.path.slice(0, -1).join(" / ") : "Racine"}</span></TableCell>
                        <TableCell><Badge variant="outline">{DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}</Badge></TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Voir</DropdownMenuItem>
                              <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Télécharger</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteDocument(doc._id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RÈGLES */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Règles de classement automatique</CardTitle>
                <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
                  <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Créer une règle</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une règle de classement</DialogTitle>
                      <DialogDescription>Configurez une règle pour classer automatiquement les documents</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Nom de la règle *</Label><Input value={newRuleName} onChange={e => setNewRuleName(e.target.value)} placeholder="Ex: Règle Factures" /></div>
                      <div>
                        <Label>Type de document *</Label>
                        <Select value={newRuleDocumentType} onValueChange={setNewRuleDocumentType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Dossier cible *</Label>
                        <Select value={newRuleTargetFolderId || "none"} onValueChange={v => setNewRuleTargetFolderId(v === "none" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner un dossier" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Choisir --</SelectItem>
                            {folders.map(folder => <SelectItem key={folder._id} value={folder._id}>{folder.path.join(" / ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Mots-clés (séparés par des virgules)</Label><Input value={newRuleKeywords} onChange={e => setNewRuleKeywords(e.target.value)} placeholder="facture, invoice" /></div>
                      <div><Label>Extensions (séparées par des virgules)</Label><Input value={newRuleExtensions} onChange={e => setNewRuleExtensions(e.target.value)} placeholder=".pdf, .xml" /></div>
                      <div><Label>Priorité</Label><Input type="number" value={newRulePriority} onChange={e => setNewRulePriority(parseInt(e.target.value) || 0)} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRulesDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleCreateRule}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Dossier cible</TableHead><TableHead>Mots-clés</TableHead><TableHead>Priorité</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {classificationRules.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Aucune règle configurée</TableCell></TableRow>
                  ) : classificationRules.map(rule => (
                    <TableRow key={rule._id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell><Badge variant="outline">{DOCUMENT_TYPES.find(t => t.value === rule.documentType)?.label || rule.documentType}</Badge></TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{folders.find(f => f._id === rule.targetFolderId)?.path.join(" / ") || rule.targetFolderId}</span></TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{rule.keywords.map((k, i) => <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>)}</div></TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell><Badge variant={rule.isActive ? "default" : "secondary"}>{rule.isActive ? "Actif" : "Inactif"}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteRule(rule._id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Modifier dossier */}
      <Dialog open={editFolderDialogOpen} onOpenChange={setEditFolderDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le dossier</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom du dossier *</Label><Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} /></div>
            <div>
              <Label>Type de document</Label>
              <Select value={newFolderDocumentType} onValueChange={setNewFolderDocumentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea value={newFolderDescription} onChange={e => setNewFolderDescription(e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFolderDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateFolder}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Supprimer dossier */}
      <AlertDialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{folderToDelete?.name}" ?
              {folderToDelete && folderToDelete.documentCount > 0 && (
                <span className="block mt-2 text-red-600">Ce dossier contient {folderToDelete.documentCount} document(s).</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteFolder(false)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
            {folderToDelete && folderToDelete.documentCount > 0 && (
              <AlertDialogAction onClick={() => handleDeleteFolder(true)} className="bg-red-800 hover:bg-red-900">Supprimer avec contenu</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}