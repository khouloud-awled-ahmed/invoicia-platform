import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';

const ink = '#0F172A';
const slateMid = '#64748B';
const slateLight = '#94A3B8';
const border = '#E2E8F0';
const indigo = '#4F46E5';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  maxUsers: number;
  isActive: boolean;
}

const AVAILABLE_MODULES = [
  { id: 'SALES', label: 'Ventes', description: 'Factures clients, avoirs' },
  { id: 'PURCHASES', label: 'Achats', description: 'Dépenses, fournisseurs' },
  { id: 'PROJECTS', label: 'Projets', description: 'Gestion de projets' },
  { id: 'HR', label: 'RH', description: 'Gestion RH et absences' },
  { id: 'ACCOUNTING', label: 'Comptabilité', description: 'Écritures comptables' },
];

export function PlatformPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlan, setNewPlan] = useState({ name: '', description: '', price: 0, currency: 'EUR', features: [] as string[], maxUsers: 10, isActive: true });

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getSubscriptionPlans();
      setPlans(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des plans: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!newPlan.name || newPlan.price < 0) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    try {
      await apiClient.createSubscriptionPlan(newPlan);
      toast.success('Plan créé avec succès');
      setIsCreateDialogOpen(false);
      setNewPlan({ name: '', description: '', price: 0, currency: 'EUR', features: [], maxUsers: 10, isActive: true });
      loadPlans();
    } catch (error: any) {
      toast.error('Erreur lors de la création: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => { setEditingPlan(plan); setIsEditDialogOpen(true); };

  const handleUpdatePlan = async (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!editingPlan) return;
    try {
      await apiClient.updateSubscriptionPlan(editingPlan.id, { name: editingPlan.name, description: editingPlan.description, price: editingPlan.price, currency: editingPlan.currency, features: editingPlan.features, maxUsers: editingPlan.maxUsers, isActive: editingPlan.isActive });
      toast.success('Plan mis à jour');
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;
    try {
      await apiClient.deleteSubscriptionPlan(id);
      toast.success('Plan supprimé');
      loadPlans();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleToggleModule = (moduleId: string, isEdit = false) => {
    if (isEdit && editingPlan) {
      setEditingPlan({ ...editingPlan, features: editingPlan.features.includes(moduleId) ? editingPlan.features.filter((m) => m !== moduleId) : [...editingPlan.features, moduleId] });
    } else {
      setNewPlan((prev) => ({ ...prev, features: prev.features.includes(moduleId) ? prev.features.filter((m) => m !== moduleId) : [...prev.features, moduleId] }));
    }
  };

  const Pill = ({ text }: { text: string }) => (
    <span style={{ fontSize: '11px', fontWeight: 500, color: slateMid, background: '#F1F5F9', padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' as const }}>{text}</span>
  );

  const iconBtn: React.CSSProperties = { width: '30px', height: '30px', borderRadius: '7px', border: `1px solid ${border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s ease' };

  const filtered = plans.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <style>{`.pp-row:hover{background:#F8FAFC}.pp-ib:hover{background:#F8FAFC}.pp-del:hover{background:#FEF2F2}.pp-ab:hover{background:#4338CA}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: ink, margin: 0 }}>Gestion des Plans</h1>
          <p style={{ fontSize: '13px', color: slateMid, margin: '4px 0 0' }}>{plans.length} plan(s) d'abonnement configuré(s)</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="pp-ab" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', background: indigo, border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', transition: 'background 0.15s ease' }}>
              <Plus style={{ width: '15px', height: '15px' }} />Créer un Plan
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau plan</DialogTitle>
              <DialogDescription>Définissez les modules inclus et le prix du plan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="plan-name">Nom du plan *</Label><Input id="plan-name" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="Starter, Business, Premium..." /></div>
              <div className="space-y-2"><Label htmlFor="plan-description">Description</Label><Input id="plan-description" value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Description du plan" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="plan-price">Prix (€) *</Label><Input id="plan-price" type="number" min="0" step="0.01" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label htmlFor="plan-maxUsers">Utilisateurs max</Label><Input id="plan-maxUsers" type="number" min="1" value={newPlan.maxUsers} onChange={(e) => setNewPlan({ ...newPlan, maxUsers: parseInt(e.target.value) || 10 })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Modules inclus</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_MODULES.map((module) => (
                    <div key={module.id} className="flex items-start space-x-2">
                      <Checkbox id={`new-${module.id}`} checked={newPlan.features.includes(module.id)} onCheckedChange={() => handleToggleModule(module.id)} />
                      <div className="flex-1"><Label htmlFor={`new-${module.id}`} className="font-medium cursor-pointer">{module.label}</Label><p className="text-xs text-muted-foreground">{module.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
              <Button type="button" onClick={handleCreatePlan}>Créer le plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 12px', maxWidth: '320px', marginBottom: '12px' }}>
        <Search style={{ width: '14px', height: '14px', color: slateLight, flexShrink: 0 }} />
        <input placeholder="Rechercher un plan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: ink, width: '100%' }} />
        {searchQuery && <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: slateLight, fontSize: '16px', lineHeight: 1, padding: 0 }}>×</button>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '12.5px', color: slateMid }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '12.5px', color: slateMid }}>
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucun plan configuré'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nom', 'Description', 'Prix', 'Modules', 'Utilisateurs max', 'Statut', 'Actions'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 6 ? 'right' : 'left', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: slateLight, padding: '10px 18px', borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((plan, idx) => (
                <tr key={plan.id} className="pp-row" style={{ transition: 'background 0.12s ease' }}>
                  <td style={{ padding: '12px 18px', fontSize: '13px', fontWeight: 600, color: ink, borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>{plan.name}</td>
                  <td style={{ padding: '12px 18px', fontSize: '12.5px', color: slateMid, borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, maxWidth: '200px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{plan.description || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}`, whiteSpace: 'nowrap' as const }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: ink }}>€ {plan.price}</span>
                    <span style={{ fontSize: '11.5px', color: slateLight }}> /mois</span>
                  </td>
                  <td style={{ padding: '12px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                      {plan.features && plan.features.length > 0
                        ? plan.features.map((f) => <Pill key={f} text={AVAILABLE_MODULES.find((m) => m.id === f)?.label || f} />)
                        : <span style={{ fontSize: '11.5px', color: slateLight }}>Aucun</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: '12.5px', color: slateMid, borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>{plan.maxUsers}</td>
                  <td style={{ padding: '12px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>
                    {plan.isActive
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#15803D', background: '#DCFCE7', padding: '3px 10px', borderRadius: '999px' }}><CheckCircle2 style={{ width: '11px', height: '11px' }} />Actif</span>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '3px 10px', borderRadius: '999px' }}><XCircle style={{ width: '11px', height: '11px' }} />Inactif</span>}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${border}` }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="pp-ib" style={iconBtn} onClick={() => handleEditPlan(plan)} title="Modifier"><Edit style={{ width: '13px', height: '13px', color: slateMid }} /></button>
                      <button className="pp-del" style={{ ...iconBtn, borderColor: '#FEE2E2' }} onClick={() => handleDeletePlan(plan.id)} title="Supprimer"><Trash2 style={{ width: '13px', height: '13px', color: '#DC2626' }} /></button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier le plan</DialogTitle><DialogDescription>Modifiez les informations et les modules du plan</DialogDescription></DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="edit-plan-name">Nom du plan</Label><Input id="edit-plan-name" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="edit-plan-description">Description</Label><Input id="edit-plan-description" value={editingPlan.description || ''} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="edit-plan-price">Prix (€)</Label><Input id="edit-plan-price" type="number" min="0" step="0.01" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label htmlFor="edit-plan-maxUsers">Utilisateurs max</Label><Input id="edit-plan-maxUsers" type="number" min="1" value={editingPlan.maxUsers} onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: parseInt(e.target.value) || 10 })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Modules inclus</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_MODULES.map((module) => (
                    <div key={module.id} className="flex items-start space-x-2">
                      <Checkbox id={`edit-${module.id}`} checked={editingPlan.features.includes(module.id)} onCheckedChange={() => handleToggleModule(module.id, true)} />
                      <div className="flex-1"><Label htmlFor={`edit-${module.id}`} className="font-medium cursor-pointer">{module.label}</Label><p className="text-xs text-muted-foreground">{module.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="edit-plan-active" checked={editingPlan.isActive} onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, isActive: checked as boolean })} />
                <Label htmlFor="edit-plan-active" className="cursor-pointer">Plan actif</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button type="button" onClick={handleUpdatePlan}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}