import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

export function PaymentManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiClient.markInvoiceAsPaid(id);
      toast.success("Facture marquée comme payée !");
      await loadInvoices();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la mise à jour");
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalExpected = invoices.reduce((s, i) => s + (i.amountTTC || 0), 0);
  const totalReceived = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amountTTC || 0), 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + (i.amountTTC || 0), 0);
  const totalOverdue = invoices.filter(i => {
    return i.status !== "paid" && i.status !== "cancelled" && new Date(i.dueDate) < new Date();
  }).reduce((s, i) => s + (i.amountTTC || 0), 0);

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status !== "paid" && status !== "cancelled" && new Date(dueDate) < new Date();
    if (isOverdue) return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />En retard</Badge>;
    if (status === "paid") return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payé</Badge>;
    if (status === "pending") return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    if (status === "validated") return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Validée</Badge>;
    return <Badge>{status}</Badge>;
  };

  const daysOverdue = (dueDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `Retard: ${days} jours` : null;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Paiements</h1>
          <p className="text-muted-foreground mt-1">Suivez vos encaissements et échéances</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total attendu", value: totalExpected, color: "" },
          { label: "Encaissé", value: totalReceived, color: "text-green-600", sub: `${totalExpected > 0 ? ((totalReceived / totalExpected) * 100).toFixed(0) : 0}% du total` },
          { label: "En attente", value: totalPending, color: "text-yellow-600" },
          { label: "En retard", value: totalOverdue, color: "text-red-600" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl ${kpi.color}`}>{kpi.value.toLocaleString()} €</div>
              {kpi.sub && <p className="text-xs text-muted-foreground">{kpi.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher par facture ou client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune facture trouvée</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date d&apos;échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(inv => {
                  const overdue = daysOverdue(inv.dueDate);
                  return (
                    <TableRow key={inv._id}>
                      <TableCell className="font-medium">{inv.number}</TableCell>
                      <TableCell>{inv.client}</TableCell>
                      <TableCell>{(inv.amountTTC || 0).toLocaleString()} €</TableCell>
                      <TableCell>
                        <div>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("fr-FR") : "-"}</div>
                        {overdue && <div className="text-xs text-red-500">{overdue}</div>}
                      </TableCell>
                      <TableCell>{getStatusBadge(inv.status, inv.dueDate)}</TableCell>
                      <TableCell>
                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(inv._id)}>
                            <CreditCard className="w-3 h-3 mr-1" />
                            Marquer comme payé
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}