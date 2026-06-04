import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Euro, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell
} from "recharts";
import { apiClient } from "../lib/api-client-backend";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#7c3aed", "#4f46e5"];

export function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    invoicesThisMonth: 0,
    activeClients: 0,
    paymentRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number }[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, clientsRes] = await Promise.allSettled([
        apiClient.getInvoices?.() || Promise.resolve([]),
        apiClient.getClients?.() || Promise.resolve([]),
      ]);
      const invoices = invoicesRes.status === "fulfilled" ? (invoicesRes.value || []) : [];
      const clients = clientsRes.status === "fulfilled" ? (clientsRes.value || []) : [];
      const totalRevenue = invoices
        .filter((inv: any) => !["cancelled", "archived"].includes(inv.status))
        .reduce((sum: number, inv: any) => sum + (inv.amountTTC || 0), 0);
      const now = new Date();
      const invoicesThisMonth = invoices.filter((inv: any) => {
        const d = new Date(inv.createdAt || inv.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      const paid = invoices.filter((inv: any) => inv.status === "PAID" || inv.status === "paid").length;
      const paymentRate = invoices.length > 0 ? Math.round((paid / invoices.length) * 100) : 0;
      const months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
      const monthly: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        monthly[months[d.getMonth()]] = 0;
      }
      invoices.forEach((inv: any) => {
        if (!["cancelled", "archived"].includes(inv.status)) {
          const d = new Date(inv.createdAt || inv.date);
          const key = months[d.getMonth()];
          if (key in monthly) monthly[key] += inv.amountTTC || 0;
        }
      });
      setStats({ totalRevenue, invoicesThisMonth, activeClients: clients.length, paymentRate });
      setMonthlyData(Object.entries(monthly).map(([month, revenue]) => ({ month, revenue })));
      setRecentInvoices([...invoices].sort((a: any, b: any) =>
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()).slice(0, 5));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "PAID") return "bg-green-100 text-green-700 border border-green-200";
    if (s === "OVERDUE" || s === "LATE") return "bg-red-100 text-red-700 border border-red-200";
    if (s === "CANCELLED") return "bg-gray-100 text-gray-600 border border-gray-200";
    return "bg-amber-100 text-amber-700 border border-amber-200";
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      PAID: "Payée", DRAFT: "Brouillon", SENT: "Envoyée",
      OVERDUE: "En retard", CANCELLED: "Annulée", PENDING: "En attente",
    };
    return map[status?.toUpperCase()] || status;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-purple-100 rounded-xl shadow-lg p-3">
          <p className="text-xs font-semibold text-purple-600 mb-1">{label}</p>
          <p className="text-sm font-bold text-gray-800">{payload[0].value.toLocaleString("fr-FR")} €</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vue d'ensemble de votre activité
            {lastUpdated && <span className="ml-2 text-xs text-gray-400">· {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboard} className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", borderRadius: "16px", padding: "20px", color: "white", boxShadow: "0 10px 25px rgba(139,92,246,0.3)"}}>  
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">Revenu total</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString("fr-FR")} €</p>
          <p className="text-xs mt-2 opacity-70">{stats.totalRevenue > 0 ? "✓ Factures payées" : "Aucune vente"}</p>
        </div>

        <div style={{background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", borderRadius: "16px", padding: "20px", color: "white", boxShadow: "0 10px 25px rgba(59,130,246,0.3)"}}>  
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">Ventes ce mois</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.invoicesThisMonth}</p>
          <p className="text-xs mt-2 opacity-70">Ce mois-ci</p>
        </div>

        <div style={{background: "linear-gradient(135deg, #10b981, #065f46)", borderRadius: "16px", padding: "20px", color: "white", boxShadow: "0 10px 25px rgba(16,185,129,0.3)"}}>  
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">Clients actifs</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.activeClients}</p>
          <p className="text-xs mt-2 opacity-70">Total clients</p>
        </div>

        <div style={{background: "linear-gradient(135deg, #f59e0b, #ea580c)", borderRadius: "16px", padding: "20px", color: "white", boxShadow: "0 10px 25px rgba(245,158,11,0.3)"}}>  
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">Taux de paiement</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.paymentRate}%</p>
          <p className="text-xs mt-2 opacity-70">{stats.paymentRate >= 80 ? "✓ Bon taux" : "À améliorer"}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Revenus mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {monthlyData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3}
                  fill="url(#areaGradient)" dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card className="rounded-2xl border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800">Ventes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune facture pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id || invoice._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{invoice.number || invoice.id}</p>
                      <p className="text-xs text-gray-400">{invoice.client || "Client"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-800">{(invoice.amountTTC || 0).toLocaleString("fr-FR")} €</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

