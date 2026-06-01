import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  FileText, 
  Search, 
  Download, 
  Calendar,
  Clock,
  User,
  Shield,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
  Database,
  CreditCard,
  Filter
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  action: string;
  category: "auth" | "tenant" | "user" | "system" | "billing" | "data";
  severity: "info" | "warning" | "error" | "critical";
  description: string;
  ipAddress: string;
  userAgent?: string;
  details?: any;
}

// Données mock pour les logs d'audit
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    timestamp: "2025-11-11T10:45:23",
    user: "Admin Plateforme",
    userEmail: "admin@invoicia.fr",
    action: "LOGIN_SUCCESS",
    category: "auth",
    severity: "info",
    description: "Connexion réussie au panneau Super-Admin",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "log-002",
    timestamp: "2025-11-11T10:30:15",
    user: "Sophie Martin",
    userEmail: "sophie.martin@invoicia.fr",
    action: "TENANT_CREATED",
    category: "tenant",
    severity: "info",
    description: "Création d'un nouveau client : Entreprise Delta SARL",
    ipAddress: "192.168.1.101",
    details: {
      tenantId: "tenant-new-001",
      tenantName: "Entreprise Delta SARL",
      plan: "Business"
    }
  },
  {
    id: "log-003",
    timestamp: "2025-11-11T10:15:45",
    user: "Admin Plateforme",
    userEmail: "admin@invoicia.fr",
    action: "PLAN_UPDATED",
    category: "billing",
    severity: "info",
    description: "Modification du pack d'abonnement Business",
    ipAddress: "192.168.1.100",
    details: {
      planId: "plan-002",
      changes: { price: "99€ → 109€" }
    }
  },
  {
    id: "log-004",
    timestamp: "2025-11-11T09:50:30",
    user: "Lucas Dubois",
    userEmail: "lucas.dubois@invoicia.fr",
    action: "USER_PASSWORD_RESET",
    category: "user",
    severity: "warning",
    description: "Réinitialisation du mot de passe utilisateur",
    ipAddress: "192.168.1.102",
    details: {
      targetUser: "jean.martin@client.fr"
    }
  },
  {
    id: "log-005",
    timestamp: "2025-11-11T09:30:12",
    user: "System",
    userEmail: "system@invoicia.fr",
    action: "BACKUP_COMPLETED",
    category: "system",
    severity: "info",
    description: "Sauvegarde automatique de la base de données réussie",
    ipAddress: "127.0.0.1",
    details: {
      backupSize: "2.4 GB",
      duration: "4m 32s"
    }
  },
  {
    id: "log-006",
    timestamp: "2025-11-11T09:15:05",
    user: "Admin Plateforme",
    userEmail: "admin@invoicia.fr",
    action: "SETTINGS_CHANGED",
    category: "system",
    severity: "warning",
    description: "Modification des paramètres de sécurité",
    ipAddress: "192.168.1.100",
    details: {
      setting: "MFA_REQUIRED",
      oldValue: false,
      newValue: true
    }
  },
  {
    id: "log-007",
    timestamp: "2025-11-11T08:45:20",
    user: "Sophie Martin",
    userEmail: "sophie.martin@invoicia.fr",
    action: "TENANT_SUSPENDED",
    category: "tenant",
    severity: "warning",
    description: "Suspension du compte client : Tech Solutions SAS",
    ipAddress: "192.168.1.101",
    details: {
      tenantId: "tenant-003",
      reason: "Impayé depuis 30 jours"
    }
  },
  {
    id: "log-008",
    timestamp: "2025-11-11T08:20:45",
    user: "System",
    userEmail: "system@invoicia.fr",
    action: "API_RATE_LIMIT",
    category: "system",
    severity: "error",
    description: "Limite de taux API atteinte pour Bridge API",
    ipAddress: "203.0.113.45",
    details: {
      api: "Bridge API",
      limit: "1000 req/min",
      current: "1247 req/min"
    }
  },
  {
    id: "log-009",
    timestamp: "2025-11-11T07:55:30",
    user: "Admin Plateforme",
    userEmail: "admin@invoicia.fr",
    action: "ADMIN_CREATED",
    category: "user",
    severity: "info",
    description: "Création d'un nouvel administrateur plateforme",
    ipAddress: "192.168.1.100",
    details: {
      newAdmin: "Marie Dubois",
      role: "platform_admin"
    }
  },
  {
    id: "log-010",
    timestamp: "2025-11-11T07:30:15",
    user: "Lucas Dubois",
    userEmail: "lucas.dubois@invoicia.fr",
    action: "LOGIN_FAILED",
    category: "auth",
    severity: "error",
    description: "Échec de connexion - Mot de passe incorrect (3ème tentative)",
    ipAddress: "192.168.1.102",
  },
];

