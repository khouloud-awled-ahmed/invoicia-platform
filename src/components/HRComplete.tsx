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

  useEffect(() => { loadEmployees(); }, []);

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
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => setShowEmployeeDialog(true)}>
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
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowEmployeeDialog(true)}><Plus className="w-4 h-4 mr-2" />Nouveau Collaborateur</Button>
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
                              <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Voir fiche</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Éditer</DropdownMenuItem>
                              <DropdownMenuItem><FileText className="w-4 h-4 mr-2" />Documents</DropdownMenuItem>
                              <DropdownMenuItem><Receipt className="w-4 h-4 mr-2" />Bulletins de paie</DropdownMenuItem>
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
          <HRAbsences employees={employees} />
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
          <DialogHeader><DialogTitle>Nouveau Collaborateur</DialogTitle><DialogDescription>Enregistrez les informations du nouveau collaborateur</DialogDescription></DialogHeader>
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
              {isSavingEmployee ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Enregistrement...</> : 'Enregistrer'}
            </Button>
          </DialogFooter>
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