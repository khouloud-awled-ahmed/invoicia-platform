import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client-backend';
import { CreditCard, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  ACTIVE:          { label: 'Payé',        color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  PENDING_PAYMENT: { label: 'En attente',  color: '#d97706', bg: '#fffbeb', icon: Clock },
  SUSPENDED:       { label: 'Suspendu',    color: '#dc2626', bg: '#fef2f2', icon: XCircle },
  INCOMPLETE:      { label: 'Incomplet',   color: '#6366f1', bg: '#eef2ff', icon: AlertTriangle },
  CANCELLED:       { label: 'Annulé',      color: '#64748b', bg: '#f1f5f9', icon: XCircle },
};

export function PlatformPaymentsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED'>('ALL');
  const [approving, setApproving] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      const data = await apiClient.getPlatformTenants();
      setTenants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/platform/tenants/${id}/approve-transfer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchTenants();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApproving(null);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await apiClient.updatePlatformTenant(id, { subscriptionStatus: 'SUSPENDED' });
      await fetchTenants();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filter === 'ALL' ? tenants : tenants.filter(t => t.subscriptionStatus === filter);

  const stats = {
    total: tenants.length,
    paid: tenants.filter(t => t.subscriptionStatus === 'ACTIVE').length,
    pending: tenants.filter(t => t.subscriptionStatus === 'PENDING_PAYMENT').length,
    suspended: tenants.filter(t => t.subscriptionStatus === 'SUSPENDED').length,
  };

  const calculateAmount = (tenant: any) => {
    const modulesPrices: Record<string, number> = {
      SALES: 10, PURCHASES: 5, PROJECTS: 8, HR: 12, ACCOUNTING: 15,
    };
    const base = 10;
    const modulesTotal = (tenant.modules || []).reduce((s: number, m: string) => s + (modulesPrices[m] || 0), 0);
    return base + modulesTotal;
  };

  const ink = '#0F172A';
  const border = '#E2E8F0';
  const slateMid = '#64748B';
  const indigo = '#4F46E5';
  const indigoSoft = '#EEF2FF';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: ink }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Paiements</h1>
        <p style={{ fontSize: 13, color: slateMid, margin: '4px 0 0' }}>Suivi des paiements et abonnements clients</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total clients', value: stats.total, color: indigo, bg: indigoSoft },
          { label: 'Payés / Actifs', value: stats.paid, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'En attente', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
          { label: 'Suspendus', value: stats.suspended, color: '#dc2626', bg: '#fef2f2' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 12, color: slateMid, margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['ALL', 'ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: 8, border: `1px solid ${filter === f ? indigo : border}`, background: filter === f ? indigoSoft : '#fff', color: filter === f ? indigo : slateMid, fontSize: 12.5, fontWeight: filter === f ? 600 : 500, cursor: 'pointer' }}>
            {f === 'ALL' ? 'Tous' : f === 'ACTIVE' ? 'Payés' : f === 'PENDING_PAYMENT' ? 'En attente' : 'Suspendus'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${border}`, background: '#f8fafc' }}>
              {['Client', 'Email', 'Modules', 'Montant', 'Statut', 'Date inscription', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11.5, fontWeight: 600, color: slateMid, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: slateMid }}>Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: slateMid }}>Aucun client trouvé</td></tr>
            ) : filtered.map((tenant, i) => {
              const status = STATUS_LABELS[tenant.subscriptionStatus] || STATUS_LABELS['INCOMPLETE'];
              const StatusIcon = status.icon;
              const amount = calculateAmount(tenant);
              const isLast = i === filtered.length - 1;
              return (
                <tr key={tenant.id} style={{ borderBottom: isLast ? 'none' : `1px solid ${border}` }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: indigo, flexShrink: 0 }}>
                        {tenant.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: ink }}>{tenant.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: slateMid }}>{tenant.planType || 'CUSTOM'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12.5, color: slateMid }}>{tenant.email || tenant.adminEmail}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(tenant.modules || []).slice(0, 3).map((m: string) => (
                        <span key={m} style={{ fontSize: 10.5, fontWeight: 500, padding: '2px 7px', borderRadius: 999, background: indigoSoft, color: indigo }}>{m}</span>
                      ))}
                      {(tenant.modules || []).length > 3 && (
                        <span style={{ fontSize: 10.5, color: slateMid }}>+{tenant.modules.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: indigo }}>{amount} TND/mois</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: status.bg, color: status.color }}>
                      <StatusIcon style={{ width: 12, height: 12 }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{status.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: slateMid }}>
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {tenant.subscriptionStatus === 'PENDING_PAYMENT' && (
                        <button onClick={() => handleApprove(tenant.id)} disabled={approving === tenant.id}
                          style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', opacity: approving === tenant.id ? 0.6 : 1 }}>
                          {approving === tenant.id ? '...' : '✓ Approuver'}
                        </button>
                      )}
                      {tenant.subscriptionStatus === 'ACTIVE' && (
                        <button onClick={() => handleSuspend(tenant.id)}
                          style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: `1px solid #fca5a5`, background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>
                          Suspendre
                        </button>
                      )}
                      {tenant.subscriptionStatus === 'SUSPENDED' && (
                        <button onClick={() => handleApprove(tenant.id)}
                          style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: 'none', background: indigoSoft, color: indigo, cursor: 'pointer' }}>
                          Réactiver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