export function AuditLogs() {
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filtrage des logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Statistiques
  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    errors: logs.filter(log => log.severity === "error" || log.severity === "critical").length,
    warnings: logs.filter(log => log.severity === "warning").length,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth": return <Shield className="h-4 w-4" />;
      case "tenant": return <User className="h-4 w-4" />;
      case "user": return <User className="h-4 w-4" />;
      case "system": return <Settings className="h-4 w-4" />;
      case "billing": return <CreditCard className="h-4 w-4" />;
      case "data": return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      auth: "bg-blue-100 text-blue-800 border-blue-200",
      tenant: "bg-green-100 text-green-800 border-green-200",
      user: "bg-purple-100 text-purple-800 border-purple-200",
      system: "bg-gray-100 text-gray-800 border-gray-200",
      billing: "bg-orange-100 text-orange-800 border-orange-200",
      data: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };

    const labels = {
      auth: "Authentification",
      tenant: "Client",
      user: "Utilisateur",
      system: "Système",
      billing: "Facturation",
      data: "Données",
    };

    return (
      <Badge className={styles[category as keyof typeof styles]} variant="outline">
        {getCategoryIcon(category)}
        <span className="ml-1">{labels[category as keyof typeof labels]}</span>
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "info":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Info
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Attention
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erreur
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-600 text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            Critique
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return <LogIn className="h-4 w-4" />;
    if (action.includes("LOGOUT")) return <LogOut className="h-4 w-4" />;
    if (action.includes("CREATE")) return <Plus className="h-4 w-4" />;
    if (action.includes("UPDATE") || action.includes("CHANGED")) return <Edit className="h-4 w-4" />;
    if (action.includes("DELETE") || action.includes("SUSPENDED")) return <Trash2 className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleExport = () => {
    console.log("Export des logs d'audit...");
    // Simulation d'export CSV
    const csvContent = [
      ["Date/Heure", "Utilisateur", "Action", "Catégorie", "Sévérité", "Description", "IP"],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.category,
        log.severity,
        log.description,
        log.ipAddress
      ])
    ].map(row => row.join(",")).join("\n");

    console.log("Données CSV:", csvContent);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight">Logs & Audit</h1>
          <p className="text-muted-foreground mt-1">
            Journal complet des activités de la plateforme
          </p>
        </div>
        <Button onClick={handleExport} className="bg-purple-600 hover:bg-purple-700">
          <Download className="w-4 h-4 mr-2" />
          Exporter (CSV)
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total des Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.today} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Authentifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {logs.filter(l => l.category === "auth").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Connexions et déconnexions
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avertissements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground">
              Actions sensibles
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">
              Incidents à surveiller
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par utilisateur, action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="auth">Authentification</SelectItem>
                  <SelectItem value="tenant">Client</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                  <SelectItem value="billing">Facturation</SelectItem>
                  <SelectItem value="data">Données</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sévérité</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sévérités</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Attention</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Journal d'Activité</CardTitle>
          <CardDescription>
            {filteredLogs.length} événement{filteredLogs.length > 1 ? "s" : ""} trouvé{filteredLogs.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(log.category)}
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-sm">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {log.ipAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails additionnels */}
                {log.details && selectedLog?.id === log.id && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Détails supplémentaires :</p>
                    <div className="bg-slate-100 p-3 rounded text-xs font-mono">
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun log trouvé avec ces critères</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs supplémentaires */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
          <TabsTrigger value="users">Par Utilisateur</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Vue Chronologique</CardTitle>
              <CardDescription>Événements classés par ordre chronologique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {filteredLogs.slice(0, 5).map((log, index) => (
                  <div key={log.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                    <div className="w-20 text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                    <div className="h-2 w-2 rounded-full bg-purple-600" />
                    <div className="flex-1">{log.description}</div>
                    {getSeverityBadge(log.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Activité par Utilisateur</CardTitle>
              <CardDescription>Actions regroupées par administrateur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Admin Plateforme", "Sophie Martin", "Lucas Dubois"].map(userName => {
                  const userLogs = logs.filter(l => l.user === userName);
                  return (
                    <div key={userName} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <span>{userName}</span>
                        </div>
                        <Badge variant="secondary">{userLogs.length} actions</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Dernière activité : {new Date(userLogs[0]?.timestamp).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Événements de Sécurité</CardTitle>
              <CardDescription>Tentatives de connexion et actions sensibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.filter(l => 
                  l.category === "auth" || l.severity === "warning" || l.severity === "error"
                ).slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div>
                        <p className="text-sm">{log.description}</p>
                        <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>
                      </div>
                    </div>
                    {getSeverityBadge(log.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
