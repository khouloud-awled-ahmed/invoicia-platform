import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../lib/api-client-backend';
import {
  Building2, Users, Package, TrendingUp,
  CheckCircle2, Clock, Ban, Settings, RefreshCw
} from 'lucide-react';

export function PlatformDashboardPage() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    pendingTenants: 0,
    suspendedTenants: 0,
    totalPlans: 0,
    totalRevenue: 0,
  });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [tenantsData, plansData] = await Promise.all([
        apiClient.getPlatformTenants(),
        apiClient.getSubscriptionPlans(),
      ]);

      const activeTenants = tenantsData.filter((t: any) => t.subscriptionStatus === 'ACTIVE').length;
      const pendingTenants = tenantsData.filter((t: any) => t.subscriptionStatus === 'PENDING_PAYMENT').length;
      const suspendedTenants = tenantsData.filter((t: any) => t.subscriptionStatus === 'SUSPENDED').length;

      // Calcul revenu mensuel estimé
      const totalRevenue = tenantsData.reduce((sum: number, tenant: any) => {
        if (tenant.subscriptionStatus === 'ACTIVE' && tenant.planId) {
          const plan = plansData.find((p: any) => p.id === tenant.planId);
          return sum + (plan?.price || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalTenants: tenantsData.length,
        activeTenants,
        pendingTenants,
        suspendedTenants,
        totalPlans: plansData.length,
        totalRevenue,
      });

      // 5 derniers clients
      setRecentTenants(tenantsData.slice(-5).reverse());
      setPlans(plansData);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
      PENDING_PAYMENT: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      SUSPENDED: { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
      TRIAL: { label: 'Essai', color: 'bg-blue-100 text-blue-700' },
      CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700' },
    };
    const cfg = map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Plateforme</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de la plateforme SaaS
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                · Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadStats} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">Entreprises inscrites</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">Abonnements actifs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">Paiement en attente</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans Disponibles</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">Offres configurées</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Suspended row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Mensuel Estimé</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.totalRevenue > 0 ? `${stats.totalRevenue.toLocaleString('fr-FR')} €` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Basé sur les abonnements actifs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Suspendus</CardTitle>
            <Ban className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.suspendedTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">Accès suspendu</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants + Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent clients table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Derniers Clients</CardTitle>
            <CardDescription>Les 5 dernières entreprises inscrites</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTenants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun client pour le moment</p>
            ) : (
              <div className="space-y-3">
                {recentTenants.map((tenant: any) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-700 font-bold text-sm">
                          {tenant.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">{tenant.adminEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {tenant.currentUsers}/{tenant.maxUsers} users
                      </span>
                      {getStatusBadge(tenant.subscriptionStatus)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions Rapides</CardTitle>
            <CardDescription>Accès direct</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto p-3 flex flex-col items-start gap-1"
              onClick={() => (window.location.href = '/platform/tenants')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-sm">Gérer les Clients</span>
              </div>
              <span className="text-xs text-muted-foreground">Voir et modifier les entreprises</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto p-3 flex flex-col items-start gap-1"
              onClick={() => (window.location.href = '/platform/plans')}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm">Gérer les Plans</span>
              </div>
              <span className="text-xs text-muted-foreground">Créer et modifier les offres</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto p-3 flex flex-col items-start gap-1"
              onClick={() => (window.location.href = '/platform/settings')}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="font-semibold text-sm">Paramètres</span>
              </div>
              <span className="text-xs text-muted-foreground">Configuration de la plateforme</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}