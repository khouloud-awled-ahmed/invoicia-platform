import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  FolderKanban, Plus, Search, MoreVertical, Eye, Edit, Trash2,
  Users, Calendar, CheckCircle2, Briefcase, User, ChevronRight,
  PlayCircle, PauseCircle, StopCircle, ListTodo, CalendarDays, EuroIcon, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  "en-cours":   { label: "En cours",   color: "bg-blue-100 text-blue-800",   icon: PlayCircle },
  "termine":    { label: "Terminé",    color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  "en-attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: PauseCircle },
  "annule":     { label: "Annulé",     color: "bg-red-100 text-red-800",     icon: StopCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  "haute":   { label: "Haute",   color: "bg-red-100 text-red-800" },
  "moyenne": { label: "Moyenne", color: "bg-orange-100 text-orange-800" },
  "basse":   { label: "Basse",   color: "bg-blue-100 text-blue-800" },
};

const EMPTY_FORM = {
  name: "", client: "", description: "",
  startDate: "", endDate: "", budget: "", hours: "", priority: "moyenne",
};

export function ProjectManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Erreur chargement projets: " + (err?.message || "Erreur"));
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!form.name || !form.client) {
      toast.error("Nom et client sont obligatoires"); return;
    }
    setIsSaving(true);
    try {
      await apiClient.createProject({
        name: form.name,
        client: form.client,
        description: form.description,
        budget: form.budget ? parseFloat(form.budget) : 0,
        hoursEstimated: form.hours ? parseInt(form.hours) : 0,
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || new Date().toISOString(),
        status: "en-attente",
        priority: form.priority,
        manager: "Ahmed Ben Ali",
        code: `PRJ-${Date.now()}`,
        color: "#3b82f6",
        type: "CLIENT_BILLABLE",
      });
      toast.success("Projet créé avec succès !");
      setShowNewProjectDialog(false);
      setForm(EMPTY_FORM);
      await loadProjects();
    } catch (err: any) {
      toast.error("Erreur: " + (err?.message || "Erreur inconnue"));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.client || "").toLowerCase().includes(q) ||
      (p.manager || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchPriority = priorityFilter === "all" || p.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const projectsInProgress = projects.filter(p => p.status === "en-cours");
  const projectsCompleted = projects.filter(p => p.status === "termine");
  const projectsPending = projects.filter(p => p.status === "en-attente");
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalConsumed = projects.reduce((s, p) => s + (p.consumed || 0), 0);
  const avgProgress = projectsInProgress.length > 0
    ? projectsInProgress.reduce((s, p) => s + (p.progress || 0), 0) / projectsInProgress.length
    : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const calcDaysRemaining = (endDate: any) => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getBudgetStatus = (p: any) => {
    const pct = p.budget > 0 ? (p.consumed / p.budget) * 100 : 0;
    if (pct > 90) return { color: "text-red-600", status: "Critique" };
    if (pct > 75) return { color: "text-orange-600", status: "Attention" };
    return { color: "text-green-600", status: "OK" };
  };

  const getStatusCfg = (status: string) =>
    STATUS_CONFIG[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: PauseCircle };

  const getPriorityCfg = (priority: string) =>
    PRIORITY_CONFIG[priority] || { label: priority, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Projets</h1>
          <p className="text-muted-foreground">Pilotage et suivi de vos projets clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadProjects}><RefreshCw className="w-4 h-4 mr-2" />Actualiser</Button>
          <Button onClick={() => setShowNewProjectDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />Nouveau Projet
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Total Projets", value: projects.length, color: "", sub: "Tous statuts" },
          { label: "En Cours", value: projectsInProgress.length, color: "text-blue-600", sub: "Projets actifs" },
          { label: "Terminés", value: projectsCompleted.length, color: "text-green-600", sub: "Livrés" },
          { label: "En Attente", value: projectsPending.length, color: "text-yellow-600", sub: "À démarrer" },
          { label: "Budget Total", value: formatCurrency(totalBudget), color: "", sub: "Tous projets" },
          { label: "Avancement Moyen", value: `${Math.round(avgProgress)}%`, color: "text-purple-600", sub: "Projets actifs" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list"><FolderKanban className="w-4 h-4 mr-2" />Liste des Projets</TabsTrigger>
          <TabsTrigger value="timeline"><CalendarDays className="w-4 h-4 mr-2" />Timeline</TabsTrigger>
          <TabsTrigger value="budget"><EuroIcon className="w-4 h-4 mr-2" />Budgets</TabsTrigger>
        </TabsList>

        {/* LISTE */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en-cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                    <SelectItem value="en-attente">En attente</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes priorités</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="basse">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Projet</TableHead><TableHead>Client</TableHead>
                    <TableHead>Chef de Projet</TableHead><TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead><TableHead>Avancement</TableHead>
                    <TableHead>Budget</TableHead><TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Chargement...</TableCell></TableRow>
                  ) : filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>{projects.length === 0 ? "Aucun projet — créez votre premier projet !" : "Aucun résultat"}</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredProjects.map(project => {
                    const sc = getStatusCfg(project.status);
                    const pc = getPriorityCfg(project.priority);
                    const bs = getBudgetStatus(project);
                    const days = calcDaysRemaining(project.endDate);
                    return (
                      <TableRow key={project.id || project._id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell onClick={() => { setSelectedProject(project); setShowProjectDetails(true); }}>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground">{project.tasksCompleted || 0}/{project.tasksTotal || 0} tâches</div>
                        </TableCell>
                        <TableCell><div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" />{project.client}</div></TableCell>
                        <TableCell><div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />{project.manager || "—"}</div></TableCell>
                        <TableCell><Badge className={sc.color}>{sc.label}</Badge></TableCell>
                        <TableCell><Badge className={pc.color}>{pc.label}</Badge></TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="text-xs">{project.progress || 0}%</span>
                            <Progress value={project.progress || 0} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm ${bs.color}`}>{formatCurrency(project.consumed || 0)}</div>
                          <div className="text-xs text-muted-foreground">/ {formatCurrency(project.budget || 0)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{project.endDate ? new Date(project.endDate).toLocaleDateString("fr-FR") : "—"}</div>
                          <div className={`text-xs ${days < 30 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {days > 0 ? `${days}j restants` : "Dépassé"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedProject(project); setShowProjectDetails(true); }}><Eye className="w-4 h-4 mr-2" />Voir détails</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
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

        {/* TIMELINE */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader><CardTitle>Timeline des Projets</CardTitle></CardHeader>
            <CardContent>
              {filteredProjects.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Aucun projet</p>
              ) : (
                <div className="space-y-6">
                  {filteredProjects.map(project => {
                    const sc = getStatusCfg(project.status);
                    const start = project.startDate ? new Date(project.startDate) : new Date();
                    const end = project.endDate ? new Date(project.endDate) : new Date();
                    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={project.id || project._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={sc.color}>{sc.label}</Badge>
                            <span className="font-medium">{project.name}</span>
                            <span className="text-sm text-muted-foreground">{project.client}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{start.toLocaleDateString("fr-FR")}</span>
                            <ChevronRight className="w-4 h-4" />
                            <span>{end.toLocaleDateString("fr-FR")}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{duration}j</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress || 0} className="h-3" />
                          <span className="text-sm text-muted-foreground min-w-[50px]">{project.progress || 0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUDGET */}
        <TabsContent value="budget">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Répartition des Budgets</CardTitle></CardHeader>
              <CardContent>
                {filteredProjects.length === 0 ? <p className="text-center py-4 text-muted-foreground">Aucun projet</p> : (
                  <div className="space-y-4">
                    {filteredProjects.map(p => {
                      const pct = p.budget > 0 ? (p.consumed / p.budget) * 100 : 0;
                      const bs = getBudgetStatus(p);
                      return (
                        <div key={p.id || p._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className={`text-sm ${bs.color}`}>{bs.status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground min-w-[60px] text-right">{Math.round(pct)}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Consommé: {formatCurrency(p.consumed || 0)}</span>
                            <span>Budget: {formatCurrency(p.budget || 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Statistiques Budgétaires</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget Total</span>
                  <span className="text-xl font-semibold text-blue-700">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="p-4 bg-green-50 rounded-lg flex justify-between">
                  <span className="text-sm text-muted-foreground">Consommé</span>
                  <span className="text-xl font-semibold text-green-700">{formatCurrency(totalConsumed)}</span>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg flex justify-between">
                  <span className="text-sm text-muted-foreground">Disponible</span>
                  <span className="text-xl font-semibold text-purple-700">{formatCurrency(totalBudget - totalConsumed)}</span>
                </div>
                {totalBudget > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Taux de consommation</span>
                      <span className="text-lg font-semibold">{Math.round((totalConsumed / totalBudget) * 100)}%</span>
                    </div>
                    <Progress value={(totalConsumed / totalBudget) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Détails */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />{selectedProject?.name}
            </DialogTitle>
            <DialogDescription>{selectedProject?.description || "Aucune description"}</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Client :</span> <strong>{selectedProject.client}</strong></div>
                <div><span className="text-muted-foreground">Statut :</span> <Badge className={getStatusCfg(selectedProject.status).color}>{getStatusCfg(selectedProject.status).label}</Badge></div>
                <div><span className="text-muted-foreground">Budget :</span> <strong>{formatCurrency(selectedProject.budget || 0)}</strong></div>
                <div><span className="text-muted-foreground">Avancement :</span> <strong>{selectedProject.progress || 0}%</strong></div>
                <div><span className="text-muted-foreground">Début :</span> {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString("fr-FR") : "—"}</div>
                <div><span className="text-muted-foreground">Fin :</span> {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString("fr-FR") : "—"}</div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Budget consommé</span><span>{formatCurrency(selectedProject.consumed || 0)} / {formatCurrency(selectedProject.budget || 0)}</span></div>
                <Progress value={selectedProject.budget > 0 ? (selectedProject.consumed / selectedProject.budget) * 100 : 0} className="h-2" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nouveau Projet */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Projet</DialogTitle>
            <DialogDescription>Remplissez les informations du projet</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nom du projet *</Label>
              <Input placeholder="Ex: Refonte site web" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Client *</Label>
              <Input placeholder="Nom du client" value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea placeholder="Description du projet" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date de début</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Date de fin</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Budget (€)</Label>
                <Input type="number" placeholder="50000" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Heures estimées</Label>
                <Input type="number" placeholder="320" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Priorité</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewProjectDialog(false); setForm(EMPTY_FORM); }}>Annuler</Button>
            <Button onClick={handleCreateProject} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Création...</> : "Créer le projet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}