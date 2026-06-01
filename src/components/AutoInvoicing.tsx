import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Zap, Clock, CheckCircle2, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "http://localhost:3001/api";

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  });
};

interface CraLine {
  id: number; projectName: string; consultant: string;
  date: string; hours: number; rate: number; amount: number;
}
interface Stats { totalMonth: number; alreadyInvoiced: number; month: string; }

export function AutoInvoicing() {
  const [lines, setLines] = useState<CraLine[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      const [linesRes, statsRes] = await Promise.all([
        authFetch(BASE_URL + '/facturation/pending'),
        authFetch(BASE_URL + '/facturation/stats'),
      ]);
      if (!linesRes.ok) throw new Error('Auth error');
      setLines(await linesRes.json());
      setStats(await statsRes.json());
    } catch {
      toast.error("Erreur lors du chargement — vérifiez votre connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectedData  = lines.filter(l => selected.includes(l.id));
  const totalHours    = selectedData.reduce((s, l) => s + l.hours, 0);
  const totalAmount   = selectedData.reduce((s, l) => s + l.amount, 0);
  const pendingAmount = lines.filter(l => !selected.includes(l.id)).reduce((s, l) => s + l.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const handleGenerate = async () => {
    if (selected.length === 0) { toast.error('Sélectionnez au moins une ligne'); return; }
    setGenerating(true);
    try {
      const res = await authFetch(BASE_URL + '/facturation/generate', {
        method: 'POST',
        body: JSON.stringify({ craLineIds: selected }),
      });
      const data = await res.json();
      toast.success(data.invoiceCount + ' facture(s) générée(s) avec succès !');
      setSelected([]);
      await loadData();
    } catch {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturation Automatique</h1>
          <p className="text-muted-foreground mt-1">Génération automatique de factures depuis les CRA validés</p>
        </div>
        <Button onClick={handleGenerate} disabled={selected.length === 0 || generating}
          className="bg-blue-600 hover:bg-blue-700">
          <Zap className="w-4 h-4 mr-2" />
          {generating ? 'Génération...' : 'Générer Factures (' + selected.length + ')'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">À Facturer</CardTitle><Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{lines.filter(l => !selected.includes(l.id)).length} ligne(s) en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sélectionné</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{fmt(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalHours}h sélectionnées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Déjà Facturé</CardTitle><FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fmt(stats?.alreadyInvoiced ?? 0)}</div>
            <p className="text-xs text-green-600 mt-1">Ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Mois</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(stats?.totalMonth ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.month}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heures Facturables</CardTitle>
          <CardDescription>{lines.length} ligne(s) de CRA validées prêtes à être facturées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lines.map(line => (
              <div key={line.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggle(line.id)}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={selected.includes(line.id)} onChange={() => {}} className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{line.projectName}</div>
                    <div className="text-sm text-muted-foreground">{line.consultant} · {line.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{fmt(line.amount)}</div>
                  <Badge variant="outline">{line.hours}h × {fmt(line.rate)}</Badge>
                </div>
              </div>
            ))}
            {lines.length === 0 && <div className="text-center py-8 text-muted-foreground">Aucune ligne à facturer</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}