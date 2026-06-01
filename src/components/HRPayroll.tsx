import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileText, Download, Plus, Euro, TrendingUp, Users, Calculator, Eye } from "lucide-react";
import apiClient from "@/lib/api-client-backend";

interface Bulletin {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  salaireBrut: number;
  cnss: number;
  irpp: number;
  autresRetenues: number;
  salaireNet: number;
  status: "draft" | "validated" | "paid";
}

interface HRPayrollProps {
  employees: any[];
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const calculatePayroll = (salaireBrut: number) => {
  const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
  const salaireBrutImposable = salaireBrut - cnss;
  let irpp = 0;
  const annualSalary = salaireBrutImposable * 12;
  if (annualSalary <= 5000) irpp = 0;
  else if (annualSalary <= 20000) irpp = (annualSalary - 5000) * 0.26 / 12;
  else if (annualSalary <= 30000) irpp = (15000 * 0.26 + (annualSalary - 20000) * 0.28) / 12;
  else if (annualSalary <= 50000) irpp = (15000 * 0.26 + 10000 * 0.28 + (annualSalary - 30000) * 0.32) / 12;
  else irpp = (15000 * 0.26 + 10000 * 0.28 + 20000 * 0.32 + (annualSalary - 50000) * 0.35) / 12;
  irpp = Math.round(irpp * 100) / 100;
  const salaireNet = Math.round((salaireBrut - cnss - irpp) * 100) / 100;
  return { cnss, irpp, salaireNet };
};

export function HRPayroll({ employees }: HRPayrollProps) {
  const currentDate = new Date();
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(String(currentDate.getFullYear()));
  const [form, setForm] = useState({
    employeeId: "",
    month: String(currentDate.getMonth() + 1),
    year: String(currentDate.getFullYear()),
    salaireBrut: "",
    autresRetenues: "0",
  });

  useEffect(() => {
    apiClient.request<any[]>("/payroll/bulletins")
      .then(data => setBulletins(data.map((b: any) => ({
        id: b._id || b.id,
        employeeId: b.employeeId,
        employeeName: b.employeeName,
        month: b.month,
        year: b.year,
        salaireBrut: b.salaireBrut,
        cnss: b.cnss,
        irpp: b.irpp,
        autresRetenues: b.autresRetenues || 0,
        salaireNet: b.salaireNet,
        status: b.status,
      }))))
      .catch(() => {});
  }, []);

  const preview = form.salaireBrut ? calculatePayroll(parseFloat(form.salaireBrut)) : null;

  const handleSubmit = async () => {
    if (!form.employeeId || !form.salaireBrut) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const salaireBrut = parseFloat(form.salaireBrut);
    const autresRetenues = parseFloat(form.autresRetenues) || 0;
    const { cnss, irpp, salaireNet } = calculatePayroll(salaireBrut);
    const emp = employees.find((e: any) => (e.id || e._id) === form.employeeId);
    const payload = {
      employeeId: form.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : form.employeeId,
      month: parseInt(form.month),
      year: parseInt(form.year),
      salaireBrut,
      cnss,
      irpp,
      autresRetenues,
      salaireNet: Math.round((salaireNet - autresRetenues) * 100) / 100,
      status: "draft",
    };
    try {
      const created = await apiClient.request<any>("/payroll/bulletins", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setBulletins(prev => [{ ...payload, id: created._id || created.id || Date.now().toString() }, ...prev]);
    } catch {
      setBulletins(prev => [{ ...payload, id: Date.now().toString() }, ...prev]);
    }
    toast.success("Bulletin de paie généré avec succès !");
    setShowDialog(false);
    setForm({ employeeId: "", month: String(currentDate.getMonth() + 1), year: String(currentDate.getFullYear()), salaireBrut: "", autresRetenues: "0" });
  };

  const handleValidate = async (id: string) => {
    try { await apiClient.request(`/payroll/bulletins/${id}/validate`, { method: "PATCH" }); } catch {}
    setBulletins(prev => prev.map(b => b.id === id ? { ...b, status: "validated" } : b));
    toast.success("Bulletin validé !");
  };

  const handleMarkPaid = async (id: string) => {
    try { await apiClient.request(`/payroll/bulletins/${id}/pay`, { method: "PATCH" }); } catch {}
    setBulletins(prev => prev.map(b => b.id === id ? { ...b, status: "paid" } : b));
    toast.success("Bulletin marqué comme payé !");
  };

  const filtered = bulletins.filter(b => {
    const matchMonth = filterMonth === "all" || b.month === parseInt(filterMonth);
    const matchYear = b.year === parseInt(filterYear);
    return matchMonth && matchYear;
  });

  const totalMasseSalariale = filtered.reduce((s, b) => s + b.salaireBrut, 0);
  const totalNet = filtered.reduce((s, b) => s + b.salaireNet, 0);
  const totalCNSS = filtered.reduce((s, b) => s + b.cnss, 0);
  const totalIRPP = filtered.reduce((s, b) => s + b.irpp, 0);
  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

  const getStatusBadge = (status: string) => {
    if (status === "paid") return <Badge className="bg-green-100 text-green-700">Payé</Badge>;
    if (status === "validated") return <Badge className="bg-blue-100 text-blue-700">Validé</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Brouillon</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion de la Paie</h2>
          <p className="text-sm text-muted-foreground">Bulletins de paie, CNSS, IRPP</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouveau Bulletin
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les mois</SelectItem>
            {MONTHS.map((m, i) => (<SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" />Bulletins</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{filtered.length}</div><p className="text-xs text-muted-foreground">Ce mois</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" />Masse Salariale</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">{totalMasseSalariale.toLocaleString("fr-FR")} €</div><p className="text-xs text-muted-foreground">Brut total</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Euro className="w-4 h-4" />Net à Payer</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{totalNet.toLocaleString("fr-FR")} €</div><p className="text-xs text-muted-foreground">Net total</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calculator className="w-4 h-4" />Cotisations</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{(totalCNSS + totalIRPP).toLocaleString("fr-FR")} €</div><p className="text-xs text-muted-foreground">CNSS + IRPP</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Bulletins de Paie</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Collaborateur</TableHead><TableHead>Période</TableHead>
                <TableHead className="text-right">Brut</TableHead><TableHead className="text-right">CNSS</TableHead>
                <TableHead className="text-right">IRPP</TableHead><TableHead className="text-right">Net</TableHead>
                <TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucun bulletin de paie</p>
                    <p className="text-xs mt-1">Cliquez sur "Nouveau Bulletin" pour en créer un</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.employeeName}</TableCell>
                    <TableCell>{MONTHS[b.month - 1]} {b.year}</TableCell>
                    <TableCell className="text-right">{b.salaireBrut.toLocaleString("fr-FR")} €</TableCell>
                    <TableCell className="text-right text-red-600">-{b.cnss.toLocaleString("fr-FR")} €</TableCell>
                    <TableCell className="text-right text-orange-600">-{b.irpp.toLocaleString("fr-FR")} €</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{b.salaireNet.toLocaleString("fr-FR")} €</TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedBulletin(b); setShowDetailDialog(true); }}><Eye className="w-3 h-3" /></Button>
                        {b.status === "draft" && (<Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => handleValidate(b.id)}>Valider</Button>)}
                        {b.status === "validated" && (<Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => handleMarkPaid(b.id)}>Marquer Payé</Button>)}
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
            <DialogTitle>Nouveau Bulletin de Paie</DialogTitle>
            <DialogDescription>Générer un bulletin pour un collaborateur</DialogDescription>
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
                      <SelectItem key={e.id || e._id} value={e.id || e._id}>{e.firstName} {e.lastName}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mois *</Label>
                <Select value={form.month} onValueChange={v => setForm({ ...form, month: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => (<SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Année *</Label>
                <Select value={form.year} onValueChange={v => setForm({ ...form, year: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{years.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Salaire Brut (€) *</Label>
              <Input type="number" placeholder="ex: 2500" value={form.salaireBrut} onChange={e => setForm({ ...form, salaireBrut: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Autres Retenues (€)</Label>
              <Input type="number" placeholder="0" value={form.autresRetenues} onChange={e => setForm({ ...form, autresRetenues: e.target.value })} />
            </div>
            {preview && form.salaireBrut && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-2 text-sm">
                <p className="font-semibold text-blue-800">Calcul automatique (Tunisie)</p>
                <div className="flex justify-between"><span className="text-gray-600">Salaire Brut</span><span className="font-medium">{parseFloat(form.salaireBrut).toLocaleString("fr-FR")} €</span></div>
                <div className="flex justify-between"><span className="text-red-600">CNSS (9.18%)</span><span className="font-medium text-red-600">-{preview.cnss.toLocaleString("fr-FR")} €</span></div>
                <div className="flex justify-between"><span className="text-orange-600">IRPP</span><span className="font-medium text-orange-600">-{preview.irpp.toLocaleString("fr-FR")} €</span></div>
                {parseFloat(form.autresRetenues) > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Autres retenues</span><span className="font-medium">-{parseFloat(form.autresRetenues).toLocaleString("fr-FR")} €</span></div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                  <span>Net à Payer</span>
                  <span>{(preview.salaireNet - (parseFloat(form.autresRetenues) || 0)).toLocaleString("fr-FR")} €</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Générer le bulletin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulletin de Paie</DialogTitle>
            <DialogDescription>{selectedBulletin && `${MONTHS[selectedBulletin.month - 1]} ${selectedBulletin.year}`}</DialogDescription>
          </DialogHeader>
          {selectedBulletin && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-lg">{selectedBulletin.employeeName}</p>
                <p className="text-sm text-muted-foreground">{MONTHS[selectedBulletin.month - 1]} {selectedBulletin.year}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Salaire Brut</span><span className="font-medium">{selectedBulletin.salaireBrut.toLocaleString("fr-FR")} €</span></div>
                <div className="flex justify-between py-1 border-b text-red-600"><span>CNSS (9.18%)</span><span>-{selectedBulletin.cnss.toLocaleString("fr-FR")} €</span></div>
                <div className="flex justify-between py-1 border-b text-orange-600"><span>IRPP</span><span>-{selectedBulletin.irpp.toLocaleString("fr-FR")} €</span></div>
                {selectedBulletin.autresRetenues > 0 && (
                  <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Autres retenues</span><span>-{selectedBulletin.autresRetenues.toLocaleString("fr-FR")} €</span></div>
                )}
                <div className="flex justify-between py-2 font-bold text-green-700 text-base"><span>Net à Payer</span><span>{selectedBulletin.salaireNet.toLocaleString("fr-FR")} €</span></div>
              </div>
              <div className="flex justify-between items-center">
                {getStatusBadge(selectedBulletin.status)}
                <Button size="sm" variant="outline" onClick={() => toast.info("Export PDF bientôt disponible")}><Download className="w-3 h-3 mr-1" />Télécharger PDF</Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

