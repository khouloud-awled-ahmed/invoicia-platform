import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Plus, Edit, CheckCircle2, XCircle, Clock, Ban, Settings, Search } from 'lucide-react';

const ink = '#0F172A';
const slateMid = '#64748B';
const slateLight = '#94A3B8';
const border = '#E2E8F0';
const indigo = '#4F46E5';

interface Tenant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  adminEmail: string;
  modules: string[];
  subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
  planType: 'CUSTOM' | 'STARTER' | 'BUSINESS' | 'PREMIUM';
  planId?: string;
  status: string;
  currentUsers: number;
  maxUsers: number;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
}

const AVAILABLE_MODULES = [
  { id: 'SALES', label: 'Ventes', description: 'Factures clients, avoirs' },
  { id: 'PURCHASES', label: 'Achats', description: 'Dépenses, fournisseurs' },
  { id: 'PROJECTS', label: 'Projets', description: 'Gestion de projets' },
  { id: 'HR', label: 'RH', description: 'Gestion RH et absences' },
  { id: 'ACCOUNTING', label: 'Comptabilité', description: 'Écritures comptables' },
];

export function PlatformTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState({
    name: '', businessName: '', matriculeFiscal: '', adminEmail: '', adminName: '',
    adminPassword: '', modules: [] as string[], subscriptionStatus: 'PENDING_PAYMENT' as const,
    planType: 'CUSTOM' as const, planId: '', maxUsers: 10,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tenantsData, plansData] = await Promise.all([apiClient.getPlatformTenants(), apiClient.getSubscriptionPlans()]);
      setTenants(tenantsData);
      setPlans(plansData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!newTenant.name || !newTenant.adminEmail || !newTenant.matriculeFiscal) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    try {
      const tenantData: any = { name: newTenant.name, businessName: newTenant.businessName || newTenant.name, matriculeFiscal: newTenant.matriculeFiscal, adminEmail: newTenant.adminEmail, adminName: newTenant.adminName || undefined, adminPassword: newTenant.adminPassword || undefined, modules: newTenant.modules || [], subscriptionStatus: newTenant.subscriptionStatus, planType: newTenant.planType, maxUsers: newTenant.maxUsers || 10 };
      if (newTenant.planId && newTenant.planId !== 'none' && newTenant.planId !== '') tenantData.planId = newTenant.planId;
      await apiClient.createPlatformTenant(tenantData);
      toast.success('Client créé avec succès');
      setIsCreateDialogOpen(false);
      setNewTenant({ name: '', businessName: '', matriculeFiscal: '', adminEmail: '', adminName: '', adminPassword: '', modules: [], subscriptionStatus: 'PENDING_PAYMENT', planType: 'CUSTOM', planId: '', maxUsers: 10 });
      loadData();
    } catch (error: any) {
      toast.error('Erreur lors de la création: ' + (error?.response?.data?.message || error?.message || 'Erreur inconnue'));
    }
  };

  const handleEditTenant = (tenant: Tenant) => { setEditingTenant(tenant); setIsEditDialogOpen(true); };

  const handleUpdateTenant = async (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!editingTenant) return;
    try {
      await apiClient.updatePlatformTenant(editingTenant.id, { name: editingTenant.name, email: editingTenant.email, planId: editingTenant.planId });
      await apiClient.updateTenantSubscriptionStatus(editingTenant.id, editingTenant.subscriptionStatus);
      toast.success('Client mis à jour');
      setIsEditDialogOpen(false);
      setEditingTenant(null);
      loadData();
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setNewTenant((prev) => ({ ...prev, modules: prev.modules.includes(moduleId) ? prev.modules.filter((m) => m !== moduleId) : [...prev.modules, moduleId] }));
  };

  const handleUpdateStatus = async (tenantId: string, status: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED') => {
    try {
      await apiClient.updateTenantSubscriptionStatus(tenantId, status);
      toast.success('Statut mis à jour');
      loadData();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const statusStyle = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      ACTIVE: { label: 'Actif', bg: '#DCFCE7', text: '#15803D', icon: CheckCircle2 },
      PENDING_PAYMENT: { label: 'En attente', bg: '#FEF3C7', text: '#A16207', icon: Clock },
      SUSPENDED: { label: 'Suspendu', bg: '#FEE2E2', text: '#DC2626', icon: Ban },
      TRIAL: { label: 'Essai', bg: '#DBEAFE', text: '#1D4ED8', icon: Clock },
      CANCELLED: { label: 'Annulé', bg: '#F1F5F9', text: '#64748B', icon: XCircle },
    };
    return map[status] || { label: status, bg: '#F1F5F9', text: '#64748B', icon: null };
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = statusStyle(status);
    const Icon = s.icon;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: s.text, background: s.bg, padding: '3px 10px', borderRadius: '999px' }}>
        {Icon && <Icon style={{ width: '11px', height: '11px' }} />}{s.label}
      </span>
    );
  };

  const Pill = ({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'indigo' }) => (
    <span style={{ fontSize: '11px', fontWeight: 500, color: tone === 'indigo' ? indigo : slateMid, background: tone === 'indigo' ? '#EEF2FF' : '#F1F5F9', padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' as const }}>{text}</span>
  );

  const iconBtn: React.CSSProperties = { width: '30px', height: '30px', borderRadius: '7px', border: `1px solid ${border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s ease', flexShrink: 0 };

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <style>{`.pt-row:hover{background:#F8FAFC}.pt-ib:hover{background:#F8FAFC}.pt-ab:hover{background:#4338CA}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: ink, margin: 0 }}>Gestion des clients</h1>
          <p style={{ fontSize: '13px', color: slateMid, margin: '4px 0 0' }}>{tenants.length} entreprise(s) sur la plateforme</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="pt-ab" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', background: indigo, border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', transition: 'background 0.15s ease' }}>
              <Plus style={{ width: '15px', height: '15px' }} />Ajouter un client
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau client</DialogTitle>
              <DialogDescription>Créez manuellement une entreprise et définissez ses modules autorisés</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Nom de l'entreprise *</Label><Input id="name" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} placeholder="Ma Société SARL" /></div>
                <div className="space-y-2"><Label htmlFor="businessName">Nom commercial</Label><Input id="businessName" value={newTenant.businessName} onChange={(e) => setNewTenant({ ...newTenant, businessName: e.target.value })} placeholder="Ma Société" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="matriculeFiscal">Matricule Fiscal *</Label><Input id="matriculeFiscal" value={newTenant.matriculeFiscal} onChange={(e) => setNewTenant({ ...newTenant, matriculeFiscal: e.target.value })} placeholder="1234567/A/B/M/000" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="adminEmail">Email administrateur *</Label><Input id="adminEmail" type="email" value={newTenant.adminEmail} onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })} placeholder="admin@entreprise.com" /></div>
                <div className="space-y-2"><Label htmlFor="adminName">Nom administrateur</Label><Input id="adminName" value={newTenant.adminName} onChange={(e) => setNewTenant({ ...newTenant, adminName: e.target.value })} placeholder="Jean Dupont" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="adminPassword">Mot de passe admin (optionnel)</Label><Input id="adminPassword" type="password" value={newTenant.adminPassword} onChange={(e) => setNewTenant({ ...newTenant, adminPassword: e.target.value })} placeholder="Laissé vide = mot de passe temporaire" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionStatus">Statut abonnement</Label>
                  <Select value={newTenant.subscriptionStatus} onValueChange={(value: any) => setNewTenant({ ...newTenant, subscriptionStatus: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING_PAYMENT">En attente de paiement</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="TRIAL">Essai</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planId">Plan d'abonnement</Label>
                  <Select value={newTenant.planId || 'none'} onValueChange={(value) => setNewTenant({ ...newTenant, planId: value === 'none' ? '' : value })}>
                    <SelectTrigger><SelectValue placeholder="Aucun plan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun plan (Personnalisé)</SelectItem>
                      {plans.map((plan) => (<SelectItem key={plan.id} value={plan.id}>{plan.name} - {plan.price}€/mois</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modules autorisés</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_MODULES.map((module) => (
                    <div key={module.id} className="flex items-start space-x-2">
                      <Checkbox id={module.id} checked={newTenant.modules.includes(module.id)} onCheckedChange={() => handleToggleModule(module.id)} />
                      <div className="flex-1"><Label htmlFor={module.id} className="font-medium cursor-pointer">{module.label}</Label><p className="text-xs text-muted-foreground">{module.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
              <Button type="button" onClick={handleCreateTenant}>Créer le client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 12px', maxWidth: '320px', marginBottom: '12px' }}>
        <Search style={{ width: '14px', height: '14px', color: slateLight, flexShrink: 0 }} />
        <input placeholder="Rechercher un client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: ink, width: '100%' }} />
        {searchQuery && <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: slateLight, fontSize: '16px', lineHeight: 1, padding: 0 }}>×</button>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '12.5px', color: slateMid }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '12.5px', color: slateMid }}>
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucun client pour le moment'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nom', 'Email admin', 'Modules', 'Plan', 'Statut', 'Utilisateurs', 'Actions'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 6 ? 'right' : 'left', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: slateLight, padding: '10px 18px', borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant, idx) => (
                <tr key={tenant.id} className="pt-row" style={{ transition: 'background 0.12s ease' }}>
                  <td style={{ padding: '12px 18px', fontSize: '13px', fontWeight: 500, color: ink, borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>{tenant.name}</td>
                  <td style={{ padding: '12px 18px', fontSize: '12.5px', color: slateMid, borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>{tenant.adminEmail}</td>
                  <td style={{ padding: '12px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                      {tenant.modules && tenant.modules.length > 0
                        ? tenant.modules.map((m) => <Pill key={m} text={AVAILABLE_MODULES.find((x) => x.id === m)?.label || m} />)
                        : <span style={{ fontSize: '11.5px', color: slateLight }}>Aucun module</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>
                    <Pill text={tenant.planId ? (plans.find((p) => p.id === tenant.planId)?.name || 'Plan inconnu') : tenant.planType} tone="indigo" />
                  </td>
                  <td style={{ padding: '12px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, whiteSpace: 'nowrap' as const }}><StatusBadge status={tenant.subscriptionStatus} /></td>
                  <td style={{ padding: '12px 18px', fontSize: '12.5px', color: slateMid, borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>{tenant.currentUsers} / {tenant.maxUsers}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="pt-ib" style={iconBtn} onClick={() => handleEditTenant(tenant)} title="Modifier"><Edit style={{ width: '13px', height: '13px', color: slateMid }} /></button>
                      <button className="pt-ib" style={iconBtn} title="Activer / suspendre" onClick={() => handleUpdateStatus(tenant.id, tenant.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}><Settings style={{ width: '13px', height: '13px', color: slateMid }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le client</DialogTitle><DialogDescription>Modifiez les informations et le plan d'abonnement</DialogDescription></DialogHeader>
          {editingTenant && (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="edit-name">Nom de l'entreprise</Label><Input id="edit-name" value={editingTenant.name} onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="edit-adminEmail">Email administrateur</Label><Input id="edit-adminEmail" type="email" value={editingTenant.adminEmail} onChange={(e) => setEditingTenant({ ...editingTenant, adminEmail: e.target.value })} /></div>
              <div className="space-y-2">
                <Label htmlFor="edit-planId">Plan d'abonnement</Label>
                <Select value={editingTenant.planId || 'none'} onValueChange={(value) => setEditingTenant({ ...editingTenant, planId: value === 'none' ? undefined : value })}>
                  <SelectTrigger><SelectValue placeholder="Aucun plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun plan (Personnalisé)</SelectItem>
                    {plans.map((plan) => (<SelectItem key={plan.id} value={plan.id}>{plan.name} - {plan.price}€/mois</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Statut abonnement</Label>
                <Select value={editingTenant.subscriptionStatus} onValueChange={(value: any) => setEditingTenant({ ...editingTenant, subscriptionStatus: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_PAYMENT">En attente de paiement</SelectItem>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="TRIAL">Essai</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button type="button" onClick={handleUpdateTenant}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}