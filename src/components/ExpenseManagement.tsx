import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Cloud,
  Smartphone,
  Link,
  Tags,
  BarChart3,
  PieChart,
  Clock,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { ExpenseImportDialog } from "./ExpenseImportDialog";
import { CreateExpenseDialog } from "./CreateExpenseDialog";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";
import { PurchaseInvoiceAIReader } from "./PurchaseInvoiceAIReader";
import { apiClient } from "../lib/api-client-backend";

interface Expense {
  id: string;
  date: string;
  supplier: string;
  category: string;
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
  currency: string;
  status: "pending" | "verified" | "exported" | "rejected";
  documentUrl?: string;
  documentType?: string;
  extractionConfidence?: number;
  tags?: string[];
  notes?: string;
  paymentMethod?: string;
  isDuplicate?: boolean;
  approvedBy?: string;
}

const EXPENSE_CATEGORIES = [
  "Logiciels SaaS",
  "Fournitures de bureau",
  "Carburant",
  "Restauration",
  "Déplacements",
  "Marketing",
  "Formation",
  "Télécommunications",
  "Assurances",
  "Services professionnels",
  "Maintenance",
  "Autres",
];

export function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentView, setCurrentView] = useState<"table" | "dashboard" | "ai-import">("dashboard");

  // Charger les dépenses depuis l'API
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getExpenses();
      // Normaliser les IDs et transformer les dates
      const normalizedExpenses = Array.isArray(data)
        ? data.map((expense: any) => ({
            ...expense,
            id: expense._id || expense.id,
            date: expense.date ? (typeof expense.date === 'string' ? expense.date : new Date(expense.date).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          }))
        : [];
      setExpenses(normalizedExpenses);
    } catch (error: any) {
      console.error("Erreur lors du chargement des dépenses:", error);
      toast.error(error?.message || "Erreur lors du chargement des dépenses");
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate KPIs
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amountTTC, 0);
  const pendingExpenses = expenses.filter(e => e.status === "pending");
  const verifiedExpenses = expenses.filter(e => e.status === "verified");
  const expensesWithoutDocument = expenses.filter(e => !e.documentType);
  const thisMonthExpenses = expenses.filter(e => {
    const expDate = new Date(e.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amountTTC, 0);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amountTTC;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await apiClient.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success("Dépense supprimée");
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(error?.message || "Erreur lors de la suppression");
    }
  };

  const handleValidateExpense = async (id: string) => {
    try {
      await apiClient.updateExpense(id, { status: "verified" });
      setExpenses(expenses.map(e => 
        e.id === id ? { ...e, status: "verified" as const } : e
      ));
      toast.success("Dépense validée");
    } catch (error: any) {
      console.error("Erreur lors de la validation:", error);
      toast.error(error?.message || "Erreur lors de la validation");
    }
  };

  const handleExportData = (format: string) => {
    toast.success(`Export ${format.toUpperCase()} en cours...`);
    // Simulate export
    setTimeout(() => {
      toast.success(`Export ${format.toUpperCase()} terminé !`);
    }, 1500);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || expense.status === filterStatus;
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En attente</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Validée</Badge>;
      case "exported":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Exportée</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Achats</h1>
          <p className="text-muted-foreground mt-1">
            Importez, analysez et gérez vos achats
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportData("excel")}>
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("csv")}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("pdf")}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Créer un Achat
          </Button>
          <Button onClick={() => setIsImportDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Importer un Achat
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Tableau de Bord
          </TabsTrigger>
          <TabsTrigger value="table">
            <FileText className="w-4 h-4 mr-2" />
            Liste des Factures
          </TabsTrigger>
          <TabsTrigger value="ai-import">
            <Brain className="w-4 h-4 mr-2" />
            Import IA
          </TabsTrigger>
        </TabsList>

        {/* Dashboard View */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Factures</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalExpenses.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {expenses.length} factures enregistrées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Ce Mois</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{thisMonthTotal.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {thisMonthExpenses.length} factures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">En Attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingExpenses.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  À vérifier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Validées</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{verifiedExpenses.length}</div>
                <p className="text-xs text-green-600 text-xs mt-1">
                  Prêtes à exporter
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Top 5 Catégories
                </CardTitle>
                <CardDescription>
                  Répartition des dépenses par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCategories.map(([category, total], index) => {
                    const percentage = (total / totalExpenses) * 100;
                    const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${colors[index]}`} />
                            {category}
                          </span>
                          <span className="font-medium">{total.toFixed(2)} € ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[index]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activité Récente
                </CardTitle>
                <CardDescription>
                  Dernières dépenses ajoutées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm">{expense.supplier}</p>
                            <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString('fr-FR')}
                          </p> 
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{expense.amountTTC.toFixed(2)} €</p>
                        {getStatusBadge(expense.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Validation */}
          {pendingExpenses.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Dépenses en Attente de Validation
                </CardTitle>
                <CardDescription>
                  {pendingExpenses.length} dépense(s) nécessitent votre vérification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm">{expense.supplier}</p>
                          <p className="text-xs text-muted-foreground">
                          {expense.extractionConfidence ? `Confiance IA: ${expense.extractionConfidence}%` : 'Saisie manuelle'}                            {expense.isDuplicate && <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-700">Duplicata possible</Badge>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{expense.amountTTC.toFixed(2)} €</span>
                        <Button size="sm" onClick={() => handleViewExpense(expense)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Vérifier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning: Expenses Without Document */}
          {expensesWithoutDocument.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  ⚠️ Dépenses Sans Justificatif
                </CardTitle>
                <CardDescription className="text-red-700">
                  {expensesWithoutDocument.length} dépense(s) n'ont pas de document justificatif. Cela peut poser problème pour la comptabilité.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expensesWithoutDocument.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{expense.supplier}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString('fr-FR')} • {expense.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">{expense.amountTTC.toFixed(2)} €</p>
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs mt-1">
                            Sans justificatif
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleViewExpense(expense)} className="border-red-300 text-red-700 hover:bg-red-100">
                          <Upload className="w-4 h-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une dépense..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="verified">Validée</SelectItem>
                    <SelectItem value="exported">Exportée</SelectItem>
                    <SelectItem value="rejected">Rejetée</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Montant HT</TableHead>
                    <TableHead className="text-right">TVA</TableHead>
                    <TableHead className="text-right">Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucune dépense trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className={expense.isDuplicate ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">
                          {expense.id}
                          {expense.isDuplicate && (
                            <AlertTriangle className="inline w-3 h-3 ml-1 text-red-600" />
                          )}
                          {!expense.documentType && (
                            <AlertTriangle className="inline w-3 h-3 ml-1 text-orange-600" title="Sans justificatif" />
                          )}
                        </TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p>{expense.supplier}</p>
                              {!expense.documentType && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                                  Sans justificatif
                                </Badge>
                              )}
                            </div>
                            {expense.tags && expense.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {expense.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right">{expense.amountHT.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{expense.amountTVA.toFixed(2)} €</TableCell>
                        <TableCell className="text-right font-medium">{expense.amountTTC.toFixed(2)} €</TableCell>
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewExpense(expense)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les détails
                              </DropdownMenuItem>
                              {expense.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleValidateExpense(expense.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Valider
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => {
                                toast.info("Modification de l'achat en cours...");
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Import View */}
        <TabsContent value="ai-import" className="space-y-4">
          <PurchaseInvoiceAIReader />
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <ExpenseImportDialog 
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportComplete={async (newExpense) => {
          // Recharger les dépenses depuis l'API après import
          await loadExpenses();
          setIsImportDialogOpen(false);
        }}
      />

      {/* Details Dialog */}
      <CreateExpenseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={loadExpenses}
        />
      {selectedExpense && (
        <ExpenseDetailsDialog
          expense={selectedExpense}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedExpense(null);
          }}
          onValidate={(id) => {
            handleValidateExpense(id);
            setIsDetailsDialogOpen(false);
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
}