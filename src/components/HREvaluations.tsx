import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Target, Star, CheckCircle2, Clock } from "lucide-react";
import apiClient from "@/lib/api-client-backend";

interface Evaluation {
  id: string;
  employeeId: string;
  employe: string;
  evaluateur: string;
  date: string;
  score: number;
  objectifs: string;
  commentaires: string;
  statut: "draft" | "completed";
}

interface HREvaluationsProps {
  employees: any[];
}

export function HREvaluations({ employees }: HREvaluationsProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    employeeId: "", evaluateur: "", date: "", score: "", objectifs: "", commentaires: "",
  });

  useEffect(() => {
    apiClient.request<any[]>("/evaluations")
      .then(data => setEvaluations(data.map((e: any) => ({
        id: e._id || e.id,
        employeeId: e.employeeId,
        employe: e.employe,
        evaluateur: e.evaluateur,
        date: e.date,
        score: e.score,
        objectifs: e.objectifs,
        commentaires: e.commentaires,
        statut: e.statut,
      }))))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.date || !form.score) {
      toast.error("Veuillez remplir les champs obligatoires"); return;
    }
    const emp = employees.find((e: any) => (e.id || e._id) === form.employeeId);
    const payload = {
      employeeId: form.employeeId,
      employe: emp ? `${emp.firstName} ${emp.lastName}` : form.employeeId,
      evaluateur: form.evaluateur,
      date: form.date,
      score: parseInt(form.score),
      objectifs: form.objectifs,
      commentaires: form.commentaires,
      statut: "completed",
    };
    try {
      const created = await apiClient.request<any>("/evaluations", { method: "POST", body: JSON.stringify(payload) });
      setEvaluations(prev => [{ ...payload, id: created._id || created.id || Date.now().toString() }, ...prev]);
    } catch {
      setEvaluations(prev => [{ ...payload, id: Date.now().toString() }, ...prev]);
    }
    toast.success("Évaluation enregistrée !");
    setShowDialog(false);
    setForm({ employeeId: "", evaluateur: "", date: "", score: "", objectifs: "", commentaires: "" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700"><Star className="w-3 h-3 mr-1" />Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-blue-100 text-blue-700"><Star className="w-3 h-3 mr-1" />Bien</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-700"><Star className="w-3 h-3 mr-1" />Moyen</Badge>;
    return <Badge className="bg-red-100 text-red-700"><Star className="w-3 h-3 mr-1" />Insuffisant</Badge>;
  };

  const avgScore = evaluations.length > 0 ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length) : 0;
  const excellent = evaluations.filter(e => e.score >= 80).length;
  const completed = evaluations.filter(e => e.statut === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Évaluations de Performance</h2>
          <p className="text-sm text-muted-foreground">Suivi des objectifs et entretiens annuels</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvelle Évaluation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{evaluations.length}</div><p className="text-xs text-muted-foreground">Évaluations</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Score Moyen</CardTitle></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</div><p className="text-xs text-muted-foreground">Global</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Excellents</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{excellent}</div><p className="text-xs text-muted-foreground">Score ≥ 80%</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Complétées</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">{completed}</div><p className="text-xs text-muted-foreground">Cette année</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Liste des Évaluations</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Collaborateur</TableHead><TableHead>Évaluateur</TableHead>
                <TableHead>Date</TableHead><TableHead className="text-center">Score</TableHead>
                <TableHead>Performance</TableHead><TableHead>Objectifs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucune évaluation enregistrée</p>
                    <p className="text-xs mt-1">Cliquez sur "Nouvelle Évaluation" pour commencer</p>
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.employe}</TableCell>
                    <TableCell>{e.evaluateur || "—"}</TableCell>
                    <TableCell>{new Date(e.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-center"><span className={`text-xl font-bold ${getScoreColor(e.score)}`}>{e.score}%</span></TableCell>
                    <TableCell>{getScoreBadge(e.score)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{e.objectifs || "—"}</TableCell>
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
            <DialogTitle>Nouvelle Évaluation</DialogTitle>
            <DialogDescription>Enregistrer une évaluation de performance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Collaborateur *</Label>
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
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Score (0-100) *</Label><Input type="number" min="0" max="100" placeholder="85" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Évaluateur</Label><Input placeholder="Nom du manager" value={form.evaluateur} onChange={e => setForm({ ...form, evaluateur: e.target.value })} /></div>
            <div className="space-y-2"><Label>Objectifs atteints</Label><Textarea placeholder="Décrivez les objectifs atteints..." value={form.objectifs} onChange={e => setForm({ ...form, objectifs: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Commentaires</Label><Textarea placeholder="Commentaires généraux..." value={form.commentaires} onChange={e => setForm({ ...form, commentaires: e.target.value })} rows={2} /></div>
            {form.score && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <span className="text-blue-800 font-medium">Performance : </span>
                {parseInt(form.score) >= 80 ? "🌟 Excellent" : parseInt(form.score) >= 60 ? "👍 Bien" : parseInt(form.score) >= 40 ? "⚠️ Moyen" : "❌ Insuffisant"}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
