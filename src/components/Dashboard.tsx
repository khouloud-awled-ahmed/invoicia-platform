import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Euro, Users, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
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
    if (s === "PAID") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (s === "OVERDUE" || s === "LATE") return "bg-red-50 text-red-700 border border-red-200";
    if (s === "CANCELLED") return "bg-gray-100 text-gray-500 border border-gray-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      PAID: "Payée", DRAFT: "Brouillon", SENT: "Envoyée",
      OVERDUE: "En retard", CANCELLED: "Annulée", PENDING: "En attente",
    };
    return map[status?.toUpperCase()] || status;
  };

  const getInitials = (name: string) => {
    if (!name) return "CL";
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg shadow-purple-100/50 p-3">
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

  // Stat card config
  const statCards = [
    {
      label: "Revenu total",
      value: `${stats.totalRevenue.toLocaleString("fr-FR")} €`,
      icon: Euro,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      up: stats.totalRevenue > 0,
      footer: stats.totalRevenue > 0 ? "Factures payées" : "Aucune vente",
    },
    {
      label: "Ventes ce mois",
      value: stats.invoicesThisMonth,
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      up: true,
      footer: "Ce mois-ci",
    },
    {
      label: "Clients actifs",
      value: stats.activeClients,
      icon: Users,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      up: true,
      footer: "Total clients",
    },
    {
      label: "Taux de paiement",
      value: `${stats.paymentRate}%`,
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      up: stats.paymentRate >= 80,
      footer: stats.paymentRate >= 80 ? "Bon taux" : "À améliorer",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-purple-300/30">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute right-16 bottom-[-40px] w-32 h-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tableau de bord</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vue d'ensemble de votre activité</h1>
            <p className="text-sm text-white/70 mt-1">
              {lastUpdated
                ? `Dernière mise à jour à ${lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                : "Chargement des données..."}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboard}
            className="gap-2 bg-white/15 hover:bg-white/25 text-white border-0 rounded-xl backdrop-blur-sm w-fit"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI Cards — white cards, colored icon badge, trend chip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.up ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-full ${
                    card.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}
                >
                  <TrendIcon className="w-3 h-3" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">{card.footer}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Revenus mensuels</CardTitle>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">6 derniers mois</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={monthlyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f3ff" }} />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {monthlyData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Évolution des revenus</CardTitle>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">Tendance</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-800">Ventes récentes</CardTitle>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              {recentInvoices.length} facture{recentInvoices.length > 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune facture pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((invoice: any) => (
                <div
                  key={invoice.id || invoice._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-transparent bg-gray-50/60 hover:bg-purple-50 hover:border-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-purple-200">
                      {getInitials(invoice.client)}
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