import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Euro, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { apiClient } from "../lib/api-client-backend";

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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      // Load invoices + clients in parallel
      const [invoicesRes, clientsRes] = await Promise.allSettled([
        apiClient.getInvoices?.() || Promise.resolve([]),
        apiClient.getClients?.() || Promise.resolve([]),
      ]);

      const invoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value || []) : [];
      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value || []) : [];

      // Total revenue from paid invoices
      const totalRevenue = invoices
        .filter((inv: any) => !['cancelled', 'archived'].includes(inv.status))
        .reduce((sum: number, inv: any) => sum + (inv.amountTTC || 0), 0);
      // Invoices this month
      const now = new Date();
      const invoicesThisMonth = invoices.filter((inv: any) => {
        const d = new Date(inv.createdAt || inv.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Payment rate
      const paid = invoices.filter((inv: any) => inv.status === 'PAID' || inv.status === 'paid').length;
      const paymentRate = invoices.length > 0 ? Math.round((paid / invoices.length) * 100) : 0;

      // Monthly revenue (last 6 months)
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthly: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthly[months[d.getMonth()]] = 0;
      }
      invoices.forEach((inv: any) => {
        if (!['cancelled', 'archived'].includes(inv.status)) {
          const d = new Date(inv.createdAt || inv.date);
          const key = months[d.getMonth()];
          if (key in monthly) {
            monthly[key] += inv.amountTTC || 0;
          }
        }
      });
      const monthlyArr = Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));

      // Recent invoices (last 5)
      const recent = [...invoices]
        .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
        .slice(0, 5);

      setStats({
        totalRevenue,
        invoicesThisMonth,
        activeClients: clients.length,
        paymentRate,
      });
      setMonthlyData(monthlyArr);
      setRecentInvoices(recent);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'PAID') return 'bg-green-100 text-green-800';
    if (s === 'OVERDUE' || s === 'LATE') return 'bg-red-100 text-red-800';
    if (s === 'CANCELLED') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'Payée', DRAFT: 'Brouillon', SENT: 'Envoyée',
      OVERDUE: 'En retard', CANCELLED: 'Annulée', PENDING: 'En attente',
    };
    return map[status?.toUpperCase()] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                · {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboard} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenu total"
          value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`}
          icon={Euro}
          trend={stats.totalRevenue > 0 ? "Factures payées" : "Aucune vente"}
          trendUp={stats.totalRevenue > 0}
        />
        <StatsCard
          title="Ventes ce mois"
          value={String(stats.invoicesThisMonth)}
          icon={FileText}
          trend="Ce mois-ci"
          trendUp={stats.invoicesThisMonth > 0}
        />
        <StatsCard
          title="Clients actifs"
          value={String(stats.activeClients)}
          icon={Users}
          trend="Total clients"
          trendUp={stats.activeClients > 0}
        />
        <StatsCard
          title="Taux de paiement"
          value={`${stats.paymentRate}%`}
          icon={TrendingUp}
          trend={stats.paymentRate >= 80 ? "Bon taux" : "À améliorer"}
          trendUp={stats.paymentRate >= 80}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.every(d => d.revenue === 0) ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Aucune donnée de revenus pour le moment
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString('fr-FR')} €`, 'Revenus']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.every(d => d.revenue === 0) ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString('fr-FR')} €`, 'Revenus']} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune facture pour le moment</p>
              <p className="text-xs mt-1">Créez votre première facture dans le module Facturation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id || invoice._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{invoice.number || invoice.id}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {invoice.client || 'Client'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <p className="font-medium">
                    {(invoice.amountTTC || 0).toLocaleString('fr-FR')} €        
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(invoice.status)}`}>
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