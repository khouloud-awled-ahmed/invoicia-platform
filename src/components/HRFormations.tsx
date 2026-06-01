import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client-backend";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, GraduationCap, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Formation {
  id: string;
  titre: string;
  organisme: string;
  dateDebut: string;
  duree: number;
  employe: string;
  statut: "planifiee" | "en_cours" | "terminee" | "annulee";
  description?: string;
}

interface HRFormationsProps {
  employees: any[];
}

export function HRFormations({ employees }: HRFormationsProps) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    apiClient.request<any[]>("/formations")
      .then(data => setFormations(data.map((f: any) => ({
        id: f._id || f.id,
        titre: f.titre,
        organisme: f.organisme,
        dateDebut: f.dateDebut,
        duree: f.duree,
        employe: f.employe,
        statut: f.statut,
        description: f.description,
      }))))
      .catch(() => {});
  }, []);
  const [form, setForm] = useState({
    titre: "", organisme: "", dateDebut: "", duree: "", employeeId: "", description: "",
  });

  const handleSubmit = async () => {
    if (!form.titre || !form.dateDebut || !form.duree) {
      toast.error("Veuillez remplir les champs obligatoires"); return;
    }
    const emp = employees.find((e: any) => (e.id || e._id) === form.employeeId);
    const newFormation: Formation = {
      id: Date.now().toString(),
      titre: form.titre,
      organisme: form.organisme,
      dateDebut: form.dateDebut,
      duree: parseInt(form.duree),
      employe: emp ? `${emp.firstName} ${emp.lastName}` : "Non assigné",
      statut: "planifiee",
      description: form.description,
    };
    try {
      const created = await apiClient.request<any>("/formations", { method: "POST", body: JSON.stringify({ ...newFormation, employeeId: form.employeeId }) });
      setFormations(prev => [{ ...newFormation, id: created._id || created.id }, ...prev]);
    } catch {
      setFormations(prev => [newFormation, ...prev]);
    }
    toast.success("Formation planifiée !");
    setShowDialog(false);
    setForm({ titre: "", organisme: "", dateDebut: "", duree: "", employeeId: "", description: "" });
  };

  const getStatusBadge = (statut: string) => {
    if (statut === "terminee") return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Terminée</Badge>;
    if (statut === "en_cours") return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
    if (statut === "annulee") return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Annulée</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Planifiée</Badge>;
  };

  const planned = formations.filter(f => f.statut === "planifiee").length;
  const ongoing = formations.filter(f => f.statut === "en_cours").length;
  const done = formations.filter(f => f.statut === "terminee").length;
  const totalDays = formations.reduce((s, f) => s + f.duree, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Plan de Formation</h2>
          <p className="text-sm text-muted-foreground">Gestion des formations et développement des compétences</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvelle Formation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Planifiées</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{planned}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">En Cours</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{ongoing}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Terminées</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{done}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Jours</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">{totalDays}j</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Liste des Formations</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Formation</TableHead><TableHead>Organisme</TableHead>
                <TableHead>Collaborateur</TableHead><TableHead>Date début</TableHead>
                <TableHead className="text-center">Durée</TableHead><TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucune formation planifiée</p>
                    <p className="text-xs mt-1">Cliquez sur "Nouvelle Formation" pour commencer</p>
                  </TableCell>
                </TableRow>
              ) : (
                formations.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.titre}</TableCell>
                    <TableCell>{f.organisme || "—"}</TableCell>
                    <TableCell>{f.employe}</TableCell>
                    <TableCell>{new Date(f.dateDebut).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline">{f.duree}j</Badge></TableCell>
                    <TableCell>{getStatusBadge(f.statut)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {f.statut === "planifiee" && (
                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700" onClick={() => setFormations(prev => prev.map(x => x.id === f.id ? { ...x, statut: "en_cours" } : x))}>Démarrer</Button>
                        )}
                        {f.statut === "en_cours" && (
                          <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={() => setFormations(prev => prev.map(x => x.id === f.id ? { ...x, statut: "terminee" } : x))}>Terminer</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle Formation</DialogTitle>
            <DialogDescription>Planifier une formation pour un collaborateur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Titre *</Label><Input placeholder="Formation React Avancé" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
            <div className="space-y-2"><Label>Organisme</Label><Input placeholder="Tech Academy" value={form.organisme} onChange={e => setForm({ ...form, organisme: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Collaborateur</Label>
              <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un collaborateur" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e: any) => (
                    <SelectItem key={e.id || e._id} value={e.id || e._id}>{e.firstName} {e.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date début *</Label><Input type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} /></div>
              <div className="space-y-2"><Label>Durée (jours) *</Label><Input type="number" placeholder="3" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Objectifs de la formation..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Planifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



