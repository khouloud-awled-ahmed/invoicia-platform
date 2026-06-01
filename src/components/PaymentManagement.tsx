import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";

interface Payment {
  id: string;
  invoiceId: string;
  client: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "overdue" | "partial";
  paymentMethod?: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    invoiceId: "INV-001",
    client: "Entreprise ABC",
    amount: 2450,
    dueDate: new Date(2025, 10, 22),
    paidDate: new Date(2025, 10, 20),
    status: "paid",
    paymentMethod: "Virement",
  },
  {
    id: "2",
    invoiceId: "INV-002",
    client: "Société XYZ",
    amount: 3200,
    dueDate: new Date(2025, 10, 21),
    status: "pending",
  },
  {
    id: "3",
    invoiceId: "INV-003",
    client: "Client Beta",
    amount: 1800,
    dueDate: new Date(2025, 10, 19),
    paidDate: new Date(2025, 10, 18),
    status: "paid",
    paymentMethod: "Chèque",
  },
  {
    id: "4",
    invoiceId: "INV-004",
    client: "Start-up Gamma",
    amount: 4500,
    dueDate: new Date(2025, 10, 11),
    status: "overdue",
  },
  {
    id: "5",
    invoiceId: "INV-005",
    client: "Entreprise Delta",
    amount: 2100,
    dueDate: new Date(2025, 10, 17),
    paidDate: new Date(2025, 10, 16),
    status: "paid",
    paymentMethod: "Virement",
  },
  {
    id: "6",
    invoiceId: "INV-006",
    client: "Société Alpha",
    amount: 5600,
    dueDate: new Date(2025, 10, 16),
    status: "partial",
    paymentMethod: "Virement",
  },
];

export function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payments, setPayments] = useState<Payment[]>(mockPayments); // ✅ FIX: added setPayments

  // ✅ FIX: added markAsPaid function
  const markAsPaid = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: "paid", paidDate: new Date() }
          : p
      )
    );
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Payment["status"]) => {
    const config = {
      paid: { label: "Payé", className: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      overdue: { label: "En retard", className: "bg-red-100 text-red-800", icon: AlertCircle },
      partial: { label: "Partiel", className: "bg-blue-100 text-blue-800", icon: CreditCard },
    };
    const { label, className, icon: Icon } = config[status];
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Paiements</h1>
          <p className="text-muted-foreground">Suivez vos encaissements et échéances</p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Enregistrer un paiement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total attendu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalExpected.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Encaissé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalReceived.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              {totalExpected > 0 ? ((totalReceived / totalExpected) * 100).toFixed(0) : 0}% du total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{totalPending.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{totalOverdue.toLocaleString()} €</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par facture ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="partial">Partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date d'échéance</TableHead>
                <TableHead>Date de paiement</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => {
                const daysUntilDue = getDaysUntilDue(payment.dueDate);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.invoiceId}</TableCell>
                    <TableCell>{payment.client}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()} €</TableCell>
                    <TableCell>
                      <div>
                        {payment.dueDate.toLocaleDateString('fr-FR')}
                        {payment.status === "pending" && daysUntilDue >= 0 && (
                          <div className="text-xs text-muted-foreground">
                            Dans {daysUntilDue} jour{daysUntilDue > 1 ? 's' : ''}
                          </div>
                        )}
                        {payment.status === "overdue" && (
                          <div className="text-xs text-red-600">
                            Retard: {Math.abs(daysUntilDue)} jour{Math.abs(daysUntilDue) > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.paidDate ? payment.paidDate.toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>
                      {payment.paymentMethod ? (
                        <Badge variant="outline">{payment.paymentMethod}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      {payment.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPaid(payment.id)} // ✅ FIX: added onClick
                        >
                          Marquer comme payé
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun paiement trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}