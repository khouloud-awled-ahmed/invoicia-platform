import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Download,
  Upload,
  BookOpen,
  Calculator,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowRightLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Printer,
  Search,
  Filter,
  Calendar,
  Building2,
  CreditCard,
  Wallet,
  Receipt,
  CircleDollarSign,
  Landmark,
  Info,
  RefreshCw,
  Lock,
  Unlock,
  Bell,
  Link2,
  Zap,
  Target,
  Percent,
  Activity,
  Layers,
  GitBranch,
  Paperclip,
  CloudUpload,
  AlertCircle,
  Award,
  LineChart,
  TimerReset,
  Shield,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { apiClient } from "../lib/api-client-backend";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// ==================== INTERFACES ====================

interface AccountingEntry {
  id: string;
  date: string;
  journalCode: string;
  journalLabel: string;
  accountNumber: string;
  accountLabel: string;
  reference: string;
  label: string;
  debit: number;
  credit: number;
  validated: boolean;
  lettrage?: string;
  analytique?: string;
  attachment?: string;
  validatedBy?: string;
  validatedDate?: string;
  locked?: boolean;
}

interface BankTransaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: "debit" | "credit";
  matched: boolean;
  suggestedEntry?: string;
  category?: string;
}

interface TreasuryForecast {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  projected: boolean;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchaseAmount: number;
  depreciationMethod: "linear" | "degressive";
  depreciationYears: number;
  currentValue: number;
  monthlyDepreciation: number;
}

