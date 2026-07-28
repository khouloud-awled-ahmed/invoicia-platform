import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../lib/api-client-backend';
import { Users, Package, TrendingUp, Settings, RefreshCw, Sparkles, TrendingDown, Activity } from 'lucide-react';

const ink = '#0F172A';
const slateMid = '#64748B';
const slateLight = '#94A3B8';
const border = '#E2E8F0';
const indigo = '#4F46E5';

const MODULE_PRICES: Record<string, number> = {
  SALES: 10, PURCHASES: 5, PROJECTS: 8, HR: 12, ACCOUNTING: 15,
};

function calcTenantRevenue(tenant: any): number {
  return 10 + (tenant.modules || []).reduce((s: number, m: string) => s + (MODULE_PRICES[m] || 0), 0);
}

function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    if (!text) return;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ display: 'inline-block', width: '2px', height: '1em', background: '#a5b4fc', marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 0.8s step-end infinite' }} />}
    </span>
  );
}

export function PlatformDashboardPage() {
  const [stats, setStats] = useState({ totalTenants: 0, activeTenants: 0, pendingTenants: 0, suspendedTenants: 0, totalPlans: 0, totalRevenue: 0, potentialRevenue: 0 });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiKey, setAiKey] = useState(0);
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());
  const prevActivityIds = useRef<Set<string>>(new Set());

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tenantsData, plansData] = await Promise.all([
        apiClient.getPlatformTenants(),
        apiClient.getSubscriptionPlans(),
      ]);
      const activeTenants = tenantsData.filter((t: any) => t.subscriptionStatus === 'ACTIVE').length;
      const pendingTenants = tenantsData.filter((t: any) => t.subscriptionStatus === 'PENDING_PAYMENT').length;
      const suspendedTenants = tenantsData.filter((t: any) => t.subscriptionStatus === 'SUSPENDED').length;
      const totalRevenue = tenantsData.filter((t: any) => t.subscriptionStatus === 'ACTIVE').reduce((s: number, t: any) => s + calcTenantRevenue(t), 0);
      const potentialRevenue = tenantsData.reduce((s: number, t: any) => s + calcTenantRevenue(t), 0);
      setStats({ totalTenants: tenantsData.length, activeTenants, pendingTenants, suspendedTenants, totalPlans: plansData.length, totalRevenue, potentialRevenue });
      setRecentTenants(tenantsData.slice(-5).reverse());
      setAllTenants(tenantsData);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/platform/activity-feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const newIds = new Set<string>(data.map((a: any) => a.id));
        const fresh = new Set<string>();
        newIds.forEach(id => { if (!prevActivityIds.current.has(id)) fresh.add(id); });
        setNewActivityIds(fresh);
        prevActivityIds.current = newIds;
        setActivities(data);
        setTimeout(() => setNewActivityIds(new Set()), 3000);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadActivities(); const iv = setInterval(loadActivities, 15000); return () => clearInterval(iv); }, [loadActivities]);

  const generateAiInsight = async () => {
    setAiLoading(true);
    setAiInsight('');
    try {
      const pendingList = allTenants.filter((t: any) => t.subscriptionStatus === 'PENDING_PAYMENT').map((t: any) => t.name).join(', ');
      const activeList = allTenants.filter((t: any) => t.subscriptionStatus === 'ACTIVE').map((t: any) => t.name).join(', ');
      const totalRevenue = allTenants.filter((t: any) => t.subscriptionStatus === 'ACTIVE').reduce((s: number, t: any) => s + calcTenantRevenue(t), 0);
      const potentialRevenue = allTenants.reduce((s: number, t: any) => s + calcTenantRevenue(t), 0);
      const prompt = `Tu es un assistant analytique expert pour une plateforme SaaS B2B tunisienne appelée Invoicia.
Données en temps réel:
- Total clients: ${allTenants.length}
- Clients actifs (${allTenants.filter((t:any) => t.subscriptionStatus === 'ACTIVE').length}): ${activeList || 'aucun'}
- En attente de paiement (${allTenants.filter((t:any) => t.subscriptionStatus === 'PENDING_PAYMENT').length}): ${pendingList || 'aucun'}
- Clients suspendus: ${allTenants.filter((t:any) => t.subscriptionStatus === 'SUSPENDED').length}
- Revenu mensuel actuel: ${totalRevenue} TND
- Revenu potentiel total: ${potentialRevenue} TND
- Manque à gagner: ${potentialRevenue - totalRevenue} TND
Génère une analyse percutante en français, 2-3 phrases maximum. Style: consultant senior, direct, chiffré, actionnable. Commence par un insight fort. Pas de formules génériques. Mentionne les vrais chiffres. Pas de markdown.`;
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setAiInsight(data?.text || '');
      setAiKey(k => k + 1);
    } catch (e) {
      setAiInsight('');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { if (allTenants.length > 0 && !aiInsight) generateAiInsight(); }, [allTenants]);

  const statusStyle = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      ACTIVE: { label: 'Actif', bg: '#DCFCE7', text: '#15803D' },
      PENDING_PAYMENT: { label: 'En attente', bg: '#FEF3C7', text: '#A16207' },
      SUSPENDED: { label: 'Suspendu', bg: '#FEE2E2', text: '#DC2626' },
      TRIAL: { label: 'Essai', bg: '#DBEAFE', text: '#1D4ED8' },
      CANCELLED: { label: 'Annulé', bg: '#F1F5F9', text: '#64748B' },
    };
    return map[status] || { label: status, bg: '#F1F5F9', text: '#64748B' };
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = statusStyle(status);
    return <span style={{ fontSize: '11px', fontWeight: 600, color: s.text, background: s.bg, padding: '3px 10px', borderRadius: '999px' }}>{s.label}</span>;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${border}`, borderTopColor: indigo, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: slateMid, fontSize: '13px' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  const total = stats.totalTenants || 1;
  const activePct = (stats.activeTenants / total) * 100;
  const pendingPct = (stats.pendingTenants / total) * 100;
  const suspendedPct = (stats.suspendedTenants / total) * 100;
  const revenueCapture = stats.potentialRevenue > 0 ? Math.round((stats.totalRevenue / stats.potentialRevenue) * 100) : 0;
  const iconBtn: React.CSSProperties = { width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s ease', flexShrink: 0 };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;1,400&display=swap');
        .pd-icon-btn:hover { background: #F8FAFC; }
        .pd-refresh:hover { background: #F8FAFC; }
        .pd-row:hover { background: #F8FAFC; }
        .activity-item:hover { background: #f8fafc; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        .ai-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .activity-new { animation: slideInLeft 0.4s ease; }
        .live-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: ink, margin: 0 }}>Dashboard plateforme</h1>
          <p style={{ fontSize: '13px', color: slateMid, margin: '4px 0 0' }}>
            Vue d'ensemble de la plateforme SaaS
            {lastUpdated && <span style={{ marginLeft: '8px', color: slateLight }}>· Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => window.location.href = '/platform/tenants'} className="pd-icon-btn" style={iconBtn} title="Clients"><Users style={{ width: '15px', height: '15px', color: slateMid }} /></button>
          <button onClick={() => window.location.href = '/platform/plans'} className="pd-icon-btn" style={iconBtn} title="Plans"><Package style={{ width: '15px', height: '15px', color: slateMid }} /></button>
          <button onClick={() => window.location.href = '/platform/settings'} className="pd-icon-btn" style={iconBtn} title="Paramètres"><Settings style={{ width: '15px', height: '15px', color: slateMid }} /></button>
          <div style={{ width: '1px', height: '22px', background: border, margin: '0 4px' }} />
          <button onClick={loadStats} className="pd-refresh" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, color: ink, background: '#fff', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', transition: 'background 0.15s ease', flexShrink: 0 }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)', border: '1px solid #E4E1FA', borderRadius: '14px', padding: '26px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8B85C7' }}>Total clients</div>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '46px', fontWeight: 500, color: ink, lineHeight: 1.1, marginTop: '6px' }}>{stats.totalTenants}</div>
            <div style={{ fontSize: '12.5px', color: slateMid, marginTop: '2px' }}>Entreprises inscrites</div>
          </div>
          <div style={{ marginTop: '22px' }}>
            <div style={{ display: 'flex', width: '100%', height: '6px', borderRadius: '999px', overflow: 'hidden', background: '#fff' }}>
              <div style={{ width: `${activePct}%`, background: '#818CF8' }} />
              <div style={{ width: `${pendingPct}%`, background: '#C7D2FE' }} />
              <div style={{ width: `${suspendedPct}%`, background: '#E2E8F0' }} />
            </div>
            <div style={{ display: 'flex', gap: '18px', marginTop: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#818CF8' }} /><span style={{ fontSize: '11.5px', color: ink }}>{stats.activeTenants} actifs</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#A5B4FC' }} /><span style={{ fontSize: '11.5px', color: slateMid }}>{stats.pendingTenants} en attente</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#CBD5E1' }} /><span style={{ fontSize: '11.5px', color: slateMid }}>{stats.suspendedTenants} suspendus</span></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fff', border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', borderRadius: '14px', padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: slateMid }}>Revenu actuel</span>
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '26px', fontWeight: 500, color: ink, lineHeight: 1.1 }}>{stats.totalRevenue > 0 ? `${stats.totalRevenue} TND` : '—'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '999px', background: '#f1f5f9' }}>
                <div style={{ width: `${revenueCapture}%`, height: '100%', borderRadius: '999px', background: '#818CF8' }} />
              </div>
              <span style={{ fontSize: '10.5px', color: slateMid, flexShrink: 0 }}>{revenueCapture}% capturé</span>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', borderRadius: '14px', padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <TrendingDown style={{ width: '14px', height: '14px', color: '#ef4444' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: slateMid }}>Manque à gagner</span>
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '26px', fontWeight: 500, color: '#ef4444', lineHeight: 1.1 }}>
              {stats.potentialRevenue - stats.totalRevenue > 0 ? `${stats.potentialRevenue - stats.totalRevenue} TND` : '0 TND'}
            </div>
            <div style={{ fontSize: '11.5px', color: slateLight, marginTop: '2px' }}>Paiements en attente</div>
          </div>
        </div>
      </div>

      {/* AI Box */}
      <div style={{ position: 'relative', borderRadius: '16px', padding: '1px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', marginBottom: '16px' }}>
        <div style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #0f0c29, #1a1a4e, #24243e)', padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}>
                <Sparkles style={{ width: '15px', height: '15px', color: '#fff' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>IA Analytics</p>
                <p style={{ margin: 0, fontSize: '10px', color: 'rgba(165,180,252,0.6)' }}>Analyse en temps réel · Invoicia</p>
              </div>
            </div>
            <button onClick={generateAiInsight} disabled={aiLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 500, color: '#a5b4fc', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <RefreshCw style={{ width: '11px', height: '11px', ...(aiLoading ? { animation: 'spin 1s linear infinite' } : {}) }} />
              {aiLoading ? 'Analyse...' : 'Actualiser'}
            </button>
          </div>
          <div style={{ minHeight: '48px', display: 'flex', alignItems: 'center' }}>
            {aiLoading ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="ai-shimmer" style={{ height: '14px', width: '90%' }} />
                <div className="ai-shimmer" style={{ height: '14px', width: '70%' }} />
              </div>
            ) : aiInsight ? (
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.7, fontWeight: 400 }}>
                <TypewriterText key={aiKey} text={aiInsight} speed={15} />
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Cliquez sur Actualiser pour générer une analyse...</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom grid: Recent clients + Activity feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>

        {/* Recent clients */}
        <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${border}` }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: ink, margin: 0 }}>Derniers clients</p>
            <p style={{ fontSize: '12px', color: slateMid, margin: '2px 0 0' }}>Les 5 dernières entreprises inscrites</p>
          </div>
          {recentTenants.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: slateMid, textAlign: 'center', padding: '32px 0' }}>Aucun client</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Client', 'Utilisateurs', 'Statut'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 2 ? 'right' : 'left', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: slateLight, padding: '10px 18px', borderBottom: `1px solid ${border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTenants.map((tenant: any, idx: number) => (
                  <tr key={tenant.id} className="pd-row" style={{ transition: 'background 0.12s ease' }}>
                    <td style={{ padding: '11px 18px', borderBottom: idx === recentTenants.length - 1 ? 'none' : `1px solid ${border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EEF2FF', color: indigo, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{tenant.name?.charAt(0)?.toUpperCase() || '?'}</div>
                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: ink }}>{tenant.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 18px', fontSize: '12px', color: slateMid, borderBottom: idx === recentTenants.length - 1 ? 'none' : `1px solid ${border}` }}>{tenant.currentUsers}/{tenant.maxUsers}</td>
                    <td style={{ padding: '11px 18px', textAlign: 'right', borderBottom: idx === recentTenants.length - 1 ? 'none' : `1px solid ${border}` }}><StatusBadge status={tenant.subscriptionStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity Feed */}
        <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: ink, margin: 0 }}>Activité en direct</p>
                <div className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <p style={{ fontSize: '12px', color: slateMid, margin: '2px 0 0' }}>Actualisé toutes les 15 secondes</p>
            </div>
            <Activity style={{ width: '16px', height: '16px', color: slateLight }} />
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: slateMid, textAlign: 'center', padding: '32px 0' }}>Aucune activité</p>
            ) : activities.map((activity: any, idx: number) => (
              <div key={activity.id} className={`activity-item ${newActivityIds.has(activity.id) ? 'activity-new' : ''}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 18px', borderBottom: idx === activities.length - 1 ? 'none' : `1px solid ${border}`, transition: 'background 0.12s ease', background: newActivityIds.has(activity.id) ? '#f0fdf4' : 'transparent' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${activity.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px' }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: slateMid }}>{activity.subtitle}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '10.5px', color: slateLight }}>{activity.timeAgo}</p>
                </div>
                {newActivityIds.has(activity.id) && (
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '999px', flexShrink: 0 }}>NEW</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
