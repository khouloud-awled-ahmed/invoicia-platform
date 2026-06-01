import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Code, 
  Webhook,
  Key,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";

interface ApiConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  status?: "connected" | "disconnected" | "error";
}

export function GlobalSettings() {
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Configuration générale
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Invoicia",
    platformUrl: "https://app.invoicia.fr",
    supportEmail: "support@invoicia.fr",
    maxTenantsPerPlan: 1000,
    defaultTrialDays: 14,
    maintenanceMode: false,
  });

  // Configuration des APIs
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([
    {
      name: "Bridge API (Banques)",
      enabled: true,
      apiKey: "bridge_live_xxxxxxxxxxxx",
      endpoint: "https://api.bridgeapi.io/v2",
      status: "connected"
    },
    {
      name: "Mindee OCR (Factures)",
      enabled: true,
      apiKey: "mindee_api_xxxxxxxxxxxx",
      endpoint: "https://api.mindee.net/v1",
      status: "connected"
    },
    {
      name: "Stripe (Paiements)",
      enabled: true,
      apiKey: "sk_live_xxxxxxxxxxxx",
      endpoint: "https://api.stripe.com/v1",
      status: "connected"
    },
    {
      name: "SendGrid (Emails)",
      enabled: false,
      apiKey: "",
      endpoint: "https://api.sendgrid.com/v3",
      status: "disconnected"
    },
  ]);

  // Configuration SMTP
  const [smtpSettings, setSmtpSettings] = useState({
    host: "smtp.gmail.com",
    port: 587,
    username: "noreply@invoicia.fr",
    password: "••••••••••••",
    fromEmail: "noreply@invoicia.fr",
    fromName: "Invoicia",
    useTLS: true,
  });

  // Configuration de sécurité
  const [securitySettings, setSecuritySettings] = useState({
    mfaRequired: false,
    sessionTimeout: 60,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    maxLoginAttempts: 5,
    ipWhitelisting: false,
    auditLogging: true,
  });

  // Webhooks
  const [webhooks, setWebhooks] = useState([
    {
      id: "wh-1",
      name: "Nouveau Client",
      url: "https://hooks.zapier.com/xxx",
      events: ["tenant.created"],
      active: true,
    },
    {
      id: "wh-2",
      name: "Facturation",
      url: "https://hooks.slack.com/xxx",
      events: ["invoice.paid", "invoice.failed"],
      active: true,
    },
  ]);

  const toggleApiKey = (apiName: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [apiName]: !prev[apiName]
    }));
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    console.log("Sauvegarde des paramètres...", {
      generalSettings,
      apiConfigs,
      smtpSettings,
      securitySettings,
      webhooks,
    });
    setHasChanges(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erreur
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Déconnecté
          </Badge>
        );
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight">Paramètres Globaux</h1>
          <p className="text-muted-foreground mt-1">
            Configuration système, API et sécurité de la plateforme
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les Modifications
          </Button>
        )}
      </div>

      {/* Alert mode maintenance */}
      {generalSettings.maintenanceMode && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Mode maintenance activé - La plateforme est inaccessible aux utilisateurs
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="apis">
            <Code className="w-4 h-4 mr-2" />
            APIs
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Tab Général */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Générale</CardTitle>
              <CardDescription>
                Paramètres de base de la plateforme SaaS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Nom de la Plateforme</Label>
                  <Input
                    id="platform-name"
                    value={generalSettings.platformName}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, platformName: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform-url">URL de la Plateforme</Label>
                  <Input
                    id="platform-url"
                    value={generalSettings.platformUrl}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, platformUrl: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-email">Email Support</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, supportEmail: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trial-days">Durée d'Essai (jours)</Label>
                  <Input
                    id="trial-days"
                    type="number"
                    value={generalSettings.defaultTrialDays}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, defaultTrialDays: parseInt(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="maintenance">Mode Maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Désactive l'accès à la plateforme pour maintenance
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => {
                    setGeneralSettings({ ...generalSettings, maintenanceMode: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base de Données</CardTitle>
              <CardDescription>Informations sur la base de données PostgreSQL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <span>PostgreSQL 15.3</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Connecté</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Taille DB</p>
                  <p className="text-sm">2.4 GB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tables</p>
                  <p className="text-sm">42</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Connexions</p>
                  <p className="text-sm">12 / 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab APIs */}
        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des APIs Externes</CardTitle>
              <CardDescription>
                Gérez les clés API et la connexion aux services externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiConfigs.map((api, index) => (
                <div key={api.name} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {api.name.includes("Banque") && <CreditCard className="h-5 w-5 text-blue-600" />}
                        {api.name.includes("OCR") && <FileText className="h-5 w-5 text-green-600" />}
                        {api.name.includes("Stripe") && <CreditCard className="h-5 w-5 text-purple-600" />}
                        {api.name.includes("Email") && <Mail className="h-5 w-5 text-orange-600" />}
                        <div>
                          <p>{api.name}</p>
                          <p className="text-xs text-muted-foreground">{api.endpoint}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(api.status)}
                      <Switch
                        checked={api.enabled}
                        onCheckedChange={(checked) => {
                          const newConfigs = [...apiConfigs];
                          newConfigs[index].enabled = checked;
                          setApiConfigs(newConfigs);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  {api.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${index}`}>Clé API</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`api-key-${index}`}
                          type={showApiKeys[api.name] ? "text" : "password"}
                          value={api.apiKey}
                          onChange={(e) => {
                            const newConfigs = [...apiConfigs];
                            newConfigs[index].apiKey = e.target.value;
                            setApiConfigs(newConfigs);
                            setHasChanges(true);
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApiKey(api.name)}
                        >
                          {showApiKeys[api.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          Tester
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variables d'Environnement</CardTitle>
              <CardDescription>Configuration des variables système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-mono text-sm space-y-1 bg-slate-50 p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NODE_ENV:</span>
                  <span>production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API_VERSION:</span>
                  <span>v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RATE_LIMIT:</span>
                  <span>1000 req/min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Email */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration SMTP</CardTitle>
              <CardDescription>
                Paramètres du serveur d'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Serveur SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={smtpSettings.host}
                    onChange={(e) => {
                      setSmtpSettings({ ...smtpSettings, host: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={smtpSettings.port}
                    onChange={(e) => {
                      setSmtpSettings({ ...smtpSettings, port: parseInt(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Nom d'utilisateur</Label>
                  <Input
                    id="smtp-user"
                    value={smtpSettings.username}
                    onChange={(e) => {
                      setSmtpSettings({ ...smtpSettings, username: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Mot de passe</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={smtpSettings.password}
                    onChange={(e) => {
                      setSmtpSettings({ ...smtpSettings, password: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">Email Expéditeur</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={smtpSettings.fromEmail}
                    onChange={(e) => {
                      setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">Nom Expéditeur</Label>
                  <Input
                    id="from-name"
                    value={smtpSettings.fromName}
                    onChange={(e) => {
                      setSmtpSettings({ ...smtpSettings, fromName: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="smtp-tls">Utiliser TLS/SSL</Label>
                  <p className="text-sm text-muted-foreground">
                    Connexion sécurisée recommandée
                  </p>
                </div>
                <Switch
                  id="smtp-tls"
                  checked={smtpSettings.useTLS}
                  onCheckedChange={(checked) => {
                    setSmtpSettings({ ...smtpSettings, useTLS: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Envoyer un Email de Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sécurité */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Sécurité</CardTitle>
              <CardDescription>
                Configuration des règles de sécurité et d'authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="mfa-required">MFA Obligatoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Forcer l'authentification à deux facteurs pour tous les admins
                  </p>
                </div>
                <Switch
                  id="mfa-required"
                  checked={securitySettings.mfaRequired}
                  onCheckedChange={(checked) => {
                    setSecuritySettings({ ...securitySettings, mfaRequired: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="audit-logging">Logs d'Audit</Label>
                  <p className="text-sm text-muted-foreground">
                    Enregistrer toutes les actions sensibles
                  </p>
                </div>
                <Switch
                  id="audit-logging"
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => {
                    setSecuritySettings({ ...securitySettings, auditLogging: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="ip-whitelist">Whitelist IP</Label>
                  <p className="text-sm text-muted-foreground">
                    Restreindre l'accès à des IP spécifiques
                  </p>
                </div>
                <Switch
                  id="ip-whitelist"
                  checked={securitySettings.ipWhitelisting}
                  onCheckedChange={(checked) => {
                    setSecuritySettings({ ...securitySettings, ipWhitelisting: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Timeout Session (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Tentatives de Connexion</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pwd-min">Longueur Min. Mot de Passe</Label>
                  <Input
                    id="pwd-min"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Notifications automatiques vers des services externes
                  </CardDescription>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-purple-600" />
                      <div>
                        <p>{webhook.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{webhook.url}</p>
                      </div>
                    </div>
                    <Switch checked={webhook.active} />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}