import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCompanySettings } from "../contexts/CompanySettingsContext";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  category: "financial" | "hr" | "commercial" | "system";
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    id: "invoice_overdue",
    label: "Factures en retard",
    description: "Notification quand une facture dépasse sa date d'échéance",
    inApp: true,
    email: true,
    sms: false,
    category: "financial",
  },
  {
    id: "payment_received",
    label: "Paiements reçus",
    description: "Notification lors de la réception d'un paiement",
    inApp: true,
    email: true,
    sms: false,
    category: "financial",
  },
  {
    id: "cra_pending",
    label: "CRA en attente",
    description: "Rappel pour les CRA à valider ou compléter",
    inApp: true,
    email: true,
    sms: false,
    category: "hr",
  },
  {
    id: "absence_request",
    label: "Demandes d'absence",
    description: "Notification pour les nouvelles demandes d'absence",
    inApp: true,
    email: true,
    sms: false,
    category: "hr",
  },
  {
    id: "signature_required",
    label: "Signatures requises",
    description: "Documents en attente de signature",
    inApp: true,
    email: true,
    sms: true,
    category: "commercial",
  },
  {
    id: "contract_expiring",
    label: "Contrats expirant",
    description: "Alerte quand un contrat arrive à échéance (30 jours)",
    inApp: true,
    email: true,
    sms: false,
    category: "commercial",
  },
  {
    id: "budget_alert",
    label: "Alertes budget",
    description: "Notification quand un budget projet dépasse 80%",
    inApp: true,
    email: true,
    sms: false,
    category: "financial",
  },
  {
    id: "system_maintenance",
    label: "Maintenance système",
    description: "Informations sur les maintenances planifiées",
    inApp: true,
    email: false,
    sms: false,
    category: "system",
  },
];

export function NotificationSettings() {
  const { tenant, updateNotificationPreferences, refreshTenant } = useCompanySettings();
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_PREFERENCES);

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState<"daily" | "weekly">("daily");

  // Charger les préférences depuis le tenant
  useEffect(() => {
    if (tenant?.notificationPreferences) {
      setPreferences(prev =>
        prev.map(pref => {
          const tenantPref = tenant.notificationPreferences?.[pref.id];
          if (tenantPref) {
            return {
              ...pref,
              inApp: tenantPref.inApp,
              email: tenantPref.email,
              sms: tenantPref.sms,
            };
          }
          return pref;
        })
      );
    }
  }, [tenant?.notificationPreferences]);

  const updatePreference = (id: string, channel: "inApp" | "email" | "sms", value: boolean) => {
    setPreferences(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [channel]: value } : p
      )
    );
  };

  const handleSave = async () => {
    try {
      // Convertir les préférences au format attendu par l'API
      const preferencesMap: { [key: string]: { inApp: boolean; email: boolean; sms: boolean } } = {};
      preferences.forEach(pref => {
        preferencesMap[pref.id] = {
          inApp: pref.inApp,
          email: pref.email,
          sms: pref.sms,
        };
      });

      await updateNotificationPreferences(preferencesMap);
      toast.success("Préférences de notifications enregistrées", {
        description: "Vos paramètres ont été mis à jour avec succès",
      });
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des préférences');
    }
  };

  const categoryLabels = {
    financial: "Financier",
    hr: "Ressources Humaines",
    commercial: "Commercial",
    system: "Système",
  };

  const categoryColors = {
    financial: "bg-green-100 text-green-700",
    hr: "bg-blue-100 text-blue-700",
    commercial: "bg-purple-100 text-purple-700",
    system: "bg-gray-100 text-gray-700",
  };

  // Grouper par catégorie
  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Préférences de notifications
          </CardTitle>
          <CardDescription>
            Choisissez comment vous souhaitez être notifié des événements importants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* En-tête des colonnes */}
          <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 pb-2 border-b">
            <div className="text-sm font-medium">Type de notification</div>
            <div className="text-center text-sm font-medium flex items-center justify-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">App</span>
            </div>
            <div className="text-center text-sm font-medium flex items-center justify-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </div>
            <div className="text-center text-sm font-medium flex items-center justify-center gap-1">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">SMS</span>
            </div>
          </div>

          {/* Liste par catégorie */}
          {Object.entries(groupedPreferences).map(([category, prefs]) => (
            <div key={category} className="space-y-3">
              <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </Badge>
              {prefs.map((pref) => (
                <div key={pref.id} className="grid grid-cols-[1fr,80px,80px,80px] gap-4 items-center py-2">
                  <div>
                    <Label className="text-sm">{pref.label}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pref.description}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.inApp}
                      onCheckedChange={(checked) =>
                        updatePreference(pref.id, "inApp", checked)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.email}
                      onCheckedChange={(checked) =>
                        updatePreference(pref.id, "email", checked)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.sms}
                      onCheckedChange={(checked) =>
                        updatePreference(pref.id, "sms", checked)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Heures silencieuses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Heures silencieuses
          </CardTitle>
          <CardDescription>
            Ne pas recevoir de notifications pendant certaines heures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Activer les heures silencieuses</Label>
              <p className="text-sm text-muted-foreground">
                Les notifications non urgentes seront mises en attente
              </p>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label>De</Label>
                <Select value={quietHoursStart} onValueChange={setQuietHoursStart}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>À</Label>
                <Select value={quietHoursEnd} onValueChange={setQuietHoursEnd}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé quotidien/hebdomadaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Résumé par email
          </CardTitle>
          <CardDescription>
            Recevoir un résumé regroupé des notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Activer le résumé</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un email récapitulatif au lieu de chaque notification
              </p>
            </div>
            <Switch
              checked={digestEnabled}
              onCheckedChange={setDigestEnabled}
            />
          </div>

          {digestEnabled && (
            <div className="space-y-2 pt-4">
              <Label>Fréquence</Label>
              <Select
                value={digestFrequency}
                onValueChange={(value) => setDigestFrequency(value as "daily" | "weekly")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien (8h00)</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire (Lundi 8h00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations importantes */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Note importante :</strong> Les notifications marquées comme urgentes 
                (factures très en retard, problèmes système critiques) ignoreront les heures 
                silencieuses et le mode résumé.
              </p>
              <p className="text-sm text-muted-foreground">
                Les SMS peuvent entraîner des frais supplémentaires selon votre forfait.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  );
}
