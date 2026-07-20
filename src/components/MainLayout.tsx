import { useState, useEffect } from "react";
import { HRChatbot } from "./HRChatbot";
import { apiClient } from "../lib/api-client-backend";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { useIsMobile } from "./ui/use-mobile";
import {
  LayoutDashboard, FileText, Calendar, Users, FolderOpen, CreditCard,
  Building2, Settings, LogOut, Bell, ChevronDown, ChevronRight, Shield,
  Receipt, Calculator, Award, FolderKanban, TrendingUp, Zap, FileSignature,
  AlertTriangle, Briefcase, User as UserIcon, Menu, Activity, DollarSign, FileX,
} from "lucide-react";
import { Dashboard } from "./Dashboard";
import { SalesManagement } from "./SalesManagement";
import { HRComplete } from "./HRComplete";
import { GEDManagement } from "./GEDManagement";
import { PaymentManagement } from "./PaymentManagement";
import { UnifiedSupplierManagement } from "./UnifiedSupplierManagement";
import { BankingModule } from "./BankingModule";
import { BankImportPage } from "../pages/BankImportPage";
import { ModuleSettingsPage } from "../pages/ModuleSettingsPage";
import { CompanySettingsProvider } from "../contexts/CompanySettingsContext";
import { UserManagement } from "./UserManagement";
import { Settings as SettingsComponent } from "./Settings";
import { ExpenseManagement } from "./ExpenseManagement";
import { AccountingComplete } from "./AccountingComplete";
import { CVTechManagement } from "./CVTechManagement";
import { ProjectManagement } from "./ProjectManagement";
import { PipelineCommercial } from "./PipelineCommercial";
import { AutoInvoicing } from "./AutoInvoicing";
import { ElectronicSignature } from "./ElectronicSignature";
import { UserRoleManagement } from "./UserRoleManagement";
import { NotificationCenter } from "./NotificationCenter";
import { AlertsManager } from "./AlertsManager";
import { TechnicalMonitoring } from "./TechnicalMonitoring";
import { NotificationSettings } from "./NotificationSettings";
import { NotificationsPage } from "./NotificationsPage";
import { ClientManagement } from "./ClientManagement";
import { BIDashboard } from "./BIDashboard";
import { IntervenantsManagement } from "./IntervenantsManagement";
import type { User } from "../lib/auth";

interface MainLayoutProps {
  user: User;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
}

