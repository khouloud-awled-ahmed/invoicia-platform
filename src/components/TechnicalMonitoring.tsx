import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api-client-backend";

enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

enum LogCategory {
  TECHNICAL = "technical",
  USER_ACTION = "user_action",
  SYSTEM = "system",
  SECURITY = "security",
  PERFORMANCE = "performance",
  DATABASE = "database",
  API = "api",
}

enum LogSource {
  BACKEND = "backend",
  FRONTEND = "frontend",
  DATABASE = "database",
  EXTERNAL_API = "external_api",
}

interface LogEntry {
  _id: string;
  level: LogLevel;
  category: LogCategory;
  source: LogSource;
  message: string;
  metadata?: {
    userId?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    requestId?: string;
    duration?: number;
  };
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  bySource: Record<LogSource, number>;
  errors: number;
  warnings: number;
  unresolved: number;
}

export function TechnicalMonitoring() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Filters
  const [filters, setFilters] = useState({
    level: "" as string,
    category: "" as string,
    source: "" as string,
    resolved: "" as string,
    search: "",
    timeRange: "24h" as "24h" | "7d" | "30d",
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [page, filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.level) params.append("level", filters.level);
      if (filters.category) params.append("category", filters.category);
      if (filters.source) params.append("source", filters.source);
      if (filters.resolved) params.append("resolved", filters.resolved);
      if (filters.search) params.append("search", filters.search);

      const data = await apiClient.getLogs({
        ...filters,
        page,
        limit,
        resolved: filters.resolved ? filters.resolved === "true" : undefined,
      });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Erreur lors du chargement des logs");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiClient.getLogStats(filters.timeRange);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleResolve = async (logId: string) => {
    try {
      await apiClient.resolveLog(logId, resolveNotes);
      toast.success("Log marqué comme résolu");
      setIsDetailOpen(false);
      setResolveNotes("");
      loadLogs();
      loadStats();
    } catch (error) {
      console.error("Error resolving log:", error);
      toast.error("Erreur lors de la résolution du log");
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case LogLevel.WARN:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case LogLevel.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
      case LogLevel.DEBUG:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: LogLevel) => {
    const variants = {
      [LogLevel.ERROR]: "destructive",
      [LogLevel.WARN]: "default",
      [LogLevel.INFO]: "secondary",
      [LogLevel.DEBUG]: "outline",
    };
    return <Badge variant={variants[level] as any}>{level.toUpperCase()}</Badge>;
  };

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case LogCategory.TECHNICAL:
        return <Server className="h-4 w-4" />;
      case LogCategory.DATABASE:
        return <Database className="h-4 w-4" />;
      case LogCategory.API:
        return <Globe className="h-4 w-4" />;
      case LogCategory.SECURITY:
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Monitoring Technique</h1>
          <p className="text-muted-foreground mt-1">
            Suivi des logs d'erreur et événements système
          </p>
        </div>
        <Button onClick={() => { loadLogs(); loadStats(); }} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Logs ({filters.timeRange})</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Erreurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
              <p className="text-xs text-muted-foreground mt-1">Non résolues: {stats.unresolved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Avertissements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.warnings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Non résolus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unresolved}</div>
              <p className="text-xs text-muted-foreground mt-1">Nécessitent une attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Message, endpoint..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Niveau</Label>
              <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value={LogLevel.ERROR}>Error</SelectItem>
                  <SelectItem value={LogLevel.WARN}>Warning</SelectItem>
                  <SelectItem value={LogLevel.INFO}>Info</SelectItem>
                  <SelectItem value={LogLevel.DEBUG}>Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value={LogCategory.TECHNICAL}>Technique</SelectItem>
                  <SelectItem value={LogCategory.API}>API</SelectItem>
                  <SelectItem value={LogCategory.DATABASE}>Base de données</SelectItem>
                  <SelectItem value={LogCategory.SECURITY}>Sécurité</SelectItem>
                  <SelectItem value={LogCategory.SYSTEM}>Système</SelectItem>
                  <SelectItem value={LogCategory.USER_ACTION}>Action utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={filters.source} onValueChange={(value) => setFilters({ ...filters, source: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value={LogSource.BACKEND}>Backend</SelectItem>
                  <SelectItem value={LogSource.FRONTEND}>Frontend</SelectItem>
                  <SelectItem value={LogSource.DATABASE}>Database</SelectItem>
                  <SelectItem value={LogSource.EXTERNAL_API}>API externe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={filters.resolved} onValueChange={(value) => setFilters({ ...filters, resolved: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="false">Non résolu</SelectItem>
                  <SelectItem value="true">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Période</Label>
              <Select value={filters.timeRange} onValueChange={(value: any) => { setFilters({ ...filters, timeRange: value }); loadStats(); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="text-sm">{log.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate" title={log.message}>
                          {log.message}
                        </div>
                        {log.metadata?.endpoint && (
                          <div className="text-xs text-muted-foreground">
                            {log.metadata.method} {log.metadata.endpoint}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.source}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        {log.resolved ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Résolu
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Non résolu</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} sur {Math.ceil(total / limit)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du Log</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'événement enregistré
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Niveau</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getLevelIcon(selectedLog.level)}
                    {getLevelBadge(selectedLog.level)}
                  </div>
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(selectedLog.category)}
                    <span>{selectedLog.category}</span>
                  </div>
                </div>
                <div>
                  <Label>Source</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedLog.source}</Badge>
                  </div>
                </div>
                <div>
                  <Label>Date</Label>
                  <div className="mt-1 text-sm">{formatDate(selectedLog.createdAt)}</div>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <Alert className="mt-1">
                  <AlertDescription>{selectedLog.message}</AlertDescription>
                </Alert>
              </div>

              {selectedLog.metadata && (
                <div>
                  <Label>Métadonnées</Label>
                  <ScrollArea className="h-32 mt-1 border rounded p-2">
                    <pre className="text-xs">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <Label>Détails de l'erreur</Label>
                  <Alert variant="destructive" className="mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>
                          <strong>Type:</strong> {selectedLog.error.name}
                        </div>
                        <div>
                          <strong>Message:</strong> {selectedLog.error.message}
                        </div>
                        {selectedLog.error.code && (
                          <div>
                            <strong>Code:</strong> {selectedLog.error.code}
                          </div>
                        )}
                        {selectedLog.error.stack && (
                          <ScrollArea className="h-40 mt-2 border rounded p-2 bg-background">
                            <pre className="text-xs whitespace-pre-wrap">
                              {selectedLog.error.stack}
                            </pre>
                          </ScrollArea>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!selectedLog.resolved && (
                <div>
                  <Label>Notes de résolution</Label>
                  <Textarea
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Ajoutez des notes sur la résolution..."
                    className="mt-1"
                    rows={3}
                  />
                  <Button
                    onClick={() => handleResolve(selectedLog._id)}
                    className="mt-2"
                    disabled={!resolveNotes.trim()}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme résolu
                  </Button>
                </div>
              )}

              {selectedLog.resolved && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <strong>Résolu le:</strong> {formatDate(selectedLog.resolvedAt || "")}
                    </div>
                    {selectedLog.notes && (
                      <div className="mt-1">
                        <strong>Notes:</strong> {selectedLog.notes}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
