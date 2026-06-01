import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { apiClient } from '../lib/api-client-backend';
import type { User } from '../lib/auth';

interface PlatformLayoutProps {
  user: User;
  onLogout?: () => void;
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tenants', label: 'Clients', icon: Users },
  { id: 'plans', label: 'Offres & Packs', icon: Package },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export function PlatformLayout({ user, onLogout, children }: PlatformLayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Détecter la page actuelle depuis l'URL
    const pathname = window.location.pathname;
    if (pathname.includes('/platform/tenants')) {
      setCurrentPage('tenants');
    } else if (pathname.includes('/platform/plans')) {
      setCurrentPage('plans');
    } else if (pathname.includes('/platform/settings')) {
      setCurrentPage('settings');
    } else if (pathname.includes('/platform/admin') || pathname === '/platform/') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'dashboard') {
      window.location.href = '/platform/admin';
    } else {
      window.location.href = `/platform/${page}`;
    }
    setSidebarOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Invoicia</h1>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-600 text-white">
                {getUserInitials(user?.name || user?.firstName + " " + user?.lastName || "Admin")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || (user?.firstName + " " + user?.lastName) || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full text-gray-300 hover:text-white hover:bg-gray-800 justify-start"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {menuItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

