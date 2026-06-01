import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
  X,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { cn } from "./ui/utils";

export type AlertType = 
  | "invoice_overdue"
  | "budget_exceeded"
  | "contract_ending"
  | "cra_missing"
  | "payment_due"
  | "low_cash"
  | "staffing_shortage"
  | "document_expiring";

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  createdAt: string;
  dismissed: boolean;
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  conditions: {
    threshold?: number;
    days?: number;
    percentage?: number;
  };
  severity: AlertSeverity;
  notification: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
}

const alertIcons: Record<AlertType, any> = {
  invoice_overdue: FileText,
  budget_exceeded: TrendingUp,
  contract_ending: Calendar,
  cra_missing: Clock,
  payment_due: DollarSign,
  low_cash: TrendingDown,
  staffing_shortage: Users,
  document_expiring: FileText,
};

const severityConfig = {
  info: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Info",
  },
  warning: {
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    label: "Attention",
  },
  critical: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Critique",
  },
};

export function AlertsManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "rules">("active");
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadAlertRules();

    // Vérifier périodiquement les nouvelles alertes
    const interval = setInterval(() => {
      checkForNewAlerts();
    }, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    // Données de démo
    const demoAlerts: Alert[] = [
      {
        id: "alert-1",
        type: "invoice_overdue",
        severity: "critical",
        title: "Factures en retard critique",
        description: "5 factures sont en retard de plus de 30 jours pour un montant total de 45 780€",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dismissed: false,
        metadata: { count: 5, amount: 45780, days: 30 },
        actionUrl: "/sales",
        actionLabel: "Voir les factures",
      },
      {
        id: "alert-2",
        type: "budget_exceeded",
        severity: "warning",
        title: "Budget projet dépassé",
        description: "Le projet 'Migration Cloud' a dépassé son budget de 15% (92 500€ / 80 000€)",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        dismissed: false,
        metadata: { projectName: "Migration Cloud", spent: 92500, budget: 80000, percentage: 115 },
        actionUrl: "/projects",
        actionLabel: "Voir le projet",
      },
      {
        id: "alert-3",
        type: "contract_ending",
        severity: "warning",
        title: "Contrats arrivant à échéance",
        description: "3 contrats arrivent à échéance dans les 30 prochains jours",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dismissed: false,
        metadata: { count: 3, days: 30 },
        actionUrl: "/pipeline",
        actionLabel: "Voir les contrats",
      },
      {
        id: "alert-4",
        type: "cra_missing",
        severity: "info",
        title: "CRA manquants",
        description: "8 collaborateurs n'ont pas complété leur CRA pour la semaine dernière",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dismissed: false,
        metadata: { count: 8, period: "Semaine 49" },
        actionUrl: "/cra",
        actionLabel: "Gérer les CRA",
      },
      {
        id: "alert-5",
        type: "low_cash",
        severity: "warning",
        title: "Trésorerie faible",
        description: "La trésorerie est inférieure au seuil d'alerte (28 450€ disponible)",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dismissed: false,
        metadata: { amount: 28450, threshold: 50000 },
        actionUrl: "/banking",
        actionLabel: "Voir la trésorerie",
      },
    ];

    setAlerts(demoAlerts);
  };

  const loadAlertRules = () => {
    const demoRules: AlertRule[] = [
      {
        id: "rule-1",
        name: "Factures en retard > 30 jours",
        type: "invoice_overdue",
        enabled: true,
        conditions: { days: 30 },
        severity: "critical",
        notification: { inApp: true, email: true, sms: true },
      },
      {
        id: "rule-2",
        name: "Budget projet > 90%",
        type: "budget_exceeded",
        enabled: true,
        conditions: { percentage: 90 },
        severity: "warning",
        notification: { inApp: true, email: true, sms: false },
      },
      {
        id: "rule-3",
        name: "Contrat < 30 jours",
        type: "contract_ending",
        enabled: true,
        conditions: { days: 30 },
        severity: "warning",
        notification: { inApp: true, email: true, sms: false },
      },
      {
        id: "rule-4",
        name: "CRA non complété > 2 jours",
        type: "cra_missing",
        enabled: true,
        conditions: { days: 2 },
        severity: "info",
        notification: { inApp: true, email: false, sms: false },
      },
      {
        id: "rule-5",
        name: "Trésorerie < 50 000€",
        type: "low_cash",
        enabled: true,
        conditions: { threshold: 50000 },
        severity: "warning",
        notification: { inApp: true, email: true, sms: true },
      },
    ];

    setAlertRules(demoRules);
  };

  const checkForNewAlerts = () => {
    // Dans une vraie app, appeler l'API pour vérifier les nouvelles alertes
    console.log("Vérification des nouvelles alertes...");
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, dismissed: true } : a)
    );
    toast.success("Alerte fermée");
  };

  const handleAlertAction = (alert: Alert) => {
    if (alert.actionUrl) {
      toast.info("Navigation vers: " + alert.actionUrl);
    }
  };

  const toggleRule = (id: string) => {
    setAlertRules(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
    const rule = alertRules.find(r => r.id === id);
    toast.success(
      rule?.enabled ? "Règle désactivée" : "Règle activée",
      { description: rule?.name }
    );
  };

  const deleteRule = (id: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== id));
    toast.success("Règle supprimée");
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const warningCount = activeAlerts.filter(a => a.severity === "warning").length;
  const infoCount = activeAlerts.filter(a => a.severity === "info").length;

  return (
    <div className="space-y-6">
      {/* Résumé des alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avertissements</p>
                <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Informations</p>
                <p className="text-3xl font-bold text-blue-600">{infoCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des alertes</CardTitle>
              <CardDescription>
                Surveillez et gérez les alertes importantes de votre ERP
              </CardDescription>
            </div>
            {activeTab === "rules" && (
              <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle règle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une règle d'alerte</DialogTitle>
                    <DialogDescription>
                      Définissez les conditions pour déclencher une alerte automatique
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nom de la règle</Label>
                      <Input placeholder="Ex: Factures très en retard" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type d'alerte</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice_overdue">Facture en retard</SelectItem>
                          <SelectItem value="budget_exceeded">Budget dépassé</SelectItem>
                          <SelectItem value="contract_ending">Contrat expirant</SelectItem>
                          <SelectItem value="cra_missing">CRA manquant</SelectItem>
                          <SelectItem value="low_cash">Trésorerie faible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sévérité</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Information</SelectItem>
                          <SelectItem value="warning">Avertissement</SelectItem>
                          <SelectItem value="critical">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conditions</Label>
                      <Textarea placeholder="Ex: Quand une facture dépasse 45 jours de retard" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateRuleOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={() => {
                      toast.success("Règle créée avec succès");
                      setIsCreateRuleOpen(false);
                    }}>
                      Créer la règle
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "rules")}>
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                Alertes actives ({activeAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex-1">
                Règles d'alerte ({alertRules.length})
              </TabsTrigger>
            </TabsList>

            {/* Alertes actives */}
            <TabsContent value="active" className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium">Aucune alerte active</p>
                  <p className="text-sm text-muted-foreground">
                    Tout va bien ! Aucun problème détecté.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {activeAlerts.map((alert) => {
                      const Icon = alertIcons[alert.type];
                      const config = severityConfig[alert.severity];
                      
                      return (
                        <Card
                          key={alert.id}
                          className={cn("border-l-4", config.border, config.bg)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={cn("p-2 rounded-lg", config.bg)}>
                                <Icon className={cn("h-5 w-5", config.color)} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold">{alert.title}</h4>
                                      <Badge
                                        variant="outline"
                                        className={cn("text-xs", config.color)}
                                      >
                                        {config.label}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {alert.description}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => dismissAlert(alert.id)}
                                    className="flex-shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                {alert.metadata && (
                                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                                    {Object.entries(alert.metadata).map(([key, value]) => (
                                      <span key={key}>
                                        <strong className="capitalize">{key}:</strong> {value}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(alert.createdAt).toLocaleString("fr-FR")}
                                  </span>
                                  {alert.actionLabel && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAlertAction(alert)}
                                    >
                                      {alert.actionLabel}
                                      <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Règles d'alerte */}
            <TabsContent value="rules" className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {alertRules.map((rule) => {
                    const Icon = alertIcons[rule.type];
                    const config = severityConfig[rule.severity];

                    return (
                      <Card key={rule.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn("p-2 rounded-lg", config.bg)}>
                              <Icon className={cn("h-5 w-5", config.color)} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{rule.name}</h4>
                                  <Badge
                                    variant={rule.enabled ? "default" : "secondary"}
                                  >
                                    {rule.enabled ? "Activée" : "Désactivée"}
                                  </Badge>
                                  <Badge variant="outline" className={config.color}>
                                    {config.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleRule(rule.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteRule(rule.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                  {rule.conditions.threshold && (
                                    <span>Seuil: {rule.conditions.threshold}€</span>
                                  )}
                                  {rule.conditions.days && (
                                    <span>Délai: {rule.conditions.days} jours</span>
                                  )}
                                  {rule.conditions.percentage && (
                                    <span>Pourcentage: {rule.conditions.percentage}%</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground">Notifications:</span>
                                  {rule.notification.inApp && <Badge variant="outline">App</Badge>}
                                  {rule.notification.email && <Badge variant="outline">Email</Badge>}
                                  {rule.notification.sms && <Badge variant="outline">SMS</Badge>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
