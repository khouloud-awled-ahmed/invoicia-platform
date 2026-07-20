import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  LayoutDashboard, Users, Package, Settings, BarChart2, CreditCard,
  LogOut, Search, Bell, ChevronDown,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import type { User } from '../lib/auth';

interface PlatformLayoutProps {
  user: User;
  onLogout?: () => void;
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dashboard-bi', label: 'Analytics', icon: BarChart2 },
  { id: 'tenants', label: 'Clients', icon: Users },
  { id: 'plans', label: 'Offres & Packs', icon: Package },
  { id: 'payments', label: 'Paiements', icon: CreditCard },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const pageDescriptions: Record<string, string> = {
  dashboard: "Vue d'ensemble de la plateforme",
  tenants: 'Gérer les sociétés clientes',
  plans: "Configurer les offres d'abonnement",
  payments: 'Suivi des paiements clients',
  settings: 'Paramètres globaux de la plateforme',
  'dashboard-bi': 'Dashboard Analytics',
};

const searchIndex = [
  { type: 'Page', name: 'Dashboard', sub: "Vue d'ensemble de la plateforme", href: '/platform/admin' },
  { type: 'Page', name: 'Clients', sub: 'Gérer les sociétés clientes', href: '/platform/tenants' },
  { type: 'Page', name: 'Offres & Packs', sub: "Plans d'abonnement", href: '/platform/plans' },
  { type: 'Page', name: 'Paramètres', sub: 'Configuration de la plateforme', href: '/platform/settings' },
];

const notifIcon = (type: string) => {
  if (type === 'new_client') return '👤';
  if (type === 'warning') return '⚠️';
  if (type === 'suspended') return '🚫';
  return '🔔';
};

const notifColors = (type: string) => {
  if (type === 'new_client') return { bg: '#EEF2FF', color: '#4F46E5' };
  if (type === 'warning') return { bg: '#FEF3C7', color: '#D97706' };
  if (type === 'suspended') return { bg: '#FEE2E2', color: '#DC2626' };
  return { bg: '#F1F5F9', color: '#64748B' };
};

export function PlatformLayout({ user, onLogout, children }: PlatformLayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  // Fetch pending payments count
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:3001/api/platform/tenants', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.filter((t: any) => t.subscriptionStatus === 'PENDING_PAYMENT').length);
        }
      } catch (e) { console.error(e); }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/platform/tenants')) setCurrentPage('tenants');
    else if (pathname.includes('/platform/plans')) setCurrentPage('plans');
    else if (pathname.includes('/platform/payments')) setCurrentPage('payments');
    else if (pathname.includes('/platform/settings')) setCurrentPage('settings');
    else if (pathname.includes('/platform/dashboard-bi')) setCurrentPage('dashboard-bi');
    else setCurrentPage('dashboard');
  }, []);

  useEffect(() => {
    setContentVisible(false);
    const t = setTimeout(() => setContentVisible(true), 20);
    return () => clearTimeout(t);
  }, [currentPage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch real notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:3001/api/platform/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {
        console.error('Notifications fetch error:', e);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.location.href = page === 'dashboard' ? '/platform/admin' : `/platform/${page}`;
  };

  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));

  const getUserInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const displayName = user?.name || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Admin';
  const sidebarWidth = collapsed ? '64px' : '232px';

  const ink = '#0F172A';
  const slateMid = '#64748B';
  const slateLight = '#94A3B8';
  const border = '#E2E8F0';
  const indigo = '#4F46E5';
  const indigoSoft = '#EEF2FF';
  const surface = '#F8FAFC';

  const searchResults = searchQuery.length > 0
    ? searchIndex.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: surface, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes platformFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dropdownIn { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .pl-nav-item { transition: background 0.15s ease, color 0.15s ease; }
        .pl-content-fade { animation: platformFadeIn 0.22s ease both; }
        .pl-dropdown { animation: dropdownIn 0.14s ease both; transform-origin: top right; }
        .pl-search-result:hover { background: #F8FAFC; }
        .pl-notif-item:hover { background: #F8FAFC; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: sidebarWidth, flexShrink: 0, background: '#fff', borderRight: `1px solid ${border}`, color: ink, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, transition: 'width 0.2s ease' }}>
        <div style={{ padding: collapsed ? '18px 0' : '18px 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '14px', color: '#fff' }}>I</div>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: ink, margin: 0, lineHeight: 1.2 }}>Invoicia</p>
                <p style={{ fontSize: '10.5px', color: slateMid, margin: 0, lineHeight: 1.2 }}>Platform Admin</p>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          {!collapsed && <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: slateLight, padding: '4px 8px 8px', margin: 0 }}>Menu</p>}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.id)} title={collapsed ? item.label : undefined} className="pl-nav-item"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', padding: collapsed ? '9px 0' : '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 600 : 500, marginBottom: '2px', textAlign: 'left', background: isActive ? indigoSoft : 'transparent', color: isActive ? indigo : slateMid }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                {!collapsed && (<span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{item.label}{item.id === 'payments' && pendingCount > 0 && (<span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#ef4444', padding: '1px 6px', borderRadius: '999px', marginLeft: '6px' }}>{pendingCount}</span>)}</span>)}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '8px', borderTop: `1px solid ${border}` }}>
          <button onClick={() => setCollapsed(!collapsed)} className="pl-nav-item"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', padding: collapsed ? '8px 0' : '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, background: 'transparent', color: slateMid }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            {collapsed ? <PanelLeftOpen style={{ width: '16px', height: '16px' }} /> : <><PanelLeftClose style={{ width: '16px', height: '16px' }} /><span>Réduire</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: `1px solid ${border}`, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 600, color: ink, margin: 0 }}>{menuItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}</h2>
            <p style={{ fontSize: '11.5px', color: slateMid, margin: 0 }}>{pageDescriptions[currentPage]}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: surface, border: `1px solid ${showResults ? indigo : border}`, borderRadius: '8px', padding: '7px 10px', width: '220px', transition: 'border-color 0.15s ease' }}>
                <Search style={{ width: '14px', height: '14px', color: showResults ? indigo : slateLight, flexShrink: 0 }} />
                <input placeholder="Rechercher..." value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12.5px', color: ink, width: '100%' }}
                />
                {searchQuery && <button onClick={() => { setSearchQuery(''); setShowResults(false); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: slateLight, fontSize: '16px', lineHeight: 1, padding: 0 }}>×</button>}
              </div>
              {showResults && searchQuery.length > 0 && (
                <div className="pl-dropdown" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '280px', background: '#fff', border: `1px solid ${border}`, borderRadius: '10px', boxShadow: '0 8px 24px rgba(15,23,42,0.10)', zIndex: 100, overflow: 'hidden' }}>
                  {searchResults.length > 0 ? searchResults.map((r, i) => (
                    <button key={i} className="pl-search-result" onMouseDown={() => { window.location.href = r.href; }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', borderBottom: i === searchResults.length - 1 ? 'none' : `1px solid ${border}` }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Search style={{ width: '12px', height: '12px', color: indigo }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: ink, margin: 0 }}>{r.name}</p>
                        <p style={{ fontSize: '11px', color: slateLight, margin: 0 }}>{r.sub}</p>
                      </div>
                    </button>
                  )) : (
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12.5px', color: slateLight, margin: 0 }}>Aucun résultat pour "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${notifOpen ? indigo : border}`, background: notifOpen ? indigoSoft : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.15s ease' }}
              >
                <Bell style={{ width: '15px', height: '15px', color: notifOpen ? indigo : slateMid }} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', border: '1.5px solid #fff' }} />
                )}
              </button>

              {notifOpen && (
                <div className="pl-dropdown" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: '340px', background: '#fff', border: `1px solid ${border}`, borderRadius: '12px', boxShadow: '0 10px 30px rgba(15,23,42,0.12)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: ink, margin: 0 }}>Notifications</p>
                      {unreadCount > 0 && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: indigo, padding: '1px 6px', borderRadius: '999px' }}>{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: '11.5px', fontWeight: 500, color: indigo, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12.5px', color: slateLight, margin: 0 }}>Aucune notification</p>
                      </div>
                    ) : notifications.map((n, i) => {
                      const isRead = readIds.has(n.id);
                      const colors = notifColors(n.type);
                      return (
                        <button key={n.id} className="pl-notif-item" onClick={() => markRead(n.id)}
                          style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', border: 'none', background: isRead ? 'transparent' : '#FAFBFF', cursor: 'pointer', textAlign: 'left', borderBottom: i === notifications.length - 1 ? 'none' : `1px solid ${border}`, transition: 'background 0.12s ease' }}
                        >
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px' }}>
                            {notifIcon(n.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <p style={{ fontSize: '12.5px', fontWeight: isRead ? 500 : 600, color: ink, margin: 0 }}>{n.title}</p>
                              {!isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: indigo, flexShrink: 0 }} />}
                            </div>
                            <p style={{ fontSize: '11.5px', color: slateMid, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.desc}</p>
                            <p style={{ fontSize: '11px', color: slateLight, margin: '3px 0 0' }}>{n.time}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: slateLight, margin: 0 }}>Actualisé toutes les 60 secondes</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px 5px 5px', borderRadius: '8px', border: `1px solid ${border}`, background: '#fff', cursor: 'pointer', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = surface)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fff')}
              >
                <Avatar style={{ height: '26px', width: '26px' }}>
                  <AvatarFallback style={{ background: indigo, color: '#fff', fontSize: '10.5px', fontWeight: 700 }}>
                    {getUserInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: ink }}>{displayName}</span>
                <ChevronDown style={{ width: '13px', height: '13px', color: slateLight, transition: 'transform 0.15s ease', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {profileOpen && (
                <div className="pl-dropdown" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: '220px', background: '#fff', border: `1px solid ${border}`, borderRadius: '10px', boxShadow: '0 10px 30px rgba(15,23,42,0.10)', overflow: 'hidden', zIndex: 50 }}>
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
                    <p style={{ fontSize: '12.5px', fontWeight: 600, color: ink, margin: 0 }}>{displayName}</p>
                    <p style={{ fontSize: '11.5px', color: slateMid, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                  </div>
                  <button onClick={onLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, color: '#DC2626', textAlign: 'left', transition: 'background 0.12s ease' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                  >
                    <LogOut style={{ width: '14px', height: '14px' }} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div key={currentPage} className={contentVisible ? 'pl-content-fade' : ''} style={{ opacity: contentVisible ? undefined : 0 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