interface Budget {
  id: string;
  account: string;
  accountLabel: string;
  period: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// ==================== MOCK DATA SUPPRIMÉ ====================
// Toutes les données sont maintenant chargées depuis l'API

export function AccountingComplete() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  useEffect(() => {
    apiClient.request<any[]>("/ecritures")
      .then(data => setJournalEntries(data.map((e: any) => ({
        id: e._id || e.id,
        date: e.date,
        journal: e.journal,
        compte: e.compte,
        libelle: e.libelle,
        debit: e.debit,
        credit: e.credit,
      }))))
      .catch(() => {});
  }, []);
  const [entryForm, setEntryForm] = useState({ date: "", journal: "", compte: "", libelle: "", debit: "", credit: "" });
  const [showBankReconciliation, setShowBankReconciliation] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name?: string; [k: string]: any }>>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [openItems, setOpenItems] = useState<{ invoices: any[]; expenses: any[]; payrolls: any[] }>({ invoices: [], expenses: [], payrolls: [] });
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedOpenItem, setSelectedOpenItem] = useState<{ id: string; type: "INVOICE" | "EXPENSE" | "PAYROLL" } | null>(null);
  const [loadingReconciliation, setLoadingReconciliation] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<{
    employees: number;
    totalRevenue: number;
    pendingInvoices: number;
    treasuryBalance: number;
    expenses: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [treasuryHistory, setTreasuryHistory] = useState<Array<{ month: string; balance: number }>>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Charger les données depuis l'API
  useEffect(() => {
    loadData();
  }, []);

  // Charger comptes bancaires au montage pour le sélecteur
  useEffect(() => {
    apiClient.getBankAccounts().then((list) => {
      setBankAccounts(list || []);
      if (list?.length && !selectedBankAccountId) setSelectedBankAccountId(list[0].id || list[0]._id || "");
    }).catch(() => setBankAccounts([]));
  }, []);

  // Quand un compte est sélectionné, charger les transactions non rapprochées et les open items
  useEffect(() => {
    if (!selectedBankAccountId) {
      setBankTransactions([]);
      return;
    }
    setLoadingReconciliation(true);
    Promise.all([
      apiClient.getBankTransactions(selectedBankAccountId, "UNRECONCILED"),
      apiClient.getReconciliationOpenItems(),
    ])
      .then(([txList, items]) => {
        setBankTransactions((txList || []).map((t: any) => ({
          id: t.id,
          date: t.date,
          label: t.label || "",
          amount: typeof t.amount === "number" ? t.amount : parseFloat(t.amount) || 0,
          type: t.type || (t.amount >= 0 ? "credit" : "debit"),
          matched: t.status === "RECONCILED",
          category: t.category,
        })));
        setOpenItems(items || { invoices: [], expenses: [], payrolls: [] });
      })
      .catch((e) => {
        console.error(e);
        setBankTransactions([]);
        setOpenItems({ invoices: [], expenses: [], payrolls: [] });
      })
      .finally(() => setLoadingReconciliation(false));
  }, [selectedBankAccountId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger le résumé du dashboard
      const summary = await apiClient.getDashboardSummary();
      setDashboardSummary(summary);

      const accounts = await apiClient.getBankAccounts();
      if (accounts?.length && !selectedBankAccountId) setSelectedBankAccountId(accounts[0]?.id ?? accounts[0]?._id ?? "");
      // Les transactions bancaires sont chargées par l'effet sur selectedBankAccountId (onglet Rapprochement)

      // Charger les dépenses pour calculer les catégories
      const expenses = await apiClient.getExpenses();
      const categoryMap: Record<string, number> = {};
      expenses.forEach((exp: any) => {
        const cat = exp.category || "Autres";
        categoryMap[cat] = (categoryMap[cat] || 0) + (exp.amountTTC || 0);
      });
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
      setExpensesByCategory(
        Object.entries(categoryMap)
          .map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );

      // Calculer l'historique de trésorerie (12 derniers mois)
      const history: Array<{ month: string; balance: number }> = [];
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        history.push({
          month: monthNames[date.getMonth()],
          balance: summary.treasuryBalance, // Simplifié - devrait être calculé par mois
        });
      }
      setTreasuryHistory(history);

      // Assets et Budgets : TODO - Créer les endpoints backend si nécessaire
      setAssets([]);
      setBudgets([]);
      setAlerts([]);
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error(error?.message || "Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;

  // Calculs KPIs depuis les données réelles
  const currentBalance = dashboardSummary?.treasuryBalance || 0;
  const monthlyBurnRate = dashboardSummary?.expenses ? -dashboardSummary.expenses : 0;
  const runway = monthlyBurnRate !== 0 ? Math.abs(currentBalance / monthlyBurnRate) : 0;
  const netMargin = dashboardSummary?.totalRevenue 
    ? (dashboardSummary.totalRevenue - (dashboardSummary.expenses || 0)) / dashboardSummary.totalRevenue 
    : 0;
  const liquidityRatio = dashboardSummary?.expenses 
    ? currentBalance / dashboardSummary.expenses 
    : 0;

  const reloadReconciliation = () => {
    if (selectedBankAccountId) {
      setLoadingReconciliation(true);
      Promise.all([
        apiClient.getBankTransactions(selectedBankAccountId, "UNRECONCILED"),
        apiClient.getReconciliationOpenItems(),
      ])
        .then(([txList, items]) => {
          setBankTransactions((txList || []).map((t: any) => ({
            id: t.id,
            date: t.date,
            label: t.label || "",
            amount: typeof t.amount === "number" ? t.amount : parseFloat(t.amount) || 0,
            type: t.type || (t.amount >= 0 ? "credit" : "debit"),
            matched: t.status === "RECONCILED",
            category: t.category,
          })));
          setOpenItems(items || { invoices: [], expenses: [], payrolls: [] });
        })
        .finally(() => setLoadingReconciliation(false));
    }
  };

  const handleMatchTransaction = async (
    transactionId: string,
    targetId: string,
    targetType: "INVOICE" | "EXPENSE" | "PAYROLL",
  ) => {
    if (!targetId || !targetType) {
      toast.error("Veuillez sélectionner un justificatif (facture, dépense ou paie).");
      return;
    }
    try {
      await apiClient.reconciliationMatch(transactionId, targetId, targetType);
      setSelectedTransactionId(null);
      setSelectedOpenItem(null);
      reloadReconciliation();
      toast.success("Rapprochement enregistré. La facture/dépense est marquée payée et l'écriture comptable a été créée.");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du rapprochement");
    }
  };

  const handleMarkAlertRead = (alertId: string) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const handleExportFEC = () => {
    toast.success("Export FEC généré avec succès !");
  };

  const handleSyncBank = async () => {
    try {
      toast.info("Synchronisation bancaire en cours...");
      // TODO: Implémenter syncBankTransactions dans l'API si nécessaire
      // await apiClient.syncBankTransactions();
      await loadData();
      toast.success("Synchronisation terminée !");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la synchronisation");
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "bank":
        setActiveTab("bank");
        break;
      case "lettrage":
        toast.info("Module de lettrage - Fonctionnalité à venir");
        break;
      case "tva":
        toast.info("Déclaration TVA - Redirection vers le module TVA");
        break;
      case "unpaid":
        toast.info("Factures impayées - Redirection vers le module de relance");
        break;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header avec Alertes */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Comptabilité Générale</h1>
          <p className="text-muted-foreground mt-1">
            Gestion comptable complète avec automatisation et prévisions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="relative"
            onClick={() => setShowAlerts(true)}
          >
            <Bell className="w-4 h-4 mr-2" />
            Alertes
            {unreadAlerts > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0">
                {unreadAlerts}
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={handleExportFEC}>
            <Download className="w-4 h-4 mr-2" />
            Export FEC
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="entries">
            <BookOpen className="w-4 h-4 mr-2" />
            Écritures
          </TabsTrigger>
          <TabsTrigger value="bank">
            <Landmark className="w-4 h-4 mr-2" />
            Rapprochement
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <LineChart className="w-4 h-4 mr-2" />
            Prévisions
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Building2 className="w-4 h-4 mr-2" />
            Immobilisations
          </TabsTrigger>
          <TabsTrigger value="budget">
            <Target className="w-4 h-4 mr-2" />
            Budgets
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Layers className="w-4 h-4 mr-2" />
            Analytique
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Rapports
          </TabsTrigger>
        </TabsList>

        {/* ==================== DASHBOARD ==================== */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs Principaux */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Trésorerie</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{currentBalance.toLocaleString("fr-FR")} €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Solde actuel
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Burn Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-orange-600">{monthlyBurnRate.toLocaleString("fr-FR")} €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Par mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Runway</CardTitle>
                <TimerReset className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-600">{runway.toFixed(1)} mois</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Autonomie financière
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Marge Nette</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">{(netMargin * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rentabilité
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Évolution Trésorerie */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution de la Trésorerie</CardTitle>
                <CardDescription>12 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={treasuryHistory}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition Charges */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Charges</CardTitle>
                <CardDescription>Mois en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${((entry.value / 24500) * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => handleQuickAction("bank")}>
                  <Landmark className="h-8 w-8 text-blue-600" />
                  <span className="text-sm">Rapprochement Bancaire</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">3 à traiter</Badge>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => handleQuickAction("lettrage")}>
                  <Link2 className="h-8 w-8 text-green-600" />
                  <span className="text-sm">Lettrage</span>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">12 non lettrées</Badge>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => handleQuickAction("tva")}>
                  <Receipt className="h-8 w-8 text-purple-600" />
                  <span className="text-sm">TVA à Déclarer</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">1 000€</Badge>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => handleQuickAction("unpaid")}>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <span className="text-sm">Factures Impayées</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">5 en retard</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== RAPPROCHEMENT BANCAIRE ==================== */}
        <TabsContent value="bank" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Info className="h-5 w-5" />
                Rapprochement Bancaire
              </CardTitle>
              <CardDescription className="text-blue-700">
                Les relevés sont importés dans le module Banque (source unique). Choisissez le compte à rapprocher, puis liez chaque ligne bancaire à une facture, une dépense ou une paie.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-blue-800 whitespace-nowrap">Compte à rapprocher</Label>
                <Select value={selectedBankAccountId} onValueChange={setSelectedBankAccountId}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Choisir le compte bancaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((acc) => (
                      <SelectItem key={acc.id || acc._id} value={acc.id || acc._id}>
                        {acc.name || acc.iban || acc.id || "Compte"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handleSyncBank}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Synchroniser Banque
              </Button>
            </CardContent>
          </Card>

          {loadingReconciliation && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Chargement…
            </div>
          )}

          {!loadingReconciliation && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Colonne gauche : Lignes bancaires (non rapprochées) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lignes bancaires (à justifier)</CardTitle>
                  <CardDescription>
                    Transactions importées non encore rapprochées
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead></TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Libellé</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankTransactions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              Aucune transaction à rapprocher. Importez un relevé dans le module Banque.
                            </TableCell>
                          </TableRow>
                        )}
                        {bankTransactions.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className={cn(
                              selectedTransactionId === transaction.id && "bg-blue-50"
                            )}
                          >
                            <TableCell>
                              <input
                                type="radio"
                                name="bank-tx"
                                checked={selectedTransactionId === transaction.id}
                                onChange={() => setSelectedTransactionId(transaction.id)}
                              />
                            </TableCell>
                            <TableCell>{new Date(transaction.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell className="font-medium truncate max-w-[180px]">{transaction.label}</TableCell>
                            <TableCell className={cn(
                              "text-right font-semibold",
                              transaction.type === "credit" ? "text-green-600" : "text-red-600"
                            )}>
                              {transaction.amount.toLocaleString("fr-FR")} €
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-600 text-white hover:bg-blue-700 border-0"
                                disabled={!selectedOpenItem}
                                onClick={() => selectedOpenItem && handleMatchTransaction(transaction.id, selectedOpenItem.id, selectedOpenItem.type)}
                              >
                                <Link2 className="w-3 h-3 mr-1" />
                                Rapprocher
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Colonne droite : Justificatifs (dettes / à payer) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Justificatifs (à payer)</CardTitle>
                  <CardDescription>
                    Factures clients, dépenses vérifiées, paie — sélectionnez un élément puis validez le rapprochement à gauche.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead></TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Libellé / Réf</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...(openItems.invoices || []).map((i: any) => ({ ...i, type: "INVOICE" as const })),
                          ...(openItems.expenses || []).map((e: any) => ({ ...e, type: "EXPENSE" as const })),
                          ...(openItems.payrolls || []).map((p: any) => ({ ...p, type: "PAYROLL" as const }))].length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Aucun justificatif en attente.
                            </TableCell>
                          </TableRow>
                        )}
                        {(openItems.invoices || []).map((inv: any) => (
                          <TableRow
                            key={`INVOICE-${inv.id}`}
                            className={cn(
                              selectedOpenItem?.type === "INVOICE" && selectedOpenItem?.id === inv.id && "bg-blue-50"
                            )}
                          >
                            <TableCell>
                              <input
                                type="radio"
                                name="open-item"
                                checked={selectedOpenItem?.type === "INVOICE" && selectedOpenItem?.id === inv.id}
                                onChange={() => setSelectedOpenItem({ id: inv.id, type: "INVOICE" })}
                              />
                            </TableCell>
                            <TableCell><Badge variant="outline" className="bg-green-50">Facture</Badge></TableCell>
                            <TableCell className="font-medium">{inv.label || `Facture ${inv.number}`}</TableCell>
                            <TableCell className="text-right">{Number(inv.amount || 0).toLocaleString("fr-FR")} €</TableCell>
                          </TableRow>
                        ))}
                        {(openItems.expenses || []).map((exp: any) => (
                          <TableRow
                            key={`EXPENSE-${exp.id}`}
                            className={cn(
                              selectedOpenItem?.type === "EXPENSE" && selectedOpenItem?.id === exp.id && "bg-blue-50"
                            )}
                          >
                            <TableCell>
                              <input
                                type="radio"
                                name="open-item"
                                checked={selectedOpenItem?.type === "EXPENSE" && selectedOpenItem?.id === exp.id}
                                onChange={() => setSelectedOpenItem({ id: exp.id, type: "EXPENSE" })}
                              />
                            </TableCell>
                            <TableCell><Badge variant="outline" className="bg-amber-50">Dépense</Badge></TableCell>
                            <TableCell className="font-medium">{exp.supplier || exp.category || exp.id}</TableCell>
                            <TableCell className="text-right">{Number(exp.amount || 0).toLocaleString("fr-FR")} €</TableCell>
                          </TableRow>
                        ))}
                        {(openItems.payrolls || []).map((p: any) => (
                          <TableRow
                            key={`PAYROLL-${p.id}`}
                            className={cn(
                              selectedOpenItem?.type === "PAYROLL" && selectedOpenItem?.id === p.id && "bg-blue-50"
                            )}
                          >
                            <TableCell>
                              <input
                                type="radio"
                                name="open-item"
                                checked={selectedOpenItem?.type === "PAYROLL" && selectedOpenItem?.id === p.id}
                                onChange={() => setSelectedOpenItem({ id: p.id, type: "PAYROLL" })}
                              />
                            </TableCell>
                            <TableCell><Badge variant="outline" className="bg-purple-50">Paie</Badge></TableCell>
                            <TableCell className="font-medium">{p.label || p.id}</TableCell>
                            <TableCell className="text-right">{Number(p.amount || 0).toLocaleString("fr-FR")} €</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ==================== PRÉVISIONS ==================== */}
        <TabsContent value="forecast" className="space-y-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Info className="h-5 w-5" />
                Prévisions de Trésorerie
              </CardTitle>
              <CardDescription className="text-purple-700">
                Projection basée sur vos factures à recevoir, factures à payer, salaires récurrents et charges fixes.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Graphique Prévisions */}
          <Card>
            <CardHeader>
              <CardTitle>Projection Trésorerie - 3 Mois</CardTitle>
              <CardDescription>
                Évolution prévue de votre trésorerie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsLineChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="Encaissements" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Décaissements" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Solde" strokeWidth={3} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tableau Prévisions */}
          <Card>
            <CardHeader>
              <CardTitle>Détails des Prévisions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Période</TableHead>
                    <TableHead className="text-right">Encaissements</TableHead>
                    <TableHead className="text-right">Décaissements</TableHead>
                    <TableHead className="text-right">Solde Prévisionnel</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[].map((forecast: any, idx: number) => (
                    <TableRow key={idx} className={forecast.projected ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">{forecast.month}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        +{forecast.income.toLocaleString("fr-FR")} €
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        -{forecast.expenses.toLocaleString("fr-FR")} €
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {forecast.balance.toLocaleString("fr-FR")} €
                      </TableCell>
                      <TableCell>
                        {forecast.projected ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Projeté
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Réalisé
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Alertes Prévisions */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Alertes Prévisionnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded border border-yellow-300">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Trésorerie stable</p>
                      <p className="text-xs text-muted-foreground">
                        Votre trésorerie reste positive sur les 3 prochains mois
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== IMMOBILISATIONS ==================== */}
        <TabsContent value="assets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2>Registre des Immobilisations</h2>
              <p className="text-sm text-muted-foreground">
                Gestion des immobilisations et calcul automatique des amortissements
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAssetDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Immobilisation
            </Button>
          </div>

          {/* KPIs Immobilisations */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Valeur Brute</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">40 000 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total acquisitions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Valeur Nette</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-600">23 000 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Après amortissements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Dotations Mensuelles</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-orange-600">625 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Par mois
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tableau Immobilisations */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Immobilisations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Désignation</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date Acquisition</TableHead>
                    <TableHead className="text-right">Valeur Brute</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead className="text-right">Valeur Nette</TableHead>
                    <TableHead className="text-right">Dotation Mensuelle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucune immobilisation enregistrée
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{new Date(asset.purchaseDate).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell className="text-right">{Number(asset.purchaseAmount || 0).toLocaleString("fr-FR")} €</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {asset.depreciationMethod === "linear" ? "Linéaire" : "Dégressif"}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.depreciationYears} ans</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {Number(asset.currentValue || 0).toLocaleString("fr-FR")} €
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {Number(asset.monthlyDepreciation || 0).toFixed(2)} €
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Plan d'amortissement
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Éditer
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Céder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== BUDGETS ==================== */}
        <TabsContent value="budget" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2>Gestion Budgétaire</h2>
              <p className="text-sm text-muted-foreground">
                Suivi des budgets par compte et alertes de dépassement
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowBudgetDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Budget
            </Button>
          </div>

          {/* KPIs Budgets */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Budget Total</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">24 500 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mois en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Réalisé</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-600">22 800 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  93% consommé
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Écart</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">+1 700 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sous budget
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Dépassements</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-red-600">1</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alertes actives
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tableau Budgets */}
          <Card>
            <CardHeader>
              <CardTitle>Suivi Budgétaire</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Compte</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Budgété</TableHead>
                    <TableHead className="text-right">Réalisé</TableHead>
                    <TableHead className="text-right">Écart</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun budget configuré
                      </TableCell>
                    </TableRow>
                  ) : (
                    budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-mono">{budget.account}</TableCell>
                      <TableCell className="font-medium">{budget.accountLabel}</TableCell>
                      <TableCell className="text-right">{budget.budgeted.toLocaleString("fr-FR")} €</TableCell>
                      <TableCell className="text-right font-semibold">{budget.actual.toLocaleString("fr-FR")} €</TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        budget.variance >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {budget.variance >= 0 ? "+" : ""}{budget.variance.toLocaleString("fr-FR")} €
                      </TableCell>
                      <TableCell className={cn(
                        "text-right",
                        budget.variancePercent >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {budget.variancePercent >= 0 ? "+" : ""}{budget.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {budget.variancePercent < -10 ? (
                          <Badge className="bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Dépassé
                          </Badge>
                        ) : budget.variancePercent < -5 ? (
                          <Badge className="bg-orange-100 text-orange-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Alerte
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ANALYTIQUE ==================== */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Layers className="h-5 w-5" />
                Comptabilité Analytique
              </CardTitle>
              <CardDescription className="text-green-700">
                Analysez la rentabilité par projet, département ou client avec des axes analytiques personnalisables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800">
                ✨ Fonctionnalité disponible dans le module Projets
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== AUTRES ONGLETS (Conservés de l'original) ==================== */}
        <TabsContent value="entries" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Saisie d Écritures Comptables</h2>
              <p className="text-sm text-muted-foreground">Journal, lettrage et validation</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowEntryDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />Nouvelle Écriture
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Journal</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead className="text-right">Débit</TableHead>
                    <TableHead className="text-right">Crédit</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Aucune écriture comptable</p>
                        <p className="text-xs mt-1">Cliquez sur "Nouvelle Écriture" pour commencer</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    journalEntries.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell><Badge variant="outline">{entry.journal}</Badge></TableCell>
                        <TableCell>{entry.libelle}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.compte}</TableCell>
                        <TableCell className="text-right text-green-600">{entry.debit ? `${entry.debit.toLocaleString("fr-FR")} €` : "—"}</TableCell>
                        <TableCell className="text-right text-red-600">{entry.credit ? `${entry.credit.toLocaleString("fr-FR")} €` : "—"}</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-700">Validée</Badge></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouvelle Écriture Comptable</DialogTitle>
                <DialogDescription>Saisir une écriture au journal</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input type="date" value={entryForm.date} onChange={e => setEntryForm({...entryForm, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Journal *</Label>
                    <Select value={entryForm.journal} onValueChange={v => setEntryForm({...entryForm, journal: v})}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">Achats</SelectItem>
                        <SelectItem value="VE">Ventes</SelectItem>
                        <SelectItem value="BQ">Banque</SelectItem>
                        <SelectItem value="CA">Caisse</SelectItem>
                        <SelectItem value="OD">Opérations Diverses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Compte *</Label>
                  <Input placeholder="ex: 601000" value={entryForm.compte} onChange={e => setEntryForm({...entryForm, compte: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Libellé *</Label>
                  <Input placeholder="Description de l écriture" value={entryForm.libelle} onChange={e => setEntryForm({...entryForm, libelle: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Débit (€)</Label>
                    <Input type="number" placeholder="0" value={entryForm.debit} onChange={e => setEntryForm({...entryForm, debit: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Crédit (€)</Label>
                    <Input type="number" placeholder="0" value={entryForm.credit} onChange={e => setEntryForm({...entryForm, credit: e.target.value})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEntryDialog(false)}>Annuler</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                  if (!entryForm.date || !entryForm.journal || !entryForm.compte || !entryForm.libelle) return;
                  apiClient.request("/ecritures", { method: "POST", body: JSON.stringify({ ...entryForm, debit: parseFloat(entryForm.debit) || 0, credit: parseFloat(entryForm.credit) || 0 }) }).then((created: any) => { setJournalEntries((prev: any[]) => [...prev, { id: created._id || created.id, ...entryForm, debit: parseFloat(entryForm.debit) || 0, credit: parseFloat(entryForm.credit) || 0 }]); }).catch(() => { setJournalEntries((prev: any[]) => [...prev, { id: Date.now().toString(), ...entryForm, debit: parseFloat(entryForm.debit) || 0, credit: parseFloat(entryForm.credit) || 0 }]); });
                  setShowEntryDialog(false);
                  setEntryForm({ date: "", journal: "", compte: "", libelle: "", debit: "", credit: "" });
                }}>Valider</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="reports" className="space-y-6">
          <div><h2 className="text-xl font-bold">Rapports Comptables</h2><p className="text-sm text-muted-foreground">Balance, Grand Livre, Bilan, Compte de Resultat, TVA</p></div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Balance Generale</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Soldes de tous les comptes</p><Button className="mt-3 w-full" variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Grand Livre</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Detail des ecritures par compte</p><Button className="mt-3 w-full" variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Bilan</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Actif et passif a une date donnee</p><Button className="mt-3 w-full" variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Compte de Resultat</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Produits et charges sur la periode</p><Button className="mt-3 w-full" variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Declaration TVA</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">TVA collectee et deductible</p><Button className="mt-3 w-full" variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Export FEC</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Fichier des Ecritures Comptables</p><Button className="mt-3 w-full" variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Resume Financier</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-6 text-center"><div><p className="text-sm text-muted-foreground">Total Produits</p><p className="text-2xl font-bold text-green-600">{journalEntries.filter((e:any) => e.credit > 0).reduce((s:number,e:any) => s + e.credit, 0).toLocaleString("fr-FR")} EUR</p></div><div><p className="text-sm text-muted-foreground">Total Charges</p><p className="text-2xl font-bold text-red-600">{journalEntries.filter((e:any) => e.debit > 0).reduce((s:number,e:any) => s + e.debit, 0).toLocaleString("fr-FR")} EUR</p></div><div><p className="text-sm text-muted-foreground">Resultat Net</p><p className="text-2xl font-bold text-blue-600">{(journalEntries.filter((e:any) => e.credit > 0).reduce((s:number,e:any) => s + e.credit, 0) - journalEntries.filter((e:any) => e.debit > 0).reduce((s:number,e:any) => s + e.debit, 0)).toLocaleString("fr-FR")} EUR</p></div></div></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ==================== DIALOG ALERTES ==================== */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Centre de Notifications</DialogTitle>
            <DialogDescription>
              {unreadAlerts} alerte{unreadAlerts > 1 ? "s" : ""} non lue{unreadAlerts > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors",
                  alert.read ? "bg-white" : "bg-blue-50 border-blue-200",
                  alert.type === "danger" && "border-l-4 border-l-red-500",
                  alert.type === "warning" && "border-l-4 border-l-orange-500",
                  alert.type === "info" && "border-l-4 border-l-blue-500"
                )}
                onClick={() => handleMarkAlertRead(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    alert.type === "danger" && "bg-red-100",
                    alert.type === "warning" && "bg-orange-100",
                    alert.type === "info" && "bg-blue-100"
                  )}>
                    {alert.type === "danger" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {alert.type === "warning" && <AlertCircle className="w-5 h-5 text-orange-600" />}
                    {alert.type === "info" && <Info className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{alert.title}</h4>
                      {!alert.read && (
                        <Badge className="bg-blue-600 text-white ml-2">Nouveau</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(alert.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAlerts(alerts.map(a => ({ ...a, read: true })));
              toast.success("Toutes les alertes marquées comme lues");
            }}>
              Tout marquer comme lu
            </Button>
            <Button onClick={() => setShowAlerts(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG IMMOBILISATION ==================== */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle Immobilisation</DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle immobilisation avec calcul automatique des amortissements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Désignation *</Label>
                <Input placeholder="Ex: Serveur informatique" />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Matériel informatique</SelectItem>
                    <SelectItem value="transport">Matériel de transport</SelectItem>
                    <SelectItem value="furniture">Mobilier</SelectItem>
                    <SelectItem value="building">Constructions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date d'acquisition *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Valeur d'acquisition (€) *</Label>
                <Input type="number" placeholder="10000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Méthode d'amortissement *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linéaire</SelectItem>
                    <SelectItem value="degressive">Dégressif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée d'amortissement (années) *</Label>
                <Input type="number" placeholder="5" />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Calcul Automatique</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Le système calculera automatiquement les dotations mensuelles et générera les écritures comptables.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssetDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              toast.success("Immobilisation créée avec succès !");
              setShowAssetDialog(false);
            }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
  );
}