export function MainLayout({ user, onSwitchToAdmin, onLogout }: MainLayoutProps) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  const getCurrentPageFromPath = () => {
    if (pathname === "/my-leaves") return "my-leaves";
    if (pathname === "/my-profile") return "my-profile";
    if (pathname === "/banking/import") return "banking-import";
    const routeMap: Record<string, string> = {
      "/dashboard": "dashboard", "/sales": "sales", "/credit-notes": "credit-notes",
      "/expenses": "expenses", "/suppliers": "suppliers", "/projects": "projects",
      "/hr": "hr", "/ged": "ged", "/payments": "payments", "/clients": "clients",
      "/intervenants": "intervenants", "/banking": "banking", "/users": "users",
      "/settings": "settings", "/accounting": "accounting", "/cvtech": "cvtech",
      "/pipeline": "pipeline", "/autoinvoicing": "autoinvoicing", "/signature": "signature",
      "/notifications": "notifications", "/alerts": "alerts", "/monitoring": "monitoring",
      "/bi-dashboard": "bi-dashboard",
    };
    if (routeMap[pathname]) return routeMap[pathname];
    const segments = pathname.split("/").filter(s => s);
    if (segments.length > 0) return segments[0];
    return "dashboard";
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPageFromPath());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [billingMenuOpen, setBillingMenuOpen] = useState(false);
  const [moduleFlags, setModuleFlags] = useState<Record<string, boolean>>({});
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const newPage = getCurrentPageFromPath();
    if (newPage !== currentPage) setCurrentPage(newPage);
  }, [pathname]);

  useEffect(() => {
    const loadTenantData = async () => {
      if (user?.role === "PLATFORM_ADMIN" || !user?.tenantId) {
        setModuleFlags({});
        setUserPermissions([]);
        setPermissionsLoaded(true);
        return;
      }
      try {
        const tenant = await apiClient.getTenant(user.tenantId);
        if (tenant.moduleFlags && typeof tenant.moduleFlags === "object") {
          setModuleFlags(tenant.moduleFlags);
        } else if (tenant.modules && Array.isArray(tenant.modules)) {
          setModuleFlags({
            module_invoicing: tenant.modules.includes("SALES"),
            module_suppliers: tenant.modules.includes("PURCHASES"),
            module_accounting: tenant.modules.includes("ACCOUNTING"),
            module_projects: tenant.modules.includes("PROJECTS"),
            module_hr: tenant.modules.includes("HR"),
            module_ged: tenant.modules.includes("GED"),
            module_crm: tenant.modules.includes("CRM"),
            module_banking: tenant.modules.includes("BANKING"),
            module_signature: tenant.modules.includes("SIGNATURE"),
            module_payments: tenant.modules.includes("PAYMENTS"),
            module_clients: tenant.modules.includes("CLIENTS"),
            module_cvtech: tenant.modules.includes("CVTECH"),
          });
        } else {
          setModuleFlags({});
        }

        // TENANT_ADMIN always has full access, no need to fetch role permissions
        if (user.role === "TENANT_ADMIN") {
          setUserPermissions([]);
          setPermissionsLoaded(true);
          return;
        }

        const roleSlug = (user as any).roleSlug;

        if (!roleSlug) {
          // No role assigned -> fail safe: no module access
          setUserPermissions([{ module: "__none__", actions: {} }]);
          setPermissionsLoaded(true);
          return;
        }

        const roles = await apiClient.getRoles();
        const matchedRole = roles.find((r: any) => r.slug === roleSlug);

        if (matchedRole && Array.isArray(matchedRole.permissions)) {
          setUserPermissions(matchedRole.permissions);
        } else {
          // Role slug not found in DB -> fail safe: no module access
          setUserPermissions([{ module: "__none__", actions: {} }]);
        }
        setPermissionsLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setModuleFlags({});
        setUserPermissions([{ module: "__none__", actions: {} }]);
        setPermissionsLoaded(true);
      }
    };
    loadTenantData();
  }, [user?.tenantId, user?.role, (user as any)?.roleSlug]);

  useEffect(() => {
    if (!isMobile && sidebarOpen) setSidebarOpen(false);
  }, [isMobile, sidebarOpen]);

  const handleSheetOpenChange = (open: boolean) => {
    if (open && !isMobile) return;
    setSidebarOpen(open);
  };

  const SOCLE_IDS = new Set(["dashboard"]);

  const getModuleKeyForPage = (pageId: string): string | null => {
    const map: Record<string, string> = {
      sales: "module_invoicing", "credit-notes": "module_invoicing",
      expenses: "module_invoicing", suppliers: "module_suppliers",
      clients: "module_clients", pipeline: "module_crm",
      autoinvoicing: "module_invoicing", accounting: "module_accounting",
      projects: "module_projects", hr: "module_hr", cvtech: "module_cvtech",
      ged: "module_ged", signature: "module_signature", payments: "module_payments",
      intervenants: "module_hr", banking: "module_banking",
    };
    return map[pageId] ?? null;
  };

  const hasModule = (moduleKey: string | null): boolean => {
    if (!moduleKey) return true;
    if (Object.keys(moduleFlags).length === 0) return true;
    return !!moduleFlags[moduleKey];
  };

  // The roles stored in MongoDB hold `permissions` as an array of French
  // display-name strings (e.g. "Comptabilité", "Ventes & Factures") rather
  // than structured { module, actions } objects. This map translates each
  // page id to the exact label(s) that grant access to it.
  const pageToPermissionLabels: Record<string, string[]> = {
    dashboard: ["Tableau de bord"],
    sales: ["Ventes & Factures"],
    "credit-notes": ["Ventes & Factures"],
    autoinvoicing: ["Ventes & Factures"],
    expenses: ["Achats & Fournisseurs"],
    suppliers: ["Achats & Fournisseurs"],
    accounting: ["Comptabilité"],
    banking: ["Banque"],
    hr: ["RH & Absences"],
    intervenants: ["RH & Absences"],
    cvtech: ["RH & Absences"],
    projects: ["Projets"],
    clients: ["Clients"],
    ged: ["GED (Documents)"],
    signature: ["Signature électronique"],
    pipeline: ["CRM (Pipeline)"],
    users: ["Utilisateurs & Rôles"],
    settings: ["Paramètres"],
    "bi-dashboard": ["Reporting & Analytics"],
    notifications: ["Tableau de bord"],
    alerts: ["Tableau de bord"],
    monitoring: ["Paramètres"],
    payments: ["Comptabilité"],
  };

  const hasPermission = (pageId: string): boolean => {
    if (user?.role === "TENANT_ADMIN") return true;
    // While permissions are still loading, hide everything except the always-visible socle
    // to avoid a flash of full access before the real permissions arrive.
    if (!permissionsLoaded) return SOCLE_IDS.has(pageId);

    const requiredLabels = pageToPermissionLabels[pageId];
    if (!requiredLabels) return true;

    return requiredLabels.some((label) => userPermissions.includes(label));
  };

  const userRole = (user?.role as string) || "USER";
  const isConsultant = userRole === "CONSULTANT";

  type SubMenuItem = { id: string; label: string; icon: any; color: string };
  type MenuItem = { id: string; label: string; icon: any; color: string; hasSubMenu?: boolean; subMenu?: SubMenuItem[] };

  const consultantMenuItems: MenuItem[] = [
    { id: "my-leaves", label: "Mes Congés", icon: Calendar, color: "#06b6d4" },
    { id: "my-profile", label: "Mon Profil", icon: UserIcon, color: "#8b5cf6" },
  ];

  const ALL_ADMIN_MENU_ITEMS: MenuItem[] = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard, color: "#6d28d9" },
    { id: "bi-dashboard", label: "Cockpit de Gestion", icon: TrendingUp, color: "#3b82f6" },
    {
      id: "billing", label: "Facturation", icon: DollarSign, color: "#10b981", hasSubMenu: true,
      subMenu: [
        { id: "sales", label: "Factures Clients", icon: FileText, color: "#10b981" },
        { id: "credit-notes", label: "Avoirs", icon: FileX, color: "#10b981" },
        { id: "expenses", label: "Dépenses", icon: Receipt, color: "#10b981" },
        { id: "suppliers", label: "Fournisseurs", icon: Building2, color: "#10b981" },
      ],
    },
    { id: "accounting", label: "Comptabilité", icon: Calculator, color: "#f59e0b" },
    { id: "projects", label: "Projets", icon: FolderKanban, color: "#8b5cf6" },
    { id: "pipeline", label: "Pipeline CRM", icon: TrendingUp, color: "#ec4899" },
    { id: "autoinvoicing", label: "Facturation Auto", icon: Zap, color: "#f97316" },
    { id: "signature", label: "Signature Électronique", icon: FileSignature, color: "#06b6d4" },
    { id: "hr", label: "RH & Absences", icon: Users, color: "#06b6d4" },
    { id: "cvtech", label: "CV Tech", icon: Award, color: "#8b5cf6" },
    { id: "ged", label: "GED", icon: FolderOpen, color: "#f97316" },
    { id: "payments", label: "Paiements", icon: CreditCard, color: "#10b981" },
    { id: "clients", label: "Clients", icon: Briefcase, color: "#3b82f6" },
    { id: "intervenants", label: "Intervenants", icon: UserIcon, color: "#ec4899" },
    { id: "banking", label: "Banque", icon: CreditCard, color: "#10b981" },
    { id: "users", label: "Utilisateurs", icon: Users, color: "#6d28d9" },
    { id: "settings", label: "Paramètres", icon: Settings, color: "#6b7280" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "#f59e0b" },
    { id: "alerts", label: "Alertes", icon: AlertTriangle, color: "#ef4444" },
    { id: "monitoring", label: "Monitoring Technique", icon: Activity, color: "#3b82f6" },
  ];

  const filteredAdminMenuItems = ALL_ADMIN_MENU_ITEMS.filter((item) => {
    if (SOCLE_IDS.has(item.id)) return true;
    if (item.hasSubMenu && item.subMenu) {
      return item.subMenu.filter(sub => hasModule(getModuleKeyForPage(sub.id)) && hasPermission(sub.id)).length > 0;
    }
    return hasModule(getModuleKeyForPage(item.id)) && hasPermission(item.id);
  });

  const menuItems = isConsultant ? consultantMenuItems : filteredAdminMenuItems;

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard />;
      case "bi-dashboard": return <BIDashboard />;
      case "my-leaves": return <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Mes Congés</h1></div>;
      case "my-profile": return <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Mon Profil</h1></div>;
      case "sales": return <SalesManagement />;
      case "credit-notes": return <SalesManagement initialView="creditNotes" />;
      case "expenses": return <ExpenseManagement />;
      case "suppliers": return <UnifiedSupplierManagement />;
      case "hr": return <HRComplete />;
      case "ged": return <GEDManagement />;
      case "payments": return <PaymentManagement />;
      case "clients": return <ClientManagement />;
      case "intervenants": return <IntervenantsManagement />;
      case "banking": return <BankingModule />;
      case "banking-import": return <BankImportPage />;
      case "users": return <UserRoleManagement />;
      case "settings": return <CompanySettingsProvider><SettingsComponent /></CompanySettingsProvider>;
      case "settings-modules": return <ModuleSettingsPage />;
      case "accounting": return <AccountingComplete />;
      case "cvtech": return <CVTechManagement />;
      case "projects": return <ProjectManagement />;
      case "pipeline": return <PipelineCommercial />;
      case "autoinvoicing": return <AutoInvoicing />;
      case "signature": return <ElectronicSignature />;
      case "notifications": return <NotificationsPage />;
      case "alerts": return <AlertsManager />;
      case "monitoring": return <TechnicalMonitoring />;
      default: return <Dashboard />;
    }
  };

  const getUserInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const getRoleBadge = (role: string) => {
    const userRoleSlug = (user as any).roleSlug;
    const slugLabels: Record<string, string> = {
      directeur_ceo: "Directeur / CEO", comptable: "Comptable", responsable_rh: "Responsable RH",
      responsable_commercial: "Responsable Commercial", super_admin: "Super Admin",
      salarie_consultant: "Salarié / Consultant", admin_plateforme: "Admin Plateforme",
      daf: "DAF", comptable_externe: "Comptable Externe", commercial: "Commercial",
      chef_projet: "Chef de Projet", intervenant_externe: "Intervenant Externe",
      client_role: "Client", fournisseur: "Fournisseur",
    };
    const roleLabels: Record<string, string> = {
      TENANT_ADMIN: "Admin", MANAGER: "Manager", RH: "Responsable RH",
      CONSULTANT: "Consultant", PLATFORM_ADMIN: "Platform Admin",
    };
    const roleColors: Record<string, string> = {
      TENANT_ADMIN: "bg-purple-600", MANAGER: "bg-blue-600",
      RH: "bg-green-600", CONSULTANT: "bg-gray-600", PLATFORM_ADMIN: "bg-red-600",
    };
    return <Badge className={roleColors[role] || "bg-gray-600"}>{slugLabels[userRoleSlug] || roleLabels[role] || role}</Badge>;
  };

  const getRouteForPage = (pageId: string) => {
    const routeMap: Record<string, string> = {
      "my-leaves": "/my-leaves", "my-profile": "/my-profile", dashboard: "/dashboard",
      sales: "/sales", "credit-notes": "/credit-notes", expenses: "/expenses",
      suppliers: "/suppliers", projects: "/projects", hr: "/hr", ged: "/ged",
      payments: "/payments", clients: "/clients", intervenants: "/intervenants",
      banking: "/banking", users: "/users", settings: "/settings", accounting: "/accounting",
      cvtech: "/cvtech", pipeline: "/pipeline", autoinvoicing: "/autoinvoicing",
      signature: "/signature", notifications: "/notifications", alerts: "/alerts",
      monitoring: "/monitoring", "bi-dashboard": "/bi-dashboard",
    };
    return routeMap[pageId] || `/${pageId}`;
  };

  const SidebarContent = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(109,40,217,0.3)", flexShrink: 0
            }}>
              <FileText style={{ width: "18px", height: "18px", color: "white" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "17px", fontWeight: "800", color: "#1e1b4b", letterSpacing: "-0.5px", margin: 0 }}>Invoicia</h1>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
                {user?.role === "PLATFORM_ADMIN" ? "Super Admin" : "Platform SaaS"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            if (item.id === "monitoring" && user.role !== "TENANT_ADMIN" && user.role !== "PLATFORM_ADMIN") return null;

            const Icon = item.icon;
            const color = item.color || "#6d28d9";
            const isActive = currentPage === item.id;
            const hasSubMenu = item.hasSubMenu && item.subMenu;
            const isBillingActive = !!(hasSubMenu && item.subMenu?.some(sub => currentPage === sub.id));

            const btnBase: React.CSSProperties = {
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "7px 10px", borderRadius: "8px", border: "none", cursor: "pointer",
              fontSize: "13px", transition: "all 0.15s", textAlign: "left" as const,
              marginBottom: "2px",
            };

            if (hasSubMenu) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setBillingMenuOpen(!billingMenuOpen)}
                    style={{
                      ...btnBase,
                      background: (isBillingActive || billingMenuOpen) ? "#f3f4f6" : "transparent",
                      color: (isBillingActive || billingMenuOpen) ? color : "#6b7280",
                      fontWeight: (isBillingActive || billingMenuOpen) ? "600" : "400",
                      justifyContent: "space-between",
                    }}
                    onMouseEnter={e => { if (!isBillingActive && !billingMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                    onMouseLeave={e => { if (!isBillingActive && !billingMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                        background: (isBillingActive || billingMenuOpen) ? color : "#f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon style={{ width: "14px", height: "14px", color: (isBillingActive || billingMenuOpen) ? "white" : color }} />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {billingMenuOpen
                      ? <ChevronDown style={{ width: "13px", height: "13px" }} />
                      : <ChevronRight style={{ width: "13px", height: "13px" }} />
                    }
                  </button>
                  {billingMenuOpen && item.subMenu && (
                    <div style={{ marginLeft: "14px", paddingLeft: "10px", borderLeft: "2px solid #f3f4f6", marginBottom: "4px" }}>
                      {item.subMenu
                        .filter(sub => hasModule(getModuleKeyForPage(sub.id)) && hasPermission(sub.id))
                        .map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubActive = currentPage === subItem.id;
                          const subColor = subItem.color || "#10b981";
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => { window.location.href = `/${subItem.id}`; setSidebarOpen(false); }}
                              style={{
                                ...btnBase,
                                background: isSubActive ? subColor + "15" : "transparent",
                                color: isSubActive ? subColor : "#6b7280",
                                fontWeight: isSubActive ? "600" : "400",
                              }}
                              onMouseEnter={e => { if (!isSubActive) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                              onMouseLeave={e => { if (!isSubActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                            >
                              <SubIcon style={{ width: "13px", height: "13px", color: isSubActive ? subColor : "#9ca3af", flexShrink: 0 }} />
                              <span style={{ fontSize: "12px" }}>{subItem.label}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => { window.location.href = getRouteForPage(item.id); setSidebarOpen(false); }}
                style={{
                  ...btnBase,
                  background: isActive ? "#f3f4f6" : "transparent",
                  color: isActive ? color : "#6b7280",
                  fontWeight: isActive ? "600" : "400",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                  background: isActive ? color : "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: "14px", height: "14px", color: isActive ? "white" : color }} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
              background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "11px", fontWeight: "700"
            }}>
              {getUserInitials(user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "12px", color: "#1f2937", fontWeight: "600", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>
      <div className="flex min-h-screen bg-gray-50">
        {!isMobile && (
          <aside style={{
            width: "240px", flexShrink: 0, background: "white",
            display: "flex", flexDirection: "column",
            borderRight: "1px solid #f3f4f6", boxShadow: "2px 0 8px rgba(0,0,0,0.04)"
          }}>
            <SidebarContent />
          </aside>
        )}

        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={handleSheetOpenChange} modal={false}>
            <SheetContent side="left" className="w-64 p-0 sm:w-80" id="mobile-sidebar" aria-label="Menu de navigation">
              <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
              <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-lg md:text-xl font-semibold truncate" style={{ color: "#1e1b4b" }}>
                {(() => {
                  const currentItem = menuItems.find(item => item.id === currentPage);
                  if (currentItem) return currentItem.label;
                  const billingItem = menuItems.find(item => item.id === "billing");
                  const subItem = billingItem?.subMenu?.find(sub => sub.id === currentPage);
                  if (subItem) return subItem.label;
                  return "Tableau de Bord";
                })()}
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <NotificationCenter
                userId={user.id}
                onNotificationClick={(notification) => {
                  if (notification.actionUrl) {
                    const pageMatch = notification.actionUrl.match(/\/(\w+)/);
                    if (pageMatch && pageMatch[1]) setCurrentPage(pageMatch[1]);
                  }
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", color: "white", fontSize: "11px", fontWeight: "700" }}>
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm" style={{ color: "#374151" }}>{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="pt-1">{getRoleBadge(user.role)}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentPage("settings")}>
                    <Settings className="mr-2 h-4 w-4" /> Paramètres
                  </DropdownMenuItem>
                  {user.role === "super_admin" && onSwitchToAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onSwitchToAdmin}>
                        <Shield className="mr-2 h-4 w-4" /> Panneau Super-Admin
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
      <HRChatbot />
    </>
  );
}