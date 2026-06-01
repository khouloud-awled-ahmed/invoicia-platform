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
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  FolderOpen,
  CreditCard,
  Building2,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ChevronRight,
  Shield,
  Receipt,
  Calculator,
  Award,
  FolderKanban,
  TrendingUp,
  Zap,
  FileSignature,
  AlertTriangle,
  Briefcase,
  User as UserIcon,
  Menu,
  Activity,
  DollarSign,
  FileX,
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
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const getCurrentPageFromPath = () => {
    if (pathname === '/my-leaves') return 'my-leaves';
    if (pathname === '/my-profile') return 'my-profile';
    if (pathname === '/banking/import') return 'banking-import';

    const routeMap: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/sales': 'sales',
      '/credit-notes': 'credit-notes',
      '/expenses': 'expenses',
      '/suppliers': 'suppliers',
      '/projects': 'projects',
      '/hr': 'hr',
      '/ged': 'ged',
      '/payments': 'payments',
      '/clients': 'clients',
      '/intervenants': 'intervenants',
      '/banking': 'banking',
      '/users': 'users',
      '/settings': 'settings',
      '/accounting': 'accounting',
      '/cvtech': 'cvtech',
      '/pipeline': 'pipeline',
      '/autoinvoicing': 'autoinvoicing',
      '/signature': 'signature',
      '/notifications': 'notifications',
      '/alerts': 'alerts',
      '/monitoring': 'monitoring',
      '/bi-dashboard': 'bi-dashboard',
    };

    if (routeMap[pathname]) return routeMap[pathname];

    const segments = pathname.split('/').filter(s => s);
    if (segments.length > 0) return segments[0];

    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPageFromPath());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [billingMenuOpen, setBillingMenuOpen] = useState(false);
  const [moduleFlags, setModuleFlags] = useState<Record<string, boolean>>({});
  // ✅ NEW: user permissions from DB
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const newPage = getCurrentPageFromPath();
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [pathname]);

  // ✅ UPDATED: Load both modules AND role permissions
  useEffect(() => {
    const loadTenantData = async () => {
      if (user?.role === 'PLATFORM_ADMIN' || !user?.tenantId) {
        setModuleFlags({});
        setUserPermissions([]);
        return;
      }
      try {
        // Load tenant modules
       const tenant = await apiClient.getTenant(user.tenantId);
        if (tenant.moduleFlags && typeof tenant.moduleFlags === 'object') {
        setModuleFlags(tenant.moduleFlags);
        } else if (tenant.modules && Array.isArray(tenant.modules)) {
  // Convert modules array to moduleFlags object
      const flags: Record<string, boolean> = {
      module_invoicing: tenant.modules.includes('SALES'),
      module_suppliers: tenant.modules.includes('PURCHASES'),
      module_accounting: tenant.modules.includes('ACCOUNTING'),
      module_projects: tenant.modules.includes('PROJECTS'),
      module_hr: tenant.modules.includes('HR'),
      module_ged: tenant.modules.includes('GED'),
      module_crm: tenant.modules.includes('CRM'),
      module_banking: tenant.modules.includes('BANKING'),
      module_signature: tenant.modules.includes('SIGNATURE'),
      module_payments: tenant.modules.includes('PAYMENTS'),
      module_clients: tenant.modules.includes('CLIENTS'),
      module_cvtech: tenant.modules.includes('CVTECH'),
    };
    setModuleFlags(flags);
    } else {
      setModuleFlags({});
    }

      // Load role permissions from DB
       // const roles = await apiClient.getRoles();
// TENANT_ADMIN et ADMIN voient tout
      if (['TENANT_ADMIN', 'ADMIN', 'PLATFORM_ADMIN'].includes(user.role)) {
        setUserPermissions([]);
        return;
      }

      // Permissions locales par rôle
      const rolePermissionsMap: Record<string, any[]> = {
        'RH': [
          { module: 'dashboard', actions: { view: true } },
          { module: 'hr', actions: { view: true, create: true, edit: true, delete: true } },
          { module: 'users', actions: { view: true, create: true, edit: true } },
          { module: 'settings', actions: { view: true } },
        ],
        'MANAGER': [
          { module: 'dashboard', actions: { view: true } },
          { module: 'projects', actions: { view: true, create: true, edit: true } },
          { module: 'hr', actions: { view: true, create: true, edit: true } },
          { module: 'clients', actions: { view: true, create: true, edit: true } },
          { module: 'ged', actions: { view: true, create: true } },
          { module: 'signature', actions: { view: true, create: true } },
          { module: 'crm', actions: { view: true, create: true, edit: true } },
          { module: 'users', actions: { view: true } },
          { module: 'settings', actions: { view: true } },
        ],
        'CONSULTANT': [],
      };

      const permissions = rolePermissionsMap[user.role] || [];
      setUserPermissions(permissions);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setModuleFlags({});
        setUserPermissions([]);
      }
    };
    loadTenantData();
  }, [user?.tenantId, user?.role]);

  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  const handleSheetOpenChange = (open: boolean) => {
    if (open && !isMobile) return;
    setSidebarOpen(open);
  };

  const SOCLE_IDS = new Set(['dashboard', 'settings', 'users']);

  const getModuleKeyForPage = (pageId: string): string | null => {
    const map: Record<string, string> = {
      sales: 'module_invoicing',
      'credit-notes': 'module_invoicing',
      expenses: 'module_invoicing',
      suppliers: 'module_suppliers',
      clients: 'module_clients',
      pipeline: 'module_crm',
      autoinvoicing: 'module_invoicing',
      accounting: 'module_accounting',
      projects: 'module_projects',
      hr: 'module_hr',
      cvtech: 'module_cvtech',
      ged: 'module_ged',
      signature: 'module_signature',
      payments: 'module_payments',
      intervenants: 'module_hr',
      banking: 'module_banking',
    };
    return map[pageId] ?? null;
  };

  const hasModule = (moduleKey: string | null): boolean => {
    if (!moduleKey) return true;
    if (Object.keys(moduleFlags).length === 0) return true;
    return !!moduleFlags[moduleKey];
  };

  // ✅ NEW: Check if user has permission to view a page
  const hasPermission = (pageId: string): boolean => {
    // TENANT_ADMIN always has full access
    if (user?.role === 'TENANT_ADMIN') return true;
    // If no permissions loaded, allow access (fallback)
    if (userPermissions.length === 0) return true;

    // Map page ID to permission module name
    const pageToModule: Record<string, string> = {
      dashboard: 'dashboard',
      sales: 'sales',
      'credit-notes': 'sales',
      expenses: 'purchases',
      suppliers: 'purchases',
      accounting: 'accounting',
      banking: 'banking',
      hr: 'hr',
      projects: 'projects',
      clients: 'clients',
      ged: 'ged',
      signature: 'signature',
      pipeline: 'crm',
      autoinvoicing: 'sales',
      users: 'users',
      settings: 'settings',
      notifications: 'dashboard',
      alerts: 'dashboard',
      monitoring: 'settings',
      cvtech: 'hr',
      payments: 'accounting',
      intervenants: 'hr',
    };

    const module = pageToModule[pageId];
    if (!module) return true;

    const perm = userPermissions.find((p: any) => p.module === module);
    return perm?.actions?.view === true;
  };

  const userRole = (user?.role as string) || 'USER';
  const isConsultant = userRole === 'CONSULTANT';

  type SubMenuItem = { id: string; label: string; icon: any };
  type MenuItem = { id: string; label: string; icon: any; hasSubMenu?: boolean; subMenu?: SubMenuItem[] };

  const consultantMenuItems: MenuItem[] = [
    { id: "my-leaves", label: "Mes Congés", icon: Calendar },
    { id: "my-profile", label: "Mon Profil", icon: UserIcon },
  ];

  const ALL_ADMIN_MENU_ITEMS: MenuItem[] = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "bi-dashboard", label: "Cockpit de Gestion", icon: TrendingUp },
    {
      id: "billing",
      label: "Facturation",
      icon: DollarSign,
      hasSubMenu: true,
      subMenu: [
        { id: "sales", label: "Factures Clients", icon: FileText },
        { id: "credit-notes", label: "Avoirs", icon: FileX },
        { id: "expenses", label: "Dépenses", icon: Receipt },
        { id: "suppliers", label: "Fournisseurs", icon: Building2 },
      ],
    },
    { id: "accounting", label: "Comptabilité", icon: Calculator },
    { id: "projects", label: "Projets", icon: FolderKanban },
    { id: "pipeline", label: "Pipeline CRM", icon: TrendingUp },
    { id: "autoinvoicing", label: "Facturation Auto", icon: Zap },
    { id: "signature", label: "Signature Électronique", icon: FileSignature },
    { id: "hr", label: "RH & Absences", icon: Users },
    { id: "cvtech", label: "CV Tech", icon: Award },
    { id: "ged", label: "GED", icon: FolderOpen },
    { id: "payments", label: "Paiements", icon: CreditCard },
    { id: "clients", label: "Clients", icon: Briefcase },
    { id: "intervenants", label: "Intervenants", icon: UserIcon },
    { id: "banking", label: "Banque", icon: CreditCard },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "alerts", label: "Alertes", icon: AlertTriangle },
    { id: "monitoring", label: "Monitoring Technique", icon: Activity },
  ];

  // ✅ UPDATED: Filter by both moduleFlags AND role permissions
  const filteredAdminMenuItems = ALL_ADMIN_MENU_ITEMS.filter((item) => {
    if (SOCLE_IDS.has(item.id)) return true;
    if (item.hasSubMenu && item.subMenu) {
      const visibleSub = item.subMenu.filter(
        (sub) => hasModule(getModuleKeyForPage(sub.id)) && hasPermission(sub.id)
      );
      return visibleSub.length > 0;
    }
    return hasModule(getModuleKeyForPage(item.id)) && hasPermission(item.id);
  });

  const menuItems = isConsultant ? consultantMenuItems : filteredAdminMenuItems;

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard />;
      case "bi-dashboard": return <BIDashboard />;
      case "my-leaves": return <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Mes Congés</h1><p className="text-muted-foreground mt-2">Fonctionnalité à venir</p></div>;
      case "my-profile": return <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Mon Profil</h1><p className="text-muted-foreground mt-2">Fonctionnalité à venir</p></div>;
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

  const getUserInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

 const getRoleBadge = (role: string) => {
  const userRoleSlug = (user as any).roleSlug;

  const slugLabels: { [key: string]: string } = {
    ceo: "Directeur / CEO",
    accountant: "Comptable",
    hr_manager: "Responsable RH",
    sales_manager: "Responsable Commercial",
    super_admin: "Super Admin",
    employee: "Salarié / Consultant",
    platform_admin: "Admin Plateforme",
    daf: "DAF",
    external_accountant: "Comptable Externe",
    sales_rep: "Commercial",
    project_manager: "Chef de Projet",
    external_contractor: "Intervenant Externe",
    client_role: "Client",
    supplier_role: "Fournisseur",
  };

  const roleLabels: { [key: string]: string } = {
    TENANT_ADMIN: "Admin",
    MANAGER: "Manager",
    RH: "Responsable RH",
    CONSULTANT: "Consultant",
    PLATFORM_ADMIN: "Platform Admin",
  };

  const roleColors: { [key: string]: string } = {
    TENANT_ADMIN: "bg-purple-600",
    MANAGER: "bg-blue-600",
    RH: "bg-green-600",
    CONSULTANT: "bg-gray-600",
    PLATFORM_ADMIN: "bg-red-600",
  };

  const label = slugLabels[userRoleSlug] || roleLabels[role] || role;

  return (
    <Badge className={roleColors[role] || "bg-gray-600"}>
      {label}
    </Badge>
  );
};
  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
          <h1 className="text-lg font-semibold tracking-tight">Invoicia</h1>
          <p className="text-xs text-muted-foreground">
          {user?.role === 'PLATFORM_ADMIN' ? 'Super Admin' : 'Platform SaaS'}
         </p>
        </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.id === "monitoring" && user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
            return null;
          }

          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const hasSubMenu = item.hasSubMenu && item.subMenu;
          const isBillingActive = hasSubMenu && item.subMenu?.some(subItem => currentPage === subItem.id);

          if (hasSubMenu) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => setBillingMenuOpen(!billingMenuOpen)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isBillingActive || billingMenuOpen ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {billingMenuOpen ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                {billingMenuOpen && item.subMenu && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.subMenu
                      .filter((subItem) => hasModule(getModuleKeyForPage(subItem.id)) && hasPermission(subItem.id))
                      .map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = currentPage === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              window.location.href = `/${subItem.id}`;
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                              isSubActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <SubIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          }

          const getRouteForPage = (pageId: string) => {
            const routeMap: Record<string, string> = {
              'my-leaves': '/my-leaves', 'my-profile': '/my-profile',
              'dashboard': '/dashboard', 'sales': '/sales',
              'credit-notes': '/credit-notes', 'expenses': '/expenses',
              'suppliers': '/suppliers', 'projects': '/projects',
              'hr': '/hr', 'ged': '/ged', 'payments': '/payments',
              'clients': '/clients', 'intervenants': '/intervenants',
              'banking': '/banking', 'users': '/users', 'settings': '/settings',
              'accounting': '/accounting', 'cvtech': '/cvtech',
              'pipeline': '/pipeline', 'autoinvoicing': '/autoinvoicing',
              'signature': '/signature', 'notifications': '/notifications',
              'alerts': '/alerts', 'monitoring': '/monitoring',
              'bi-dashboard': '/bi-dashboard',
            };
            return routeMap[pageId] || `/${pageId}`;
          };

          return (
            <button
              key={item.id}
              onClick={() => {
                window.location.href = getRouteForPage(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
    <div className="flex min-h-screen bg-gray-50">
      {!isMobile && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={handleSheetOpenChange} modal={false}>
          <SheetContent
            side="left"
            className="w-64 p-0 sm:w-80"
            id="mobile-sidebar"
            aria-label="Menu de navigation"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full bg-white">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-lg md:text-xl font-semibold truncate">
              {(() => {
                const currentItem = menuItems.find((item) => item.id === currentPage);
                if (currentItem) return currentItem.label;
                const billingItem = menuItems.find((item) => item.id === "billing");
                const subItem = billingItem?.subMenu?.find((sub) => sub.id === currentPage);
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
                  if (pageMatch && pageMatch[1]) {
                    setCurrentPage(pageMatch[1]);
                  }
                }
              }}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
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
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                {user.role === "super_admin" && onSwitchToAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSwitchToAdmin}>
                      <Shield className="mr-2 h-4 w-4" />
                      Panneau Super-Admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
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




