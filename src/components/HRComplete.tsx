import { useState, useEffect } from "react";

import { apiClient } from "../lib/api-client-backend";
import { EnvelopeCreationDialog } from "./EnvelopeCreationDialog";
import { PayrollSettingsModal } from "./PayrollSettingsModal";
import { HRAbsences } from "./HRAbsences";
import { HRPayroll } from "./HRPayroll";
import { HRFormations } from "./HRFormations";
import { HREvaluations } from "./HREvaluations";
import { HRRecrutement } from "./HRRecrutement";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Plus, Download, FileText, Calendar as CalendarIcon, Umbrella, Clock,
  TrendingUp, Users, Euro, FileSignature, Edit, Eye, MoreVertical,
  Receipt, DollarSign, Briefcase, GraduationCap, Target, Activity,
  BarChart3, Bell, Settings, UserPlus, UserCheck, User,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "./ui/utils";
import {
  LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface Employee {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  contract?: string;
  email: string;
  phone?: string;
  cpBalance?: number;
  rttBalance?: number;
  baseSalary?: number;
  salary?: number;
  startDate?: string;
  hireDate?: Date | string;
  status?: "active" | "inactive" | "leave" | "on-leave";
  performance?: number;
  attendance?: number;
}

const SALARY_EVOLUTION = [
  { month: "Jan", total: 17500 }, { month: "Fév", total: 17500 },
  { month: "Mar", total: 17500 }, { month: "Avr", total: 17500 },
  { month: "Mai", total: 17500 }, { month: "Juin", total: 21000 },
  { month: "Juil", total: 21000 }, { month: "Août", total: 21000 },
  { month: "Sep", total: 21000 }, { month: "Oct", total: 21000 },
  { month: "Nov", total: 21000 }, { month: "Déc", total: 21000 },
];

const ABSENCE_STATS = [
  { type: "CP", value: 45, color: "#3b82f6" },
  { type: "RTT", value: 23, color: "#8b5cf6" },
  { type: "Maladie", value: 12, color: "#ef4444" },
  { type: "Autres", value: 8, color: "#f59e0b" },
];

export function HRComplete() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [showEnvelopeDialog, setShowEnvelopeDialog] = useState(false);
  const [showPayrollSettingsModal, setShowPayrollSettingsModal] = useState(false);
  const [employeeForSignature, setEmployeeForSignature] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    position: '', department: '', contract: '', hireDate: '', salary: '',
  });
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [showAiReportDialog, setShowAiReportDialog] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showAllRiskCards, setShowAllRiskCards] = useState(false);
  const [jumpToEmployeeName, setJumpToEmployeeName] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [showBulletinsDialog, setShowBulletinsDialog] = useState(false);
  const [bulletinsForEmployee, setBulletinsForEmployee] = useState<any[]>([]);
  const [loadingBulletins, setLoadingBulletins] = useState(false);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [documentsForEmployee, setDocumentsForEmployee] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [currentDocEmployee, setCurrentDocEmployee] = useState<any>(null);
  const [riskSearchQuery, setRiskSearchQuery] = useState("");

  useEffect(() => { loadEmployees(); }, []);

  useEffect(() => {
    apiClient.getHighRiskEmployees().then((data: any) => setHighRiskCount(data.length)).catch(() => {});
  }, []);

  const generateAiReport = async () => {
    setShowAiReportDialog(true);
    setLoadingReport(true);
    try {
      const report = await apiClient.getAiHrReport();
      setAiReport(report);
    } catch {
      setAiReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await apiClient.getEmployees();
      setEmployees(data);
    } catch (error: any) {
      let errorMessage = 'Erreur lors du chargement des employés';
      try { const p = JSON.parse(error.message); errorMessage = p.message || error.message; } catch { errorMessage = error.message || errorMessage; }
      toast.error(errorMessage);
      setEmployees([]);
    }
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email || !employeeForm.position || !employeeForm.department || !employeeForm.contract || !employeeForm.hireDate || !employeeForm.salary) {
      toast.error('Veuillez remplir tous les champs obligatoires'); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeForm.email)) { toast.error('Email invalide'); return; }
    try {
      setIsSavingEmployee(true);
      if (editingEmployeeId) {
        await apiClient.updateEmployee(editingEmployeeId, {
          firstName: employeeForm.firstName.trim(),
          lastName: employeeForm.lastName.trim(),
          email: employeeForm.email.trim().toLowerCase(),
          phone: employeeForm.phone?.trim() || undefined,
          position: employeeForm.position.trim(),
          department: employeeForm.department,
          hireDate: employeeForm.hireDate ? new Date(employeeForm.hireDate) : undefined,
          salary: employeeForm.salary ? parseFloat(employeeForm.salary) : undefined,
        });
      } else {
      await apiClient.createEmployee({
        firstName: employeeForm.firstName.trim(),
        lastName: employeeForm.lastName.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        phone: employeeForm.phone?.trim() || undefined,
        position: employeeForm.position.trim(),
        department: employeeForm.department,
        hireDate: employeeForm.hireDate ? new Date(employeeForm.hireDate) : undefined,
        salary: employeeForm.salary ? parseFloat(employeeForm.salary) : undefined,
        status: 'active', role: 'CONSULTANT',
      });
      toast.success('Collaborateur créé avec succès !');
      setEmployeeForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', contract: '', hireDate: '', salary: '' });
      }
      setEditingEmployeeId(null);
      setShowEmployeeDialog(false);
      await loadEmployees();
    } catch (error: any) {
      let msg = 'Erreur lors de la création';
      try { const p = JSON.parse(error.message); msg = p.message || error.message; } catch { msg = error.message || msg; }
      toast.error(msg);
    } finally { setIsSavingEmployee(false); }
  };

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter((e: any) => e?.status === "active")?.length || 0;
  const totalPayroll = employees?.reduce((sum: number, e: any) => sum + (e?.salary || 0), 0) || 0;
  const avgSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  const avgPerformance = totalEmployees > 0 ? (employees?.reduce((s: number, e: any) => s + (e?.performance || 0), 0) || 0) / totalEmployees : 0;
  const avgAttendance = totalEmployees > 0 ? (employees?.reduce((s: number, e: any) => s + (e?.attendance || 0), 0) || 0) / totalEmployees : 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Ressources Humaines</h1>
          <p className="text-muted-foreground mt-1">Gestion complète : collaborateurs, absences, formations, évaluations, recrutement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPayrollSettingsModal(true)} className="border-blue-300 text-blue-700 hover:bg-blue-50">
            <Settings className="w-4 h-4 mr-2" />Paramétrage DSN
          </Button>
          <Button variant="outline"><Bell className="w-4 h-4 mr-2" />Notifications</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Rapports</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="employees"><Users className="w-4 h-4 mr-2" />Collaborateurs</TabsTrigger>
          <TabsTrigger value="absences"><Umbrella className="w-4 h-4 mr-2" />Absences</TabsTrigger>
          <TabsTrigger value="payroll"><Euro className="w-4 h-4 mr-2" />Paie</TabsTrigger>
          <TabsTrigger value="training"><GraduationCap className="w-4 h-4 mr-2" />Formations</TabsTrigger>
          <TabsTrigger value="performance"><Target className="w-4 h-4 mr-2" />Évaluations</TabsTrigger>
          <TabsTrigger value="recruitment"><UserPlus className="w-4 h-4 mr-2" />Recrutement</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm">Collaborateurs</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl">{totalEmployees}</div><p className="text-xs text-green-600 mt-1">{activeEmployees} actifs</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm">Masse Salariale</CardTitle><Euro className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl">{totalPayroll.toLocaleString("fr-FR")} €</div><p className="text-xs text-muted-foreground mt-1">Par mois</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm">Salaire Moyen</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl">{avgSalary.toLocaleString("fr-FR")} €</div><p className="text-xs text-muted-foreground mt-1">Par collaborateur</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm">Performance Moy.</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl text-green-600">{avgPerformance.toFixed(0)}%</div><p className="text-xs text-muted-foreground mt-1">Score global</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm">Présence Moy.</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl text-blue-600">{avgAttendance.toFixed(0)}%</div><p className="text-xs text-muted-foreground mt-1">Taux de présence</p></CardContent></Card>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg">
            <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-indigo-500/30 blur-3xl"></div>
            <div className="absolute -right-4 top-20 w-32 h-32 rounded-full bg-fuchsia-500/20 blur-2xl"></div>
            <div className="absolute left-1/3 -bottom-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl"></div>
            <div className="relative flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">Intelligence Artificielle RH</p>
                  <h3 className="text-xl font-bold">Analyse du Risque d'Absentéisme</h3>
                  <p className="text-sm text-white/70 mt-1">
                    {highRiskCount > 0
                      ? `${highRiskCount} collaborateur(s) identifié(s) à risque élevé`
                      : "Aucun collaborateur à risque détecté actuellement"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-center">
                  <div className="text-4xl font-bold">{highRiskCount}</div>
                  <div className="text-xs text-white/70">à risque élevé</div>
                </div>
                <Button
                  onClick={generateAiReport}
                  className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90 font-semibold shadow-lg shadow-indigo-500/30 border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer le Rapport
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Évolution Masse Salariale</CardTitle><CardDescription>12 derniers mois</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={SALARY_EVOLUTION}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><RechartsTooltip />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Répartition des Absences</CardTitle><CardDescription>Année en cours</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie data={ABSENCE_STATS} cx="50%" cy="50%" labelLine={false} label={(e) => `${e.type} (${e.value})`} outerRadius={80} dataKey="value">
                      {ABSENCE_STATS.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Actions Rapides</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => {
                                setEditingEmployeeId(null);
                                setEmployeeForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', contract: '', hireDate: '', salary: '' });
                                setShowEmployeeDialog(true);
                              }}> 
                  <UserPlus className="h-8 w-8 text-blue-600" /><span className="text-sm">Nouveau Collaborateur</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => setActiveTab("absences")}>
                  <Umbrella className="h-8 w-8 text-purple-600" /><span className="text-sm">Demande Absence</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Receipt className="h-8 w-8 text-green-600" /><span className="text-sm">Générer Paie</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => setShowTrainingDialog(true)}>
                  <GraduationCap className="h-8 w-8 text-orange-600" /><span className="text-sm">Planifier Formation</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showAiReportDialog} onOpenChange={setShowAiReportDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600" />Rapport RH généré par IA</DialogTitle>
                <DialogDescription>Analyse du risque d'absentéisme et recommandations</DialogDescription>
              </DialogHeader>
              {loadingReport ? (
                <div className="py-16 flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping"></div>
                    <Sparkles className="w-10 h-10 text-purple-500 animate-spin relative" style={{ animationDuration: '2s' }} />
                  </div>
                  <span className="animate-pulse">Analyse en cours...</span>
                </div>
              ) : aiReport ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-violet-900">{aiReport.summary}</p>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un collaborateur..."
                      value={riskSearchQuery}
                      onChange={(e) => setRiskSearchQuery(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="px-3 py-2 font-medium">Collaborateur</th>
                            <th className="px-3 py-2 font-medium">Statut</th>
                            <th className="px-3 py-2 font-medium">Score</th>
                            <th className="px-3 py-2 font-medium text-right">Absences/90j</th>
                          <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(aiReport.riskScores || [])
                            .filter((e: any) => e.riskLevel !== 'low')
                            .filter((e: any) => e.employeeName.toLowerCase().includes(riskSearchQuery.toLowerCase()))
                            .map((emp: any) => {
                              const initials = emp.employeeName.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
                              const isHigh = emp.riskLevel === 'high';
                              return (
                                <tr key={emp.employeeId} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {initials}
                                      </div>
                                      <span className="font-medium truncate">{emp.employeeName}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${isHigh ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                                      {isHigh ? 'Élevé' : 'Moyen'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 w-28">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${emp.riskScore}%` }}></div>
                                      </div>
                                      <span className="text-xs text-muted-foreground w-6">{emp.riskScore}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right text-muted-foreground">{emp.absenceCountLast90Days}</td>
                                  <td className="px-3 py-2 text-right"><button onClick={() => { setJumpToEmployeeName(emp.employeeName); setShowAiReportDialog(false); setActiveTab("absences"); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Voir</button></td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {(() => {
                    const stableCount = (aiReport.riskScores || []).filter((e: any) => e.riskLevel === 'low').length;
                    return stableCount > 0 ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        {stableCount} collaborateur(s) stable(s), aucune action requise
                      </div>
                    ) : null;
                  })()}

                  {aiReport.recommendations && aiReport.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                      {aiReport.recommendations.map((rec: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-700 border">
                          {rec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">Aucune donnée disponible</div>
              )}
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-sm">Turnover</CardTitle></CardHeader><CardContent><div className="text-2xl text-green-600">8.5%</div><p className="text-xs text-muted-foreground mt-1">Taux annuel</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Absentéisme</CardTitle></CardHeader><CardContent><div className="text-2xl text-blue-600">3.2%</div><p className="text-xs text-muted-foreground mt-1">Taux mensuel</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Formations</CardTitle></CardHeader><CardContent><div className="text-2xl text-orange-600">12h</div><p className="text-xs text-muted-foreground mt-1">Moyenne par collaborateur/an</p></CardContent></Card>
          </div>
        </TabsContent>

        {/* COLLABORATEURS */}
        <TabsContent value="employees" className="space-y-6">
          <div className="flex items-center justify-between">
            <div><h2>Gestion des Collaborateurs</h2><p className="text-sm text-muted-foreground">Fiches complètes, contrats, documents administratifs</p></div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                                setEditingEmployeeId(null);
                                setEmployeeForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', contract: '', hireDate: '', salary: '' });
                                setShowEmployeeDialog(true);
                              }}> <Plus className="w-4 h-4 mr-2" />Nouveau Collaborateur</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>Liste des Collaborateurs</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Nom</TableHead><TableHead>Poste</TableHead><TableHead>Département</TableHead>
                    <TableHead>Contrat</TableHead><TableHead className="text-right">Salaire</TableHead>
                    <TableHead className="text-center">CP</TableHead><TableHead className="text-center">RTT</TableHead>
                    <TableHead className="text-center">Performance</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Aucun collaborateur trouvé</TableCell></TableRow>
                  ) : (
                    employees.map((employee: any, index: number) => (
                      <TableRow key={employee.id || employee._id || `employee-${index}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>
                            <div><div>{employee.firstName} {employee.lastName}</div><div className="text-xs text-muted-foreground">{employee.email}</div></div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell><Badge variant="outline">{employee.department}</Badge></TableCell>
                        <TableCell>{employee.contract}</TableCell>
                        <TableCell className="text-right font-semibold">{(employee.salary || employee.baseSalary || 0).toLocaleString("fr-FR")} €</TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="bg-blue-50 text-blue-700">{employee.cpBalance || 0}j</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="bg-purple-50 text-purple-700">{employee.rttBalance || 0}j</Badge></TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(employee.performance >= 80 ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700")}>
                            {employee.performance || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-700">Actif</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingEmployee(employee)}><Eye className="w-4 h-4 mr-2" />Voir fiche</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingEmployeeId(employee.id || employee._id);
                                setEmployeeForm({
                                  firstName: employee.firstName || '',
                                  lastName: employee.lastName || '',
                                  email: employee.email || '',
                                  phone: employee.phone || '',
                                  position: employee.position || '',
                                  department: employee.department || '',
                                  contract: employee.contract || '',
                                  hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
                                  salary: employee.salary ? String(employee.salary) : '',
                                });
                                setShowEmployeeDialog(true);
                              }}><Edit className="w-4 h-4 mr-2" />Éditer</DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                setCurrentDocEmployee(employee);
                                setShowDocumentsDialog(true);
                                setLoadingDocuments(true);
                                try {
                                  const empId = employee.id || employee._id;
                                  const docs = await apiClient.getEmployeeDocuments(empId);
                                  setDocumentsForEmployee(docs);
                                } catch {
                                  setDocumentsForEmployee([]);
                                } finally {
                                  setLoadingDocuments(false);
                                }
                              }}><FileText className="w-4 h-4 mr-2" />Documents</DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                setShowBulletinsDialog(true);
                                setLoadingBulletins(true);
                                try {
                                  const all = await apiClient.getBulletins();
                                  const empId = employee.id || employee._id;
                                  setBulletinsForEmployee(all.filter((b: any) => b.employeeId === empId));
                                } catch {
                                  setBulletinsForEmployee([]);
                                } finally {
                                  setLoadingBulletins(false);
                                }
                              }}><Receipt className="w-4 h-4 mr-2" />Bulletins de paie</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEmployeeForSignature(employee); setShowEnvelopeDialog(true); }}>
                                <FileSignature className="w-4 h-4 mr-2" />Envoyer contrat pour signature
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABSENCES — MODULE COMPLET */}
        <TabsContent value="absences" className="space-y-6">
          <HRAbsences employees={employees} initialEmployeeFilter={jumpToEmployeeName} />
        </TabsContent>

        {/* PAIE */}
      <TabsContent value="payroll" className="space-y-6">
    <HRPayroll employees={employees} />
</TabsContent>

        {/* FORMATIONS */}
        <TabsContent value="training" className="space-y-6"><HRFormations employees={employees} /></TabsContent>

        {/* ÉVALUATIONS */}
        <TabsContent value="performance" className="space-y-6"><HREvaluations employees={employees} /></TabsContent>

        {/* RECRUTEMENT */}
        <TabsContent value="recruitment" className="space-y-6"><HRRecrutement employees={employees} /></TabsContent>
      </Tabs>

      {/* DIALOG NOUVEAU COLLABORATEUR */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingEmployeeId ? "Modifier le Collaborateur" : "Nouveau Collaborateur"}</DialogTitle><DialogDescription>{editingEmployeeId ? "Modifiez les informations du collaborateur" : "Enregistrez les informations du nouveau collaborateur"}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prénom *</Label><Input placeholder="Jean" value={employeeForm.firstName} onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Nom *</Label><Input placeholder="Dupont" value={employeeForm.lastName} onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Poste *</Label><Input placeholder="Développeur Senior" value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Département *</Label>
                <Select value={employeeForm.department} onValueChange={(v) => setEmployeeForm({ ...employeeForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="conseil">Conseil</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Contrat *</Label>
                <Select value={employeeForm.contract} onValueChange={(v) => setEmployeeForm({ ...employeeForm, contract: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="STAGE">Stage</SelectItem>
                    <SelectItem value="ALTERNANCE">Alternance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date début *</Label><Input type="date" value={employeeForm.hireDate} onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Salaire (€) *</Label><Input type="number" placeholder="4500" value={employeeForm.salary} onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="jean@company.fr" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input placeholder="+216 22 000 000" value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmployeeDialog(false)} disabled={isSavingEmployee}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveEmployee} disabled={isSavingEmployee}>
              {isSavingEmployee ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Enregistrement...</> : (editingEmployeeId ? 'Mettre a jour' : 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fiche Collaborateur</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Nom complet</span><span className="font-medium">{viewingEmployee.firstName} {viewingEmployee.lastName}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Email</span><span className="font-medium">{viewingEmployee.email}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Telephone</span><span className="font-medium">{viewingEmployee.phone || '-'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Poste</span><span className="font-medium">{viewingEmployee.position}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Departement</span><span className="font-medium">{viewingEmployee.department}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Salaire</span><span className="font-medium">{viewingEmployee.salary} EUR</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Date d'embauche</span><span className="font-medium">{viewingEmployee.hireDate ? new Date(viewingEmployee.hireDate).toLocaleDateString('fr-FR') : '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><Badge className="bg-green-100 text-green-700">{viewingEmployee.status}</Badge></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBulletinsDialog} onOpenChange={setShowBulletinsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulletins de Paie</DialogTitle>
          </DialogHeader>
          {loadingBulletins ? (
            <div className="py-8 text-center text-muted-foreground">Chargement...</div>
          ) : bulletinsForEmployee.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Aucun bulletin de paie pour ce collaborateur</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Brut</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulletinsForEmployee.map((b: any) => (
                  <TableRow key={b._id || b.id}>
                    <TableCell>{b.month}/{b.year}</TableCell>
                    <TableCell className="text-right">{b.salaireBrut} EUR</TableCell>
                    <TableCell className="text-right font-medium">{b.salaireNet} EUR</TableCell>
                    <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documents - {currentDocEmployee?.firstName} {currentDocEmployee?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                id="doc-upload-input"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentDocEmployee) return;
                  setUploadingDocument(true);
                  try {
                    const empId = currentDocEmployee.id || currentDocEmployee._id;
                    await apiClient.uploadEmployeeDocument(empId, file);
                    const docs = await apiClient.getEmployeeDocuments(empId);
                    setDocumentsForEmployee(docs);
                    toast.success('Document ajoute avec succes');
                  } catch {
                    toast.error("Erreur lors de l'ajout du document");
                  } finally {
                    setUploadingDocument(false);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                variant="outline"
                className="w-full border-dashed"
                disabled={uploadingDocument}
                onClick={() => document.getElementById('doc-upload-input')?.click()}
              >
                {uploadingDocument ? 'Envoi en cours...' : '+ Ajouter un document'}
              </Button>
            </div>

            {loadingDocuments ? (
              <div className="py-8 text-center text-muted-foreground">Chargement...</div>
            ) : documentsForEmployee.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Aucun document pour ce collaborateur</div>
            ) : (
              <div className="space-y-2">
                {documentsForEmployee.map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(doc.fileSize / 1024)} Ko</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => apiClient.downloadGEDDocument(doc._id, doc.fileName)}>
                        Telecharger
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          await apiClient.deleteGEDDocument(doc._id);
                          setDocumentsForEmployee((prev) => prev.filter((d) => d._id !== doc._id));
                          toast.success('Document supprime');
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* DIALOG FORMATION */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Planifier une Formation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Titre *</Label><Input placeholder="Formation React Avancé" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date début</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Durée (jours)</Label><Input type="number" placeholder="3" /></div>
            </div>
            <div className="space-y-2"><Label>Organisme</Label><Input placeholder="Tech Academy" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrainingDialog(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { toast.success("Formation planifiée !"); setShowTrainingDialog(false); }}>Planifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG SIGNATURE */}
      <EnvelopeCreationDialog
        open={showEnvelopeDialog}
        onOpenChange={setShowEnvelopeDialog}
        onCreate={async (envelopeData: any) => {
          try {
            if (employeeForSignature) {
              if (!envelopeData.recipients?.length) {
                envelopeData.recipients = [{ name: `${employeeForSignature.firstName} ${employeeForSignature.lastName}`, email: employeeForSignature.email, role: 'SIGNER' as 'SIGNER' }];
              }
              if (!envelopeData.title) envelopeData.title = `Contrat - ${employeeForSignature.firstName} ${employeeForSignature.lastName}`;
            }
            if (envelopeData.signers) delete envelopeData.signers;
            await apiClient.createEnvelope(envelopeData);
            toast.success("Enveloppe créée !");
            setShowEnvelopeDialog(false);
            setEmployeeForSignature(null);
            setTimeout(() => { window.location.href = '/signature'; }, 1500);
          } catch (error: any) {
            toast.error(error?.message || "Erreur lors de la création de l'enveloppe");
          }
        }}
      />

      <PayrollSettingsModal open={showPayrollSettingsModal} onOpenChange={setShowPayrollSettingsModal} />

    </div>
  );
}