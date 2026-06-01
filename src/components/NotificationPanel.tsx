import { useState, useEffect } from "react";
import { Bell, X, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import type { Notification, NotificationType } from "./NotificationCenter";

interface NotificationPanelProps {
  moduleFilter?: NotificationType[];
  title?: string;
  description?: string;
  maxHeight?: string;
}

export function NotificationPanel({
  moduleFilter,
  title = "Notifications & Alertes",
  description = "Restez informé des événements importants",
  maxHeight = "h-[600px]",
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, [moduleFilter]);

  const loadNotifications = () => {
    // Données de démo - dans une vraie app, charger depuis l'API
    let allNotifications: Notification[] = [
      {
        id: "1",
        type: "invoice_overdue",
        title: "Facture en retard",
        message: "La facture #INV-2024-123 (Client: ACME Corp) est en retard de 15 jours",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "urgent",
        actionUrl: "/sales",
        actionLabel: "Voir la facture",
      },
      {
        id: "2",
        type: "cra_pending",
        title: "CRA à valider",
        message: "3 CRA sont en attente de validation pour la période du 2-8 décembre",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "high",
        actionUrl: "/cra",
        actionLabel: "Valider les CRA",
      },
      {
        id: "3",
        type: "absence_request",
        title: "Demande d'absence",
        message: "Marie Dubois a demandé un congé du 20 au 27 décembre 2024",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "medium",
        actionUrl: "/hr",
        actionLabel: "Examiner",
      },
      {
        id: "4",
        type: "payment_received",
        title: "Paiement reçu",
        message: "Paiement de 8 500€ reçu pour la facture #INV-2024-098",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "low",
        actionUrl: "/banking",
        actionLabel: "Voir le détail",
      },
      {
        id: "5",
        type: "contract_expiring",
        title: "Contrat arrivant à échéance",
        message: "Le contrat avec TechStart expire dans 30 jours",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "medium",
        actionUrl: "/pipeline",
        actionLabel: "Voir le contrat",
      },
      {
        id: "6",
        type: "signature_required",
        title: "Signature requise",
        message: "Le document 'Contrat de prestation 2025' attend votre signature",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "high",
        actionUrl: "/signature",
        actionLabel: "Signer",
      },
    ];

    // Filtrer par module si nécessaire
    if (moduleFilter && moduleFilter.length > 0) {
      allNotifications = allNotifications.filter((n) =>
        moduleFilter.includes(n.type)
      );
    }

    setNotifications(allNotifications);
  };

  const priorityColors = {
    low: "text-blue-600 bg-blue-50 border-blue-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    urgent: "text-red-600 bg-red-50 border-red-200",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification supprimée");
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      toast.info("Navigation vers: " + notification.actionUrl);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return time.toLocaleDateString("fr-FR");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {title}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "all" | "unread")}
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Non lues ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            {displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === "unread"
                    ? "Aucune notification non lue"
                    : "Aucune notification"}
                </p>
              </div>
            ) : (
              <ScrollArea className={maxHeight}>
                <div className="space-y-3">
                  {displayedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 rounded-lg transition-colors cursor-pointer",
                        priorityColors[notification.priority],
                        !notification.read && "bg-blue-50/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={cn(
                                "text-sm",
                                !notification.read && "font-semibold"
                              )}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(notification.timestamp)}
                            </span>

                            {notification.actionLabel && (
                              <Button
                                size="sm"
                                variant="link"
                                className="h-auto p-0 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                {notification.actionLabel}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {moduleFilter && moduleFilter.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Affichage filtré : seules les notifications relatives à ce module
              sont affichées. Consultez la page Notifications pour voir toutes
              les alertes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
