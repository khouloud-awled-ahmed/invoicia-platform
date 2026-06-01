import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import {
  Users,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Lock,
  Unlock,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserPlus,
  Settings,
  Eye,
  Copy,
  Crown,
  Briefcase,
  UserCog,
  FileText,
  DollarSign,
  Calendar,
  Package,
  TrendingUp,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";

// ==================== TYPES ====================

interface Permission {
  module: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    validate?: boolean;
    export?: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  department?: string;
  position?: string;
  company?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// ==================== MODULES & PERMISSIONS ====================

const AVAILABLE_MODULES = [
  { id: "dashboard", name: "Tableau de bord", icon: "📊" },
  { id: "sales", name: "Ventes & Factures", icon: "💰" },
  { id: "purchases", name: "Achats & Fournisseurs", icon: "🛒" },
  { id: "accounting", name: "Comptabilité", icon: "📚" },
  { id: "banking", name: "Banque", icon: "🏦" },
  { id: "hr", name: "RH & Absences", icon: "👥" },
  { id: "payroll", name: "Paie", icon: "💵" },
  { id: "projects", name: "Projets", icon: "📁" },
  { id: "clients", name: "Clients", icon: "🤝" },
  { id: "contracts", name: "Contrats", icon: "📄" },
  { id: "ged", name: "GED (Documents)", icon: "📂" },
  { id: "signature", name: "Signature électronique", icon: "✍️" },
  { id: "crm", name: "CRM (Pipeline)", icon: "🎯" },
  { id: "reporting", name: "Reporting & Analytics", icon: "📈" },
  { id: "settings", name: "Paramètres", icon: "⚙️" },
  { id: "users", name: "Utilisateurs & Rôles", icon: "🔐" },
];

// ==================== ROLES PREDÉFINIS ====================

const DEFAULT_ROLES: Role[] = [
  {
    id: "role-1",
    name: "Super Admin",
    slug: "super_admin",
    description: "Accès complet à toute la plateforme, gestion système",
    color: "#9333ea",
    icon: "Crown",
    level: 1,
    isSystem: true,
    isActive: true,
    permissions: AVAILABLE_MODULES.map(m => ({
      module: m.id,
      actions: { view: true, create: true, edit: true, delete: true, validate: true, export: true }
    })),
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-2",
    name: "Admin Plateforme",
    slug: "platform_admin",
    description: "Administration de la plateforme, gestion des utilisateurs",
    color: "#7c3aed",
    icon: "Shield",
    level: 2,
    isSystem: true,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "users", actions: { view: true, create: true, edit: true, delete: true } },
      { module: "settings", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "reporting", actions: { view: true, create: true, edit: false, delete: false, export: true } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-3",
    name: "Directeur / CEO",
    slug: "ceo",
    description: "Vision stratégique complète, accès reporting",
    color: "#dc2626",
    icon: "Crown",
    level: 3,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "reporting", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "projects", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "clients", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "accounting", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "hr", actions: { view: true, create: false, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-4",
    name: "DAF (Dir. Administratif & Financier)",
    slug: "daf",
    description: "Gestion financière, comptabilité, trésorerie",
    color: "#059669",
    icon: "DollarSign",
    level: 3,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "accounting", actions: { view: true, create: true, edit: true, delete: false, validate: true, export: true } },
      { module: "banking", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "sales", actions: { view: true, create: false, edit: true, delete: false, validate: true } },
      { module: "purchases", actions: { view: true, create: false, edit: true, delete: false, validate: true } },
      { module: "reporting", actions: { view: true, create: true, edit: false, delete: false, export: true } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-5",
    name: "Comptable",
    slug: "accountant",
    description: "Gestion comptable complète, saisies, rapprochements",
    color: "#0891b2",
    icon: "FileText",
    level: 5,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "accounting", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "banking", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "sales", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "purchases", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "ged", actions: { view: true, create: true, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-6",
    name: "Comptable Externe",
    slug: "external_accountant",
    description: "Accès lecture seule comptabilité, export pour cabinet",
    color: "#06b6d4",
    icon: "FileText",
    level: 10,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "accounting", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "banking", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "sales", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "purchases", actions: { view: true, create: false, edit: false, delete: false, export: true } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-7",
    name: "Responsable RH",
    slug: "hr_manager",
    description: "Gestion complète RH, absences, paie, recrutement",
    color: "#ea580c",
    icon: "Users",
    level: 4,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "hr", actions: { view: true, create: true, edit: true, delete: true, validate: true } },
      { module: "payroll", actions: { view: true, create: true, edit: true, delete: false, validate: true } },
      { module: "users", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "ged", actions: { view: true, create: true, edit: true, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-8",
    name: "Responsable Commercial",
    slug: "sales_manager",
    description: "Gestion commerciale, CRM, devis, facturation client",
    color: "#7c3aed",
    icon: "TrendingUp",
    level: 4,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "crm", actions: { view: true, create: true, edit: true, delete: true, validate: true } },
      { module: "sales", actions: { view: true, create: true, edit: true, delete: false, validate: true } },
      { module: "clients", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "contracts", actions: { view: true, create: true, edit: true, delete: false, validate: true } },
      { module: "projects", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "reporting", actions: { view: true, create: false, edit: false, delete: false, export: true } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-9",
    name: "Commercial",
    slug: "sales_rep",
    description: "Gestion des opportunités, devis, suivi clients",
    color: "#8b5cf6",
    icon: "Briefcase",
    level: 6,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "crm", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "sales", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "clients", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "contracts", actions: { view: true, create: false, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-10",
    name: "Chef de Projet",
    slug: "project_manager",
    description: "Gestion projets, suivi budgétaire",
    color: "#0284c7",
    icon: "Layers",
    level: 5,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "projects", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "clients", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "ged", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "reporting", actions: { view: true, create: false, edit: false, delete: false, export: true } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-11",
    name: "Salarié / Consultant",
    slug: "employee",
    description: "Gestion absences, accès documents",
    color: "#64748b",
    icon: "UserCog",
    level: 7,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "dashboard", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "hr", actions: { view: true, create: true, edit: false, delete: false } },
      { module: "ged", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "projects", actions: { view: true, create: false, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-12",
    name: "Intervenant Externe",
    slug: "external_contractor",
    description: "Accès limité documents",
    color: "#6b7280",
    icon: "UserPlus",
    level: 8,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "ged", actions: { view: true, create: false, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-13",
    name: "Client",
    slug: "client_role",
    description: "Consultation contrats, factures, documents projet",
    color: "#10b981",
    icon: "Building2",
    level: 9,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "contracts", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "sales", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "projects", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "ged", actions: { view: true, create: false, edit: false, delete: false } },
      { module: "signature", actions: { view: true, create: false, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "role-14",
    name: "Fournisseur",
    slug: "supplier_role",
    description: "Mise à jour documents légaux, gestion factures",
    color: "#f97316",
    icon: "Package",
    level: 9,
    isSystem: false,
    isActive: true,
    permissions: [
      { module: "ged", actions: { view: true, create: true, edit: true, delete: false } },
      { module: "purchases", actions: { view: true, create: true, edit: false, delete: false } },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

// ==================== API HELPER ====================

const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || '';

const apiCall = async (url: string, method: string, body?: any) => {
  const token = getAuthToken();
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }
  return response.json();
};

// ==================== MAIN COMPONENT ====================

export function UserRoleManagement() {
  const [activeTab, setActiveTab] = useState("users");
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRolePermissions, setViewingRolePermissions] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    department: '',
    position: '',
    password: '',
  });

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await apiCall('/api/users', 'GET');
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (showUserDialog) {
      if (editingUser) {
        setFormData({
          firstName: editingUser.firstName || '',
          lastName: editingUser.lastName || '',
          email: editingUser.email || '',
          phone: editingUser.phone || '',
          roleId: editingUser.roleId || '',
          department: editingUser.department || '',
          position: editingUser.position || '',
          password: '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          roleId: '',
          department: '',
          position: '',
          password: '',
        });
      }
    }
  }, [showUserDialog, editingUser]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.roleId === filterRole;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiCall(`/api/users/${userId}`, 'DELETE');
      setUsers(users.filter(u => u.id !== userId));
      toast.success("Utilisateur supprimé");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      await apiCall(`/api/users/${userId}`, 'PATCH', { isActive: !user?.isActive });
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success("Statut modifié");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification");
    }
  };

  // ✅ Maps roleId to backend role enum (TENANT_ADMIN, MANAGER, RH, CONSULTANT)
  const getRoleSlugForBackend = (roleId: string): string => {
    const roleMap: Record<string, string> = {
      "role-1": "TENANT_ADMIN",
      "role-2": "MANAGER",
      "role-3": "MANAGER",
      "role-4": "MANAGER",
      "role-5": "MANAGER",
      "role-6": "MANAGER",
      "role-7": "RH",
      "role-8": "MANAGER",
      "role-9": "MANAGER",
      "role-10": "MANAGER",
      "role-11": "CONSULTANT",
      "role-12": "CONSULTANT",
      "role-13": "CONSULTANT",
      "role-14": "CONSULTANT",
    };
    return roleMap[roleId] || "CONSULTANT";
  };

  // ✅ Maps roleId to specific role slug for permission matching
  const getRoleSlugForFrontend = (roleId: string): string => {
    const slugMap: Record<string, string> = {
      "role-1": "super_admin",
      "role-2": "platform_admin",
      "role-3": "ceo",
      "role-4": "daf",
      "role-5": "accountant",
      "role-6": "external_accountant",
      "role-7": "hr_manager",
      "role-8": "sales_manager",
      "role-9": "sales_rep",
      "role-10": "project_manager",
      "role-11": "employee",
      "role-12": "external_contractor",
      "role-13": "client_role",
      "role-14": "supplier_role",
    };
    return slugMap[roleId] || "employee";
  };

  const handleSaveUser = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Veuillez remplir le Prénom et le Nom");
      return;
    }
    if (!formData.email) {
      toast.error("Veuillez saisir un email");
      return;
    }
    if (!formData.roleId) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error("Veuillez saisir un mot de passe");
      return;
    }

    try {
      setIsCreating(true);

      const payload: any = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password || undefined,
        role: getRoleSlugForBackend(formData.roleId),
        roleSlug: getRoleSlugForFrontend(formData.roleId),
      };

      if (!payload.password) delete payload.password;

      if (editingUser) {
        await apiCall(`/api/users/${editingUser.id}`, 'PATCH', payload);
        toast.success("Utilisateur modifié avec succès !");
      } else {
        await apiCall('/api/users', 'POST', payload);
        toast.success("Utilisateur créé avec succès !");
      }

      setShowUserDialog(false);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleDialog(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystem) {
      toast.error("Les rôles système ne peuvent pas être modifiés");
      return;
    }
    setEditingRole(role);
    setShowRoleDialog(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.error("Les rôles système ne peuvent pas être supprimés");
      return;
    }
    const usersWithRole = users.filter(u => u.roleId === roleId);
    if (usersWithRole.length > 0) {
      toast.error(`Impossible de supprimer : ${usersWithRole.length} utilisateur(s) ont ce rôle`);
      return;
    }
    setRoles(roles.filter(r => r.id !== roleId));
    toast.success("Rôle supprimé");
  };

  const handleViewPermissions = (role: Role) => {
    setViewingRolePermissions(role);
    setShowPermissionsDialog(true);
  };

  const getRoleById = (roleId: string) => roles.find(r => r.id === roleId);
  const getUsersByRole = (roleId: string) => users.filter(u => u.roleId === roleId);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Utilisateurs & Rôles</h1>
          <p className="text-muted-foreground mt-1">
            Gestion complète des utilisateurs, rôles personnalisés et matrice de permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Export des utilisateurs...")}>
            <FileText className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.filter(u => u.isActive).length}</div>
            <p className="text-xs text-muted-foreground mt-1">sur {users.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rôles Configurés</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{roles.filter(r => r.isActive).length}</div>
            <p className="text-xs text-muted-foreground mt-1">dont {roles.filter(r => r.isSystem).length} système</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Externes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.filter(u => ["role-12", "role-13", "role-14"].includes(u.roleId)).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Clients + Fournisseurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">En attente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{users.filter(u => !u.isEmailVerified).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Email non vérifié</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Utilisateurs ({users.length})
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="w-4 h-4 mr-2" />
            Rôles ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Settings className="w-4 h-4 mr-2" />
            Matrice Permissions
          </TabsTrigger>
        </TabsList>

        {/* ONGLET UTILISATEURS */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Liste des Utilisateurs</CardTitle>
                  <CardDescription>Gérez les comptes utilisateurs et leurs accès</CardDescription>
                </div>
                <Button onClick={handleCreateUser}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const role = getRoleById(user.roleId);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge style={{ backgroundColor: role?.color, color: "#fff" }} className="font-medium">
                              {user.roleName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.department || user.company || "-"}</div>
                              {user.position && <div className="text-xs text-muted-foreground">{user.position}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? (
                              <div className="text-sm">
                                {new Date(user.lastLogin).toLocaleDateString("fr-FR")}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(user.lastLogin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Jamais</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.isActive ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />Actif
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-700">
                                  <XCircle className="w-3 h-3 mr-1" />Inactif
                                </Badge>
                              )}
                              {!user.isEmailVerified && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  <AlertTriangle className="w-3 h-3 mr-1" />Non vérifié
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="w-4 h-4 mr-2" />Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                                  {user.isActive ? (
                                    <><Lock className="w-4 h-4 mr-2" />Désactiver</>
                                  ) : (
                                    <><Unlock className="w-4 h-4 mr-2" />Activer</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Envoi d'email de réinitialisation...")}>
                                  <Mail className="w-4 h-4 mr-2" />Réinitialiser mot de passe
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && !isLoadingUsers && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              )}

              {isLoadingUsers && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Chargement des utilisateurs...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET RÔLES */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rôles & Profils</CardTitle>
                  <CardDescription>Créez et personnalisez les rôles utilisateurs avec leurs permissions</CardDescription>
                </div>
                <Button onClick={handleCreateRole}>
                  <Plus className="w-4 h-4 mr-2" />Nouveau Rôle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un rôle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoles.map((role) => {
                  const userCount = getUsersByRole(role.id).length;
                  const IconComponent = role.icon === "Crown" ? Crown :
                    role.icon === "Shield" ? Shield :
                    role.icon === "DollarSign" ? DollarSign :
                    role.icon === "FileText" ? FileText :
                    role.icon === "Users" ? Users :
                    role.icon === "TrendingUp" ? TrendingUp :
                    role.icon === "Briefcase" ? Briefcase :
                    role.icon === "Layers" ? Layers :
                    role.icon === "UserCog" ? UserCog :
                    role.icon === "UserPlus" ? UserPlus :
                    role.icon === "Building2" ? Building2 :
                    role.icon === "Package" ? Package : Shield;

                  return (
                    <Card key={role.id} className={cn("hover:shadow-md transition-shadow", !role.isActive && "opacity-60")}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${role.color}20` }}>
                              <IconComponent className="w-5 h-5" style={{ color: role.color }} />
                            </div>
                            <div>
                              <CardTitle className="text-base">{role.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs" style={{ borderColor: role.color, color: role.color }}>
                                  Niveau {role.level}
                                </Badge>
                                {role.isSystem && <Badge variant="secondary" className="text-xs">Système</Badge>}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPermissions(role)}>
                                <Eye className="w-4 h-4 mr-2" />Voir les permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRole(role)} disabled={role.isSystem}>
                                <Edit className="w-4 h-4 mr-2" />Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Duplication du rôle...")}>
                                <Copy className="w-4 h-4 mr-2" />Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} disabled={role.isSystem || userCount > 0} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{userCount} utilisateur{userCount > 1 ? "s" : ""}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewPermissions(role)}>
                            {role.permissions.length} permissions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET MATRICE PERMISSIONS */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matrice de Permissions par Module</CardTitle>
              <CardDescription>Vue d'ensemble des permissions accordées à chaque rôle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[200px] sticky left-0 bg-gray-50">Module</TableHead>
                      {roles.filter(r => r.isActive).slice(0, 8).map((role) => (
                        <TableHead key={role.id} className="text-center min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: role.color }}>
                              {role.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs">{role.name}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AVAILABLE_MODULES.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="sticky left-0 bg-white font-medium">
                          <div className="flex items-center gap-2">
                            <span>{module.icon}</span>
                            <span>{module.name}</span>
                          </div>
                        </TableCell>
                        {roles.filter(r => r.isActive).slice(0, 8).map((role) => {
                          const permission = role.permissions.find(p => p.module === module.id);
                          const hasAnyAccess = permission && Object.values(permission.actions).some(v => v);
                          return (
                            <TableCell key={role.id} className="text-center">
                              {hasAnyAccess ? (
                                <div className="flex flex-col items-center gap-1">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  <div className="flex gap-1">
                                    {permission.actions.view && <Badge variant="outline" className="text-xs px-1">V</Badge>}
                                    {permission.actions.create && <Badge variant="outline" className="text-xs px-1">C</Badge>}
                                    {permission.actions.edit && <Badge variant="outline" className="text-xs px-1">E</Badge>}
                                    {permission.actions.delete && <Badge variant="outline" className="text-xs px-1">D</Badge>}
                                  </div>
                                </div>
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Légende des actions :</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">V</Badge><span>Voir / Consulter</span></div>
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">C</Badge><span>Créer / Ajouter</span></div>
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">E</Badge><span>Modifier / Éditer</span></div>
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">D</Badge><span>Supprimer</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG UTILISATEUR */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel Utilisateur"}</DialogTitle>
            <DialogDescription>Renseignez les informations de l'utilisateur et attribuez-lui un rôle</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="jean.dupont@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                type="tel"
                placeholder="+216 xx xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label>Mot de passe *</Label>
                <Input
                  type="password"
                  placeholder="Mot de passe sécurisé"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(r => r.isActive).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Département / Entreprise</Label>
                <Input
                  placeholder="IT, Commercial..."
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Poste</Label>
                <Input
                  placeholder="Développeur, Manager..."
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser} disabled={isCreating}>
              {isCreating ? "Enregistrement..." : editingUser ? "Enregistrer" : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nouveau Rôle */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Modifier le rôle" : "Créer un Nouveau Rôle"}</DialogTitle>
            <DialogDescription>Définissez le nom, la description et les permissions du rôle</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Informations générales</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nom du rôle *</Label>
                  <Input placeholder="Ex: Responsable Marketing" defaultValue={editingRole?.name} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Décrivez les responsabilités de ce rôle..." defaultValue={editingRole?.description} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <div className="flex gap-2">
                      {["#9333ea", "#7c3aed", "#0891b2", "#059669", "#ea580c", "#dc2626"].map(color => (
                        <button key={color} className="w-8 h-8 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau hiérarchique</Label>
                    <Select defaultValue={editingRole?.level.toString() || "5"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            Niveau {level} {level === 1 && "(Plus haut)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Permissions par module</h3>
              <div className="space-y-3">
                {AVAILABLE_MODULES.map((module) => (
                  <Card key={module.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{module.icon}</span>
                          <div>
                            <div className="font-medium">{module.name}</div>
                            <div className="text-xs text-muted-foreground">Définissez les actions autorisées</div>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          {["view", "create", "edit", "delete"].map(action => (
                            <label key={action} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox id={`${module.id}-${action}`} />
                              <span className="text-sm capitalize">{action === "view" ? "Voir" : action === "create" ? "Créer" : action === "edit" ? "Modifier" : "Supprimer"}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Annuler</Button>
            <Button onClick={() => {
              toast.success(editingRole ? "Rôle modifié" : "Rôle créé avec succès");
              setShowRoleDialog(false);
            }}>
              {editingRole ? "Enregistrer les modifications" : "Créer le rôle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails Permissions */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {viewingRolePermissions && (
                <>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: viewingRolePermissions.color }}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div>{viewingRolePermissions.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">{viewingRolePermissions.description}</div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingRolePermissions && (
            <div className="space-y-4 py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-center">Voir</TableHead>
                    <TableHead className="text-center">Créer</TableHead>
                    <TableHead className="text-center">Modifier</TableHead>
                    <TableHead className="text-center">Supprimer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AVAILABLE_MODULES.map((module) => {
                    const permission = viewingRolePermissions.permissions.find(p => p.module === module.id);
                    return (
                      <TableRow key={module.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{module.icon}</span>
                            <span className="font-medium">{module.name}</span>
                          </div>
                        </TableCell>
                        {["view", "create", "edit", "delete"].map(action => (
                          <TableCell key={action} className="text-center">
                            {permission?.actions[action as keyof typeof permission.actions] ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowPermissionsDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}