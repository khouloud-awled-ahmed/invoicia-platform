import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Euro, Users, FileText, ArrowUpRight, RefreshCw, Calendar, AlertTriangle, Target, BarChart2, Brain, X, ChevronDown, ChevronUp, Download } from "lucide-react";
import { apiClient } from "../lib/api-client-backend";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const PERIODS = [
  { label: "6 mois", value: 6 },
  { label: "12 mois", value: 12 },
  { label: "Cette année", value: 0 },
];

const insightStyles: Record<string, any> = {
  danger: { bg: "bg-red-50", border: "border-red-200", icon: "🔴", badge: "bg-red-100 text-red-700", title: "text-red-800" },
  warning: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "🟡", badge: "bg-yellow-100 text-yellow-700", title: "text-yellow-800" },
  success: { bg: "bg-green-50", border: "border-green-200", icon: "🟢", badge: "bg-green-100 text-green-700", title: "text-green-800" },
  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "💡", badge: "bg-blue-100 text-blue-700", title: "text-blue-800" },
};

export function BIDashboard() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<any>({});
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(12);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [insights, setInsights] = useState<any[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsVisible, setInsightsVisible] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  const [insightsExpanded, setInsightsExpanded] = useState(true);
  const [goals, setGoals] = useState({ monthlyRevenue: 0, monthlyInvoices: 0, paymentRate: 0 });
  const [editingGoals, setEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState({ monthlyRevenue: 0, monthlyInvoices: 0, paymentRate: 0 });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("invoicia-bi-goals");
    if (saved) {
      const parsed = JSON.parse(saved);
      setGoals(parsed);
      setTempGoals(parsed);
    }
  }, []);

  const saveGoals = () => {
    localStorage.setItem("invoicia-bi-goals", JSON.stringify(tempGoals));
    setGoals(tempGoals);
    setEditingGoals(false);
  };

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [rev, clients, invStats, expenses, cash] = await Promise.all([
        apiClient.request<any[]>(`/dashboard/revenue-by-month?months=${selectedPeriod}`),
        apiClient.request<any[]>(`/dashboard/top-clients?months=${selectedPeriod}`),
        apiClient.request<any>(`/dashboard/invoice-stats?months=${selectedPeriod}`),
        apiClient.request<any[]>(`/dashboard/expenses-by-category?months=${selectedPeriod}`),
        apiClient.request<any[]>(`/dashboard/cash-flow?months=${selectedPeriod}`),
      ]);
      const allRev = rev.map((r: any) => ({ ...r, month: r.month.substring(5) }));
      setRevenueData(selectedPeriod === 0 ? allRev : allRev.slice(-selectedPeriod));
      setTopClients(clients);
      setInvoiceStats(invStats);
      setExpensesByCategory(expenses.slice(0, 6));
      setCashFlow(cash.map((c: any) => ({ ...c, month: c.month.substring(5) })));
      setLastUpdated(new Date());
      setInsightsLoading(true);
      try {
        const data = await apiClient.request<any[]>(`/dashboard/ai-insights?months=${selectedPeriod}`);
        setInsights(data);
      } catch { setInsights([]); }
      finally { setInsightsLoading(false); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [selectedPeriod]);

  const computeGrowth = () => {
    if (revenueData.length < 2) return null;
    const last = revenueData[revenueData.length - 1]?.revenue || 0;
    const prev = revenueData[revenueData.length - 2]?.revenue || 0;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  };

  const growth = computeGrowth();
  const totalExpenses = expensesByCategory.reduce((s, e) => s + e.total, 0);
  const profitMargin = invoiceStats.totalRevenue > 0
    ? Math.round(((invoiceStats.totalRevenue - totalExpenses) / invoiceStats.totalRevenue) * 100) : 0;
  const visibleInsights = insights.filter((_, i) => !dismissedInsights.includes(i));

  const handlePrint = () => {
    const printHTML = `
      <html><head><title>Cockpit de Gestion - Invoicia - ${new Date().toLocaleDateString('fr-TN')}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
        body { padding:20px; color:#111; background:white; }
        .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #3b82f6; padding-bottom:16px; margin-bottom:24px; }
        .header h1 { font-size:22px; color:#3b82f6; font-weight:bold; }
        .header p { font-size:11px; color:#666; margin-top:4px; }
        .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
        .kpi { border:1px solid #e5e7eb; border-radius:8px; padding:14px; }
        .kpi.green { border-left:4px solid #10b981; } .kpi.blue { border-left:4px solid #3b82f6; }
        .kpi.orange { border-left:4px solid #f59e0b; } .kpi.red { border-left:4px solid #ef4444; }
        .kpi-label { font-size:10px; color:#666; font-weight:600; text-transform:uppercase; margin-bottom:6px; }
        .kpi-val { font-size:20px; font-weight:bold; }
        .kpi-val.green{color:#10b981;} .kpi-val.blue{color:#3b82f6;} .kpi-val.orange{color:#f59e0b;} .kpi-val.red{color:#ef4444;}
        .kpi-sub { font-size:10px; color:#999; margin-top:3px; }
        .section { font-size:14px; font-weight:bold; color:#1f2937; margin:20px 0 10px; border-bottom:1px solid #e5e7eb; padding-bottom:6px; }
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
        .card { border:1px solid #e5e7eb; border-radius:8px; padding:14px; }
        .inv-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
        .inv-card { padding:14px; border-radius:8px; text-align:center; }
        .inv-card.g{background:#f0fdf4;border:1px solid #bbf7d0;} .inv-card.y{background:#fefce8;border:1px solid #fef08a;}
        .inv-card.r{background:#fef2f2;border:1px solid #fecaca;} .inv-card.gr{background:#f9fafb;border:1px solid #e5e7eb;}
        .inv-num { font-size:26px; font-weight:bold; }
        .inv-num.g{color:#16a34a;} .inv-num.y{color:#ca8a04;} .inv-num.r{color:#dc2626;} .inv-num.gr{color:#6b7280;}
        .row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #f3f4f6; font-size:12px; }
        .row:last-child { border:none; font-weight:bold; font-size:14px; }
        .client-row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #f3f4f6; font-size:12px; }
        .insight { padding:8px 12px; border-radius:6px; margin-bottom:6px; font-size:11px; }
        .insight.warning{background:#fefce8;border-left:3px solid #f59e0b;}
        .insight.danger{background:#fef2f2;border-left:3px solid #ef4444;}
        .insight.info{background:#eff6ff;border-left:3px solid #3b82f6;}
        .insight.success{background:#f0fdf4;border-left:3px solid #10b981;}
        .ins-title { font-weight:bold; margin-bottom:2px; }
        .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; text-align:center; font-size:10px; color:#999; }
        @media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
      </style></head><body>
      <div class="header">
        <div><h1>📊 Cockpit de Gestion</h1><p>Invoicia — Pilotage stratégique de votre performance</p></div>
        <div style="text-align:right;font-size:11px;color:#444"><strong>Date du rapport</strong><br/>${new Date().toLocaleDateString('fr-TN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
      </div>
      <div class="kpi-grid">
        <div class="kpi green"><div class="kpi-label">Chiffre d'Affaires</div><div class="kpi-val green">${(invoiceStats.totalRevenue||0).toLocaleString('fr-TN')} DT</div><div class="kpi-sub">Factures payées</div></div>
        <div class="kpi blue"><div class="kpi-label">Marge Bénéficiaire</div><div class="kpi-val blue">${profitMargin}%</div><div class="kpi-sub">Revenus - Dépenses</div></div>
        <div class="kpi orange"><div class="kpi-label">Taux de Paiement</div><div class="kpi-val orange">${invoiceStats.paymentRate||0}%</div><div class="kpi-sub">${invoiceStats.paid||0} / ${invoiceStats.total||0} factures</div></div>
        <div class="kpi red"><div class="kpi-label">En Retard</div><div class="kpi-val red">${invoiceStats.overdue||0}</div><div class="kpi-sub">${(invoiceStats.pendingRevenue||0).toLocaleString('fr-TN')} DT en attente</div></div>
      </div>
      <div class="section">Statut des Factures</div>
      <div class="inv-grid">
        <div class="inv-card g"><div class="inv-num g">${invoiceStats.paid||0}</div><div style="font-size:10px;color:#16a34a;margin-top:4px">Payées</div></div>
        <div class="inv-card y"><div class="inv-num y">${invoiceStats.pending||0}</div><div style="font-size:10px;color:#ca8a04;margin-top:4px">En attente</div></div>
        <div class="inv-card r"><div class="inv-num r">${invoiceStats.overdue||0}</div><div style="font-size:10px;color:#dc2626;margin-top:4px">En retard</div></div>
        <div class="inv-card gr"><div class="inv-num gr">${invoiceStats.draft||0}</div><div style="font-size:10px;color:#6b7280;margin-top:4px">Brouillons</div></div>
      </div>
      <div class="two-col">
        <div class="card"><div class="section" style="margin-top:0">Top 5 Clients</div>
          ${topClients.length===0 ? '<p style="color:#999;font-size:12px">Aucune donnée</p>' : topClients.map((c,i) => `<div class="client-row"><span><strong>#${i+1}</strong> ${c.name} <span style="color:#999">(${c.count} fact.)</span></span><strong style="color:#10b981">${c.total.toLocaleString('fr-TN')} DT</strong></div>`).join('')}
        </div>
        <div class="card"><div class="section" style="margin-top:0">Résumé Financier</div>
          <div class="row"><span>Revenus totaux</span><strong style="color:#10b981">+${(invoiceStats.totalRevenue||0).toLocaleString('fr-TN')} DT</strong></div>
          <div class="row"><span>Dépenses totales</span><strong style="color:#ef4444">-${totalExpenses.toLocaleString('fr-TN')} DT</strong></div>
          <div class="row"><span>En attente</span><strong style="color:#f59e0b">${(invoiceStats.pendingRevenue||0).toLocaleString('fr-TN')} DT</strong></div>
          <div class="row"><span>Bénéfice Net</span><strong style="color:${(invoiceStats.totalRevenue||0)-totalExpenses>=0?'#10b981':'#ef4444'}">${((invoiceStats.totalRevenue||0)-totalExpenses).toLocaleString('fr-TN')} DT</strong></div>
        </div>
      </div>
      ${insights.length>0?`<div class="section">Recommandations IA</div>${insights.map(i=>`<div class="insight ${i.type}"><div class="ins-title">${i.title}</div><div>${i.message}</div></div>`).join('')}`:''}
      <div class="footer">Rapport généré par Invoicia • ${new Date().toLocaleString('fr-TN')} • Confidentiel</div>
      </body></html>`;
    const w = window.open('','_blank');
    if (!w) return;
    w.document.write(printHTML);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-5 p-6 bg-gray-50 min-h-screen" ref={printRef}>

      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <BarChart2 className="w-6 h-6 text-blue-600" />
            Cockpit de Gestion
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Pilotage stratégique de votre performance — Actualisé le {lastUpdated.toLocaleTimeString("fr-TN")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Calendar className="w-4 h-4 text-gray-500 ml-1" />
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setSelectedPeriod(p.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedPeriod === p.value ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors font-medium">
            <Download className="w-4 h-4" />Exporter PDF
          </button>
          <button onClick={() => load(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />Actualiser
          </button>
        </div>
      </div>

      {/* ═══ 1. KPI CARDS ═══ */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-600"><Euro className="w-4 h-4" />Chiffre d'Affaires</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(invoiceStats.totalRevenue||0).toLocaleString("fr-TN")} DT</div>
            <div className="flex items-center gap-1 mt-1">
              {growth !== null ? (
                <>{growth >= 0 ? <TrendingUp className="w-3 h-3 text-green-500"/> : <TrendingDown className="w-3 h-3 text-red-500"/>}
                <span className={`text-xs font-medium ${growth>=0?"text-green-600":"text-red-600"}`}>{growth>=0?"+":""}{growth}% vs mois dernier</span></>
              ) : <p className="text-xs text-muted-foreground">Factures payées</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-600"><Target className="w-4 h-4" />Marge Bénéficiaire</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin>=0?"text-blue-600":"text-red-600"}`}>{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">Revenus - Dépenses</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-600"><FileText className="w-4 h-4" />Taux de Paiement</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{invoiceStats.paymentRate||0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{width:`${invoiceStats.paymentRate||0}%`}}/>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{invoiceStats.paid||0} / {invoiceStats.total||0} factures</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-600"><AlertTriangle className="w-4 h-4" />En Retard</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{invoiceStats.overdue||0}</div>
            <p className="text-xs text-muted-foreground">{(invoiceStats.pendingRevenue||0).toLocaleString("fr-TN")} DT en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ 2. OBJECTIFS ═══ */}
      <Card className="border border-purple-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-gray-800">Objectifs du Mois</span>
            </CardTitle>
            <button onClick={() => { setTempGoals(goals); setEditingGoals(!editingGoals); }}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              {editingGoals ? "Annuler" : "✏️ Modifier"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {editingGoals ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">🎯 Objectif CA (DT)</label>
                  <input type="number" value={tempGoals.monthlyRevenue}
                    onChange={e => setTempGoals(p => ({...p, monthlyRevenue: Number(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 50000"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">📄 Objectif Factures</label>
                  <input type="number" value={tempGoals.monthlyInvoices}
                    onChange={e => setTempGoals(p => ({...p, monthlyInvoices: Number(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 20"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">💳 Objectif Taux Paiement (%)</label>
                  <input type="number" value={tempGoals.paymentRate}
                    onChange={e => setTempGoals(p => ({...p, paymentRate: Number(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 80"/>
                </div>
              </div>
              <button onClick={saveGoals}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors font-medium">
                💾 Sauvegarder
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: "💰 Chiffre d'Affaires", current: invoiceStats.totalRevenue||0, goal: goals.monthlyRevenue, unit: "DT", color: "bg-green-500" },
                { label: "📄 Factures", current: invoiceStats.total||0, goal: goals.monthlyInvoices, unit: "", color: "bg-blue-500" },
                { label: "💳 Taux de Paiement", current: invoiceStats.paymentRate||0, goal: goals.paymentRate, unit: "%", color: "bg-orange-500" },
              ].map((item, i) => {
                const pct = item.goal > 0 ? Math.min(Math.round((item.current / item.goal) * 100), 100) : 0;
                const reached = item.goal > 0 && item.current >= item.goal;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.current.toLocaleString("fr-TN")}{item.unit} / {item.goal > 0 ? `${item.goal.toLocaleString("fr-TN")}${item.unit}` : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all ${reached ? "bg-green-500" : item.color}`}
                        style={{width: `${pct}%`}}/>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.goal > 0 ? `${pct}% atteint` : "Pas d'objectif défini"}</span>
                      {reached && <span className="text-green-600 font-bold">🎉 Objectif atteint!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ 3. GRAPHIQUES ═══ */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-800">
              <span>📈 Revenus Mensuels</span>
              <Badge variant="outline" className="text-xs">{revenueData.length} mois</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="month" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip formatter={(v: any) => `${v.toLocaleString("fr-TN")} DT`}/>
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRev)" name="Revenus"/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-gray-800">💸 Cash Flow (6 mois)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="month" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip formatter={(v: any) => `${v.toLocaleString("fr-TN")} DT`}/>
                <Legend/>
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Entrées" dot={{r:3}}/>
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Sorties" dot={{r:3}}/>
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Net" dot={{r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ═══ 4. CLIENTS + DEPENSES ═══ */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-gray-800"><Users className="w-5 h-5 text-blue-500"/>Top 5 Clients</CardTitle></CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mb-2 opacity-30"/>
                <p className="text-sm">Aucune donnée disponible</p>
                <p className="text-xs mt-1">Ajoutez des factures payées pour voir vos top clients</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topClients.map((client, i) => {
                  const pct = Math.round((client.total / (topClients[0]?.total||1)) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{backgroundColor: COLORS[i%COLORS.length]}}>{i+1}</div>
                          <span className="text-sm font-medium">{client.name}</span>
                          <span className="text-xs text-muted-foreground">({client.count} fact.)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-green-600">{client.total.toLocaleString("fr-TN")} DT</span>
                          <ArrowUpRight className="w-3 h-3 text-green-500"/>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{width:`${pct}%`, backgroundColor: COLORS[i%COLORS.length]}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-800">
              <span>🧾 Dépenses par Catégorie</span>
              <span className="text-sm font-normal text-muted-foreground">Total: {totalExpenses.toLocaleString("fr-TN")} DT</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">Aucune dépense enregistrée</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                    label={({category, percent}) => `${category} ${(percent*100).toFixed(0)}%`}>
                    {expensesByCategory.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v.toLocaleString("fr-TN")} DT`}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ 5. STATUT FACTURES + RESUME ═══ */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader><CardTitle className="text-gray-800">📋 Statut des Factures</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                {val: invoiceStats.paid||0, label:"Payées", bg:"bg-green-50", border:"border-green-100", color:"text-green-600"},
                {val: invoiceStats.pending||0, label:"En attente", bg:"bg-yellow-50", border:"border-yellow-100", color:"text-yellow-600"},
                {val: invoiceStats.overdue||0, label:"En retard", bg:"bg-red-50", border:"border-red-100", color:"text-red-600"},
                {val: invoiceStats.draft||0, label:"Brouillons", bg:"bg-gray-50", border:"border-gray-100", color:"text-gray-600"},
              ].map((item,i) => (
                <div key={i} className={`p-4 ${item.bg} rounded-xl border ${item.border}`}>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.val}</p>
                  <p className={`text-xs font-medium mt-2 ${item.color}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-gray-800">💼 Résumé Financier</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              {label:"Revenus totaux", val:`+${(invoiceStats.totalRevenue||0).toLocaleString("fr-TN")} DT`, color:"text-green-600"},
              {label:"Dépenses totales", val:`-${totalExpenses.toLocaleString("fr-TN")} DT`, color:"text-red-600"},
              {label:"En attente", val:`${(invoiceStats.pendingRevenue||0).toLocaleString("fr-TN")} DT`, color:"text-orange-600"},
            ].map((item,i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`font-bold text-sm ${item.color}`}>{item.val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-gray-800">Bénéfice Net</span>
              <span className={`font-bold text-lg ${(invoiceStats.totalRevenue||0)-totalExpenses>=0?"text-green-600":"text-red-600"}`}>
                {((invoiceStats.totalRevenue||0)-totalExpenses).toLocaleString("fr-TN")} DT
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ 6. AI INSIGHTS (EN BAS) ═══ */}
      {insightsVisible && (
        <Card className="border border-purple-100 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="w-5 h-5 text-purple-600"/>
                <span className="text-purple-800">Recommandations & Alertes Intelligentes</span>
                {insightsLoading && <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/>}
                {!insightsLoading && visibleInsights.length > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">{visibleInsights.length} alertes</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <button onClick={() => setInsightsExpanded(!insightsExpanded)} className="text-gray-500 hover:text-gray-700 p-1 rounded">
                  {insightsExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </button>
                <button onClick={() => setInsightsVisible(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </CardHeader>
          {insightsExpanded && (
            <CardContent>
              {insightsLoading ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/>
                  <p className="text-sm text-purple-700">Analyse en cours...</p>
                </div>
              ) : visibleInsights.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">✅ Aucune alerte — votre activité est saine!</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {insights.map((insight, i) => {
                    if (dismissedInsights.includes(i)) return null;
                    const style = insightStyles[insight.type] || insightStyles.info;
                    return (
                      <div key={i} className={`relative flex items-start gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}>
                        <span className="text-base">{style.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold uppercase tracking-wide ${style.title} mb-1`}>{insight.title}</p>
                          <p className="text-xs text-gray-700">{insight.message}</p>
                          {insight.action && (
                            <button className={`mt-2 text-xs font-medium px-2 py-1 rounded ${style.badge}`}
                              onClick={() => {
                                const routes: Record<string,string> = {
                                  "Voir factures":"/sales","Réduire coûts":"/expenses",
                                  "Relancer clients":"/clients","Voir client":"/clients",
                                  "Suivre":"/sales","Voir rapport":"/bi-dashboard",
                                };
                                const route = routes[insight.action];
                                if (route) window.location.href = route;
                              }}>
                              → {insight.action}
                            </button>
                          )}
                        </div>
                        <button onClick={() => setDismissedInsights(p => [...p, i])} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3 h-3"/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

