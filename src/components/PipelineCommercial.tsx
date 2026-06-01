import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, TrendingUp, Target, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Opportunity {
  _id: string;
  name: string;
  client: string;
  amount: number;
  probability: number;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
}

const EMPTY_FORM = {
  name: "",
  client: "",
  amount: "",
  probability: "",
  stage: "lead" as Opportunity["stage"],
};

const API = "http://localhost:3001/api/pipeline";

export function PipelineCommercial() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setOpportunities(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur lors du chargement des opportunités.");
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);
  const wonValue = opportunities.filter(o => o.stage === "won").reduce((sum, o) => sum + o.amount, 0);
  const conversionRate = opportunities.length > 0
    ? Math.round((opportunities.filter(o => o.stage === "won").length / opportunities.length) * 100)
    : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

  const handleOpen = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.client || !form.amount || !form.probability) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name,
          client: form.client,
          amount: parseFloat(form.amount),
          probability: parseFloat(form.probability),
          stage: form.stage,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchOpportunities();
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
      toast.success("Opportunité créée avec succès !");
    } catch {
      toast.error("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      await fetchOpportunities();
      toast.success("Opportunité supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Pipeline Commercial</h1>
          <p className="text-muted-foreground mt-1">Gestion des opportunités et prévisions de CA</p>
        </div>
        <Button onClick={handleOpen} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Opportunité
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pipeline Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{opportunities.length} opportunités</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">CA Prévisionnel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{formatCurrency(weightedValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pondéré</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">CA Gagné</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(wonValue)}</div>
            <p className="text-xs text-green-600 mt-1">Affaires signées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Taux de Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Opportunités gagnées</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunités Actives</CardTitle>
          <CardDescription>{opportunities.length} opportunité(s) en cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Aucune opportunité pour le moment.</p>
            )}
            {opportunities.map((opp) => (
              <div key={opp._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium">{opp.name}</div>
                  <div className="text-sm text-muted-foreground">{opp.client}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{formatCurrency(opp.amount)}</div>
                    <Badge variant="outline">{opp.probability}%</Badge>
                  </div>
                  <button
                    onClick={() => handleDelete(opp._id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Nouvelle Opportunité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nom de l'opportunité</Label>
              <Input autoComplete="off" placeholder="Ex: Refonte Site Web" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Client</Label>
              <Input autoComplete="off" placeholder="Ex: AcmeCorp SA" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Montant (€)</Label>
                <Input autoComplete="off" type="number" placeholder="Ex: 50000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Probabilité (%)</Label>
                <Input autoComplete="off" type="number" min="0" max="100" placeholder="Ex: 75" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Étape</Label>
              <Select value={form.stage} onValueChange={(value) => setForm({ ...form, stage: value as Opportunity["stage"] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une étape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualifié</SelectItem>
                  <SelectItem value="proposal">Proposition</SelectItem>
                  <SelectItem value="negotiation">Négociation</SelectItem>
                  <SelectItem value="won">Gagné</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Création..." : "Créer l'opportunité"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
