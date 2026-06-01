import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Webhook, Plus, Edit, Trash2, Copy, AlertCircle, CheckCircle, Activity, Clock, Zap, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { apiClient } from "../lib/api-client-backend";
import { AVAILABLE_EVENTS, generateWebhookSecret, type Webhook as WebhookType } from "../lib/webhooks";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

export function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [logs] = useState([]);

  useEffect(() => {
    apiClient.getWebhooks().then(res => { console.log("RAW webhooks response:", res); const data = Array.isArray(res) ? res : []; setWebhooks(data.map((w: any) => ({ ...w, id: w.id || w._id?.toString(), status: w.status || "active", events: w.events || [], successCount: w.successCount || 0, errorCount: w.errorCount || 0 }))); }).catch((e) => console.error("webhook fetch error:", e));
  }, []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCreateWebhook = async () => { try {
    await apiClient.createWebhook(formData); const updated = await apiClient.getWebhooks(); const data = Array.isArray(updated) ? updated : []; setWebhooks(data.map((w: any) => ({ ...w, id: w.id || w._id?.toString(), status: w.status || "active", events: w.events || [], successCount: w.successCount || 0, errorCount: w.errorCount || 0 })));
    setIsCreateDialogOpen(false);
    setFormData({ name: "", url: "", events: [] }); } catch(e) { console.error("CREATE WEBHOOK ERROR:", e); alert("Error: " + e.message); }
  };

  const getStatusBadge = (status: WebhookType["status"]) => {
    const config = {
      active: { label: "Actif", className: "bg-green-100 text-green-800", icon: CheckCircle },
      disabled: { label: "Désactivé", className: "bg-gray-100 text-gray-800", icon: Clock },
      error: { label: "Erreur", className: "bg-red-100 text-red-800", icon: AlertCircle },
    };
    const statusConfig = config[status] || config["active"]; const { label, className, icon: Icon } = statusConfig;
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const selectedWebhookData = webhooks.find(w => w.id === selectedWebhook);
  const webhookLogs = logs.filter(log => log.webhookId === selectedWebhook);

  const eventsByCategory = AVAILABLE_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_EVENTS>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhooks & Intégrations
              </CardTitle>
              <CardDescription>
                Configurez les webhooks pour intégrer des services tiers (Stripe, SEPA, etc.)
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau webhook
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un webhook</DialogTitle>
                  <DialogDescription>
                    Configurez un nouveau webhook pour intégrer des services tiers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookName">Nom du webhook</Label>
                    <Input
                      id="webhookName"
                      placeholder="Ex: Stripe - Paiements"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL du webhook</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://api.example.com/webhook"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Événements à écouter</Label>
                    {Object.entries(eventsByCategory).map(([category, events]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm capitalize">{category}</h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {events.map((event) => (
                            <div key={event.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={event.id}
                                checked={formData.events.includes(event.id)}
                                onCheckedChange={(checked) => {
                                  setFormData({
                                    ...formData,
                                    events: checked
                                      ? [...formData.events, event.id]
                                      : formData.events.filter(e => e !== event.id),
                                  });
                                }}
                              />
                              <label
                                htmlFor={event.id}
                                className="text-sm cursor-pointer"
                              >
                                {event.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        {category !== Object.keys(eventsByCategory)[Object.keys(eventsByCategory).length - 1] && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Un secret sera automatiquement généré pour sécuriser les communications.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateWebhook}
                      disabled={!formData.name || !formData.url || formData.events.length === 0}
                    >
                      Créer le webhook
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Événements</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{webhook.url}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{(webhook?.events?.length ?? 0)} événements</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                  <TableCell>
                    {webhook.lastTriggered ? (
                      <div className="text-sm">
                        <div>{webhook.lastTriggered.toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-muted-foreground">
                          {webhook.successCount} succès / {webhook.errorCount} erreurs
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Jamais déclenché</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedWebhook(webhook.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedWebhook && selectedWebhookData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Détails: {selectedWebhookData.name}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedWebhook(null)}>
                Fermer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="config">
              <TabsList>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="logs">
                  <Activity className="w-4 h-4 mr-2" />
                  Logs ({webhookLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>URL du webhook</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {selectedWebhookData.url}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(selectedWebhookData.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Secret de signature</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {selectedWebhookData.secret}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(selectedWebhookData.secret)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utilisez ce secret pour vérifier l'authenticité des requêtes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Événements écoutés</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedWebhookData.events.map((eventId) => {
                        const event = AVAILABLE_EVENTS.find(e => e.id === eventId);
                        return (
                          <Badge key={eventId} variant="outline">
                            <Zap className="w-3 h-3 mr-1" />
                            {event?.name || eventId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Tester le webhook
                    </Button>
                    <Button variant="outline">Régénérer le secret</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="space-y-2">
                  {webhookLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 border rounded-lg ${
                        log.status === "error" ? "border-red-200 bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.event}</Badge>
                            {log.status === "success" ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Succès
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erreur
                              </Badge>
                            )}
                            {log.statusCode && (
                              <Badge variant="outline">HTTP {log.statusCode}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.timestamp.toLocaleString('fr-FR')} · Durée: {log.duration}ms
                          </div>
                          {log.error && (
                            <div className="text-sm text-red-600 mt-2">{log.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Intégrations populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Stripe",
                description: "Gestion des paiements en ligne",
                logo: "💳",
              },
              {
                name: "SEPA",
                description: "Virements bancaires européens",
                logo: "🏦",
              },
              {
                name: "Slack",
                description: "Notifications d'équipe",
                logo: "💬",
              },
            ].map((integration) => (
              <div key={integration.name} className="p-4 border rounded-lg">
                <div className="text-3xl mb-2">{integration.logo}</div>
                <h4 className="mb-1">{integration.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {integration.description}
                </p>
                <Button variant='outline' size='sm' className='w-full' onClick={() => { setFormData({ name: integration.name + ' - Integration', url: '', events: [] }); setIsCreateDialogOpen(true); }}>Configurer</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





















