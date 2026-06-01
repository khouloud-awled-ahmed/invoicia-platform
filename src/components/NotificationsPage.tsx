import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { NotificationPanel } from "./NotificationPanel";
import { NotificationSettings } from "./NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Bell, Settings } from "lucide-react";

export function NotificationsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1>Centre de notifications</h1>
        <p className="text-muted-foreground">
          Gérez toutes vos notifications et alertes en un seul endroit
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationPanel 
            title="Toutes les notifications"
            description="Consultez toutes vos notifications et alertes importantes"
            maxHeight="h-[700px]"
          />
        </TabsContent>

        <TabsContent value="settings">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
