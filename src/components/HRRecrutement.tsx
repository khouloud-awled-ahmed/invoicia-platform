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
import { Plus, Briefcase, Users, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import apiClient from "@/lib/api-client-backend";

interface Offre {
  id: string;
  titre: string;
  departement: string;
  typeContrat: string;
  localisation: string;
  description: string;
  statut: "ouverte" | "en_cours" | "pourvue" | "annulee";
  candidatures: number;
  datePublication: string;
}

interface HRRecrutementProps {
  employees: any[];
}

export function HRRecrutement({ employees }: HRRecrutementProps) {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    titre: "", departement: "", typeContrat: "", localisation: "", description: "",
  });

  useEffect(() => {
    apiClient.request<any[]>("/recrutement/offres")
      .then(data => setOffres(data.map((o: any) => ({
        id: o._id || o.id,
        titre: o.titre,
        departement: o.departement,
        typeContrat: o.typeContrat,
        localisation: o.localisation,
        description: o.description,
        statut: o.statut,
        candidatures: o.candidatures || 0,
        datePublication: o.datePublication,
      }))))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.titre || !form.departement || !form.typeContrat) {
      toast.error("Veuillez remplir les champs obligatoires"); return;
    }
    const payload = {
      titre: form.titre,
      departement: form.departement,
      typeContrat: form.typeContrat,
      localisation: form.localisation,
      description: form.description,
      statut: "ouverte",
      candidatures: 0,
      datePublication: new Date().toISOString().split("T")[0],
    };
    try {
      const created = await apiClient.request<any>("/recrutement/offres", { method: "POST", body: JSON.stringify(payload) });
      setOffres(prev => [{ ...payload, id: created._id || created.id || Date.now().toString() }, ...prev]);
    } catch {
      setOffres(prev => [{ ...payload, id: Date.now().toString() }, ...prev]);
    }
    toast.success("Offre publiée !");
    setShowDialog(false);
    setForm({ titre: "", departement: "", typeContrat: "", localisation: "", description: "" });
  };

  const getStatusBadge = (statut: string) => {
    if (statut === "pourvue") return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Pourvue</Badge>;
    if (statut === "en_cours") return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
    if (statut === "annulee") return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Annulée</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Ouverte</Badge>;
  };

  const ouvertes = offres.filter(o => o.statut === "ouverte").length;
  const enCours = offres.filter(o => o.statut === "en_cours").length;
  const pourvues = offres.filter(o => o.statut === "pourvue").length;
  const totalCandidatures = offres.reduce((s, o) => s + o.candidatures, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Processus de Recrutement</h2>
          <p className="text-sm text-muted-foreground">Offres d emploi, candidatures et entretiens</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvelle Offre
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Offres Ouvertes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{ouvertes}</div><p className="text-xs text-muted-foreground">En attente</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">En Cours</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{enCours}</div><p className="text-xs text-muted-foreground">Entretiens</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pourvues</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{pourvues}</div><p className="text-xs text-muted-foreground">Recrutements réussis</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Candidatures</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">{totalCandidatures}</div><p className="text-xs text-muted-foreground">Total reçues</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Offres d emploi</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Poste</TableHead><TableHead>Département</TableHead>
                <TableHead>Contrat</TableHead><TableHead>Localisation</TableHead>
                <TableHead className="text-center">Candidatures</TableHead>
                <TableHead>Date</TableHead><TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucune offre d emploi active</p>
                    <p className="text-xs mt-1">Cliquez sur "Nouvelle Offre" pour publier</p>
                  </TableCell>
                </TableRow>
              ) : (
                offres.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.titre}</TableCell>
                    <TableCell><Badge variant="outline">{o.departement}</Badge></TableCell>
                    <TableCell>{o.typeContrat}</TableCell>
                    <TableCell>{o.localisation || "—"}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline">{o.candidatures}</Badge></TableCell>
                    <TableCell>{o.datePublication ? new Date(o.datePublication).toLocaleDateString("fr-FR") : "—"}</TableCell>
                    <TableCell>{getStatusBadge(o.statut)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {o.statut === "ouverte" && (
                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700" onClick={() => setOffres(prev => prev.map(x => x.id === o.id ? { ...x, statut: "en_cours" } : x))}>Démarrer</Button>
                        )}
                        {o.statut === "en_cours" && (
                          <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={() => setOffres(prev => prev.map(x => x.id === o.id ? { ...x, statut: "pourvue" } : x))}>Pourvoir</Button>
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
            <DialogTitle>Nouvelle Offre d emploi</DialogTitle>
            <DialogDescription>Publier une offre de recrutement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Titre du poste *</Label><Input placeholder="Développeur Full Stack" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Département *</Label>
                <Select value={form.departement} onValueChange={v => setForm({ ...form, departement: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Conseil">Conseil</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type de contrat *</Label>
                <Select value={form.typeContrat} onValueChange={v => setForm({ ...form, typeContrat: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Alternance">Alternance</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Localisation</Label><Input placeholder="Tunis, Sfax..." value={form.localisation} onChange={e => setForm({ ...form, localisation: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Décrivez le poste et les compétences requises..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Publier l offre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
