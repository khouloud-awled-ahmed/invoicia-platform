import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, AlertCircle, CheckCircle, Clock, CreditCard, Mail, Sparkles, Loader2, Copy } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

export function PaymentManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [reminderSubject, setReminderSubject] = useState("");
  const [reminderBody, setReminderBody] = useState("");
  const [reminderInvoice, setReminderInvoice] = useState<any>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

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

  const handleRegisterPayment = async () => {
    try {
      if (!selectedInvoiceId) throw new Error("Choisir une facture");
      await apiClient.markInvoiceAsPaid(selectedInvoiceId);
      toast.success("Paiement enregistré !");
      setShowModal(false);
      await loadInvoices();
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiClient.markInvoiceAsPaid(id);
      toast.success("Facture marquée comme payée !");
      await loadInvoices();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleGenerateReminder = async (inv: any) => {
    setReminderInvoice(inv);
    setShowReminderDialog(true);
    setIsGeneratingReminder(true);
    setReminderSubject("");
    setReminderBody("");
    try {
      const overdueDays = Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      const result = await apiClient.generatePaymentReminder({
        clientName: inv.client || "Client",
        invoiceNumber: inv.number || "",
        amountTTC: inv.amountTTC || 0,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("fr-FR") : "",
        daysOverdue: overdueDays > 0 ? overdueDays : 0,
      });
      setReminderSubject(result.subject || "");
      setReminderBody(result.body || "");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la génération de la relance");
      setShowReminderDialog(false);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const handleSendReminder = async () => {
    if (!reminderInvoice?.clientEmail) {
      toast.error("Aucun email client trouvé pour cette facture");
      return;
    }
    setIsSendingReminder(true);
    try {
      await apiClient.sendPaymentReminder({
        clientEmail: reminderInvoice.clientEmail,
        subject: reminderSubject,
        body: reminderBody,
      });
      toast.success(`Email envoyé à ${reminderInvoice.clientEmail} !`);
      setShowReminderDialog(false);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'envoi de l'email");
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleCopyReminder = async () => {
    const text = `Objet: ${reminderSubject}\n\n${reminderBody}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success("Email copié dans le presse-papiers !");
      } else {
        throw new Error("Clipboard API indisponible");
      }
    } catch (err) {
      // Fallback pour navigateurs/contextes restreints
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success("Email copié dans le presse-papiers !");
      } catch (fallbackErr) {
        toast.error("Impossible de copier automatiquement. Sélectionnez et copiez le texte manuellement.");
      }
      document.body.removeChild(textarea);
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
        <Button className="flex items-center gap-2" onClick={() => setShowModal(true)}>
          <CreditCard className="w-4 h-4" />
          Enregistrer un paiement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total attendu</p><p className="text-2xl font-bold">{totalExpected.toLocaleString()} €</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Encaissé</p><p className="text-2xl font-bold text-green-600">{totalReceived.toLocaleString()} €</p><p className="text-xs text-muted-foreground">{totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0}% du total</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">En attente</p><p className="text-2xl font-bold text-yellow-600">{totalPending.toLocaleString()} €</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">En retard</p><p className="text-2xl font-bold text-red-600">{totalOverdue.toLocaleString()} €</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par facture ou client..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validée</SelectItem>
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
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => {
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
                        <div className="flex gap-2">
                          {inv.status !== "paid" && inv.status !== "cancelled" && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(inv._id)}>
                              <CreditCard className="w-3 h-3 mr-1" />
                              Marquer comme payé
                            </Button>
                          )}
                          {overdue && inv.status !== "paid" && inv.status !== "cancelled" && (
                            <Button size="sm" variant="outline" className="text-orange-600 border-orange-300" onClick={() => handleGenerateReminder(inv)}>
                              <Sparkles className="w-3 h-3 mr-1" />
                              Relance IA
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              Relance de paiement générée par IA
            </DialogTitle>
            <DialogDescription>
              {reminderInvoice && `Facture ${reminderInvoice.number} - ${reminderInvoice.client || "Client"}`}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingReminder ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              <span className="text-sm text-muted-foreground">Génération de l'email en cours...</span>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Objet</Label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={reminderSubject}
                  onChange={(e) => setReminderSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Corps de l'email</Label>
                <Textarea
                  rows={10}
                  value={reminderBody}
                  onChange={(e) => setReminderBody(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Fermer</Button>
            {!isGeneratingReminder && (
              <>
                <Button variant="outline" onClick={handleCopyReminder}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
                <Button onClick={handleSendReminder} disabled={isSendingReminder} className="bg-orange-600 hover:bg-orange-700">
                  {isSendingReminder ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" />Envoyer au client</>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Enregistrer un paiement</h2>
            <select className="w-full border rounded-lg p-2" value={selectedInvoiceId} onChange={e => setSelectedInvoiceId(e.target.value)}>
              <option value="">-- Choisir une facture --</option>
              {invoices.map(i => (
                <option key={i._id} value={i._id}>{i.number} - {i.client} - {(i.amountTTC||0).toLocaleString()} €</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleRegisterPayment}><CreditCard className="w-4 h-4 mr-2" />Confirmer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}