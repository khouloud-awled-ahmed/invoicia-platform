import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";
import { Plus, CheckCircle2, XCircle, Clock, Umbrella, Stethoscope, Baby, Plane, Coffee } from "lucide-react";
import apiClient from "@/lib/api-client-backend";
interface Absence {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

interface HRAbsencesProps {
  employees: any[];
}

const ABSENCE_TYPES = [
  { value: "CP", label: "Congé Payé", icon: Umbrella, color: "bg-blue-100 text-blue-700" },
  { value: "RTT", label: "RTT", icon: Coffee, color: "bg-purple-100 text-purple-700" },
  { value: "MALADIE", label: "Maladie", icon: Stethoscope, color: "bg-red-100 text-red-700" },
  { value: "MATERNITE", label: "Maternité/Paternité", icon: Baby, color: "bg-pink-100 text-pink-700" },
  { value: "VOYAGE", label: "Mission / Déplacement", icon: Plane, color: "bg-orange-100 text-orange-700" },
  { value: "AUTRE", label: "Autre", icon: Clock, color: "bg-gray-100 text-gray-700" },
];

export function HRAbsences({ employees }: HRAbsencesProps) {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
useEffect(() => {
  apiClient.getAbsences()
    .then(data => setAbsences(data.map((a: any) => ({
      id: a._id || a.id,
      employee: a.employeeId,
      type: a.type,
      startDate: a.startDate,
      endDate: a.endDate,
      days: a.days,
      status: a.status,
      reason: a.reason,
    }))))
    .catch(() => {});
}, []);
  const calcDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

// handleSubmit:
const handleSubmit = async () => {
  if (!form.employeeId || !form.type || !form.startDate || !form.endDate) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }
  if (new Date(form.endDate) < new Date(form.startDate)) {
    toast.error("La date de fin doit être après la date de début");
    return;
  }
  try {
    const emp = employees.find((e: any) => (e.id || e._id) === form.employeeId);
    const created = await apiClient.createAbsence({
      employeeId: form.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : form.employeeId,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      days: calcDays(form.startDate, form.endDate),
      reason: form.reason,
    });
    setAbsences(prev => [{
      id: created._id || created.id,
      employee: emp ? `${emp.firstName} ${emp.lastName}` : form.employeeId,
      type: created.type,
      startDate: created.startDate,
      endDate: created.endDate,
      days: created.days,
      status: created.status,
      reason: created.reason,
    }, ...prev]);
    toast.success("Demande d'absence soumise avec succès !");
    setShowDialog(false);
    setForm({ employeeId: "", type: "", startDate: "", endDate: "", reason: "" });
  } catch {
    toast.error("Erreur lors de la soumission");
  }
};
const handleApprove = async (id: string) => {
  await apiClient.approveAbsence(id).catch(() => {});
  setAbsences(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  toast.success("Absence approuvée !");
};

const handleReject = async (id: string) => {
  await apiClient.rejectAbsence(id).catch(() => {});
  setAbsences(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
  toast.error("Absence refusée");
};

  const filtered = filter === "all" ? absences : absences.filter(a => a.status === filter);
  const pending = absences.filter(a => a.status === "pending").length;
  const approved = absences.filter(a => a.status === "approved").length;
  const totalDays = absences.filter(a => a.status === "approved").reduce((s, a) => s + a.days, 0);

  const getTypeBadge = (type: string) => {
    const t = ABSENCE_TYPES.find(x => x.value === type);
    return t ? <Badge className={t.color}>{t.label}</Badge> : <Badge>{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Approuvée</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Refusée</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des Absences</h2>
          <p className="text-sm text-muted-foreground">Congés, RTT, maladies et autres absences</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">En Attente</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div><p className="text-xs text-muted-foreground">À valider</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Approuvées</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{approved}</div><p className="text-xs text-muted-foreground">Cette année</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Jours Posés</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{totalDays}</div><p className="text-xs text-muted-foreground">Total approuvés</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Demandes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{absences.length}</div><p className="text-xs text-muted-foreground">Toutes demandes</p></CardContent>
        </Card>
      </div>

      {/* Types d'absences */}
      <Card>
        <CardHeader><CardTitle className="text-base">Types d'Absences</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ABSENCE_TYPES.map(t => (
              <div key={t.value} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${t.color}`}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Liste des Demandes</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="rejected">Refusées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Collaborateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead className="text-center">Jours</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Umbrella className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucune demande d'absence</p>
                    <p className="text-xs mt-1">Cliquez sur "Nouvelle Demande" pour en créer une</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(absence => (
                  <TableRow key={absence.id}>
                    <TableCell className="font-medium">{absence.employee}</TableCell>
                    <TableCell>{getTypeBadge(absence.type)}</TableCell>
                    <TableCell>{new Date(absence.startDate).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{new Date(absence.endDate).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{absence.days}j</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{absence.reason || "—"}</TableCell>
                    <TableCell>{getStatusBadge(absence.status)}</TableCell>
                    <TableCell className="text-right">
                      {absence.status === "pending" && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => handleApprove(absence.id)}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleReject(absence.id)}>
                            <XCircle className="w-3 h-3 mr-1" />Refuser
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog nouvelle demande */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle Demande d'Absence</DialogTitle>
            <DialogDescription>Remplissez les informations de la demande</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Collaborateur *</Label>
              <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un collaborateur" /></SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun collaborateur</SelectItem>
                  ) : (
                    employees.map((e: any) => (
                      <SelectItem key={e.id || e._id} value={e.id || e._id}>
                        {e.firstName} {e.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type d'absence *</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
                <SelectContent>
                  {ABSENCE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début *</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date de fin *</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            {form.startDate && form.endDate && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                Durée : <strong>{calcDays(form.startDate, form.endDate)} jour(s)</strong>
              </div>
            )}
            <div className="space-y-2">
              <Label>Motif (optionnel)</Label>
              <Textarea placeholder="Précisez le motif de l'absence..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Soumettre la demande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}