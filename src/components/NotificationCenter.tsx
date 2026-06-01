import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, X, AlertCircle, FileText, Calendar, Users, TrendingUp, CreditCard, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { cn } from "./ui/utils";

export type NotificationType = 
  | "invoice_overdue" 
  | "cra_pending" 
  | "absence_request" 
  | "payment_received" 
  | "contract_expiring"
  | "signature_required"
  | "low_stock"
  | "budget_alert"
  | "system"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: "low" | "medium" | "high" | "urgent";
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  userId?: string;
  onNotificationClick?: (notification: Notification) => void;
}

const priorityColors = {
  low: "text-blue-600 bg-blue-50",
  medium: "text-yellow-600 bg-yellow-50",
  high: "text-orange-600 bg-orange-50",
  urgent: "text-red-600 bg-red-50",
};

const typeIcons: Record<NotificationType, any> = {
  invoice_overdue: CreditCard,
  cra_pending: Calendar,
  absence_request: Users,
  payment_received: TrendingUp,
  contract_expiring: FileText,
  signature_required: FileText,
  low_stock: AlertCircle,
  budget_alert: AlertCircle,
  system: Bell,
  info: AlertCircle,
};

export function NotificationCenter({ userId, onNotificationClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
    
    // Simuler la réception de nouvelles notifications toutes les 30 secondes
    const interval = setInterval(() => {
      // Dans une vraie app, ce serait un WebSocket ou un polling API
      checkForNewNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = () => {
    // Données de démo - dans une vraie app, charger depuis l'API
    const demoNotifications: Notification[] = [
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
        metadata: { invoiceId: "INV-2024-123", amount: 12500 }
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
        metadata: { count: 3 }
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
        metadata: { employeeName: "Marie Dubois", days: 5 }
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
        metadata: { amount: 8500, invoiceId: "INV-2024-098" }
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
        metadata: { clientName: "TechStart", daysLeft: 30 }
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
        metadata: { documentName: "Contrat de prestation 2025" }
      },
      {
        id: "7",
        type: "budget_alert",
        title: "Alerte budget",
        message: "Le budget du projet 'Refonte ERP' est consommé à 85%",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "medium",
        actionUrl: "/projects",
        actionLabel: "Voir le projet",
        metadata: { projectName: "Refonte ERP", budgetUsed: 85 }
      },
    ];

    setNotifications(demoNotifications);
  };

  const checkForNewNotifications = () => {
    // Simuler l'arrivée d'une nouvelle notification aléatoirement
    if (Math.random() > 0.7) {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: "system",
        title: "Nouvelle notification",
        message: "Vous avez une nouvelle activité dans votre ERP",
        timestamp: new Date().toISOString(),
        read: false,
        priority: "low",
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Notification toast
      toast.info(newNotification.title, {
        description: newNotification.message,
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = activeTab === "unread" 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success("Toutes les notifications ont été marquées comme lues");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification supprimée");
  };

  const deleteAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
    toast.success("Notifications lues supprimées");
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (notification.actionUrl) {
      // Dans une vraie app, naviguer vers l'URL
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0 
                    ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : "Aucune nouvelle notification"
                  }
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deleteAllRead}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer les lues
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    Toutes ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">
                    Non lues ({unreadCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="m-0">
                <ScrollArea className="h-[500px]">
                  {displayedNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {activeTab === "unread" 
                          ? "Aucune notification non lue" 
                          : "Aucune notification"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {displayedNotifications.map((notification) => {
                        const Icon = typeIcons[notification.type];
                        return (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                              !notification.read && "bg-blue-50/30"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex gap-3">
                              <div className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                priorityColors[notification.priority]
                              )}>
                                <Icon className="h-5 w-5" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className={cn(
                                    "text-sm",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {!notification.read && (
                                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
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
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Hook personnalisé pour gérer les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Afficher une toast
    toast.info(notification.title, {
      description: notification.message,
    });

    return newNotification.id;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}
