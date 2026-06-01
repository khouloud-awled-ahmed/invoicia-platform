import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Shield, 
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Settings,
  FileText,
  LogOut,
  Database
} from "lucide-react";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { TenantManagement } from "./TenantManagement";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { PlatformAdmins } from "./PlatformAdmins";
import { GlobalSettings } from "./GlobalSettings";
import { AuditLogs } from "./AuditLogs";

interface SuperAdminLayoutProps {
  onExit: () => void;
}

export function SuperAdminLayout({ onExit }: SuperAdminLayoutProps) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "tenants", label: "Sociétés Clientes", icon: Building2 },
    { id: "plans", label: "Packs d'Abonnement", icon: Package },
    { id: "admins", label: "Administrateurs", icon: Users },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "logs", label: "Logs & Audit", icon: FileText },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <SuperAdminDashboard />;
      case "tenants":
        return <TenantManagement />;
      case "plans":
        return <SubscriptionPlans />;
      case "admins":
        return <PlatformAdmins />;
      case "settings":
        return <GlobalSettings />;
      case "logs":
        return <AuditLogs />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-200" />
            <div>
              <h2 className="text-sm tracking-tight">SUPER ADMIN</h2>
              <p className="text-xs text-purple-200">Panneau de Contrôle</p>
            </div>
          </div>
        </div>

        <Separator className="bg-purple-700" />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-purple-700 text-white"
                    : "text-purple-100 hover:bg-purple-800"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <Separator className="bg-purple-700" />

        {/* Footer */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-purple-800 justify-start"
            onClick={onExit}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Quitter le Mode Admin
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-purple-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 hover:bg-purple-700">
              <Shield className="h-3 w-3 mr-1" />
              MODE SUPER ADMIN
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Système opérationnel</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            Retour
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}