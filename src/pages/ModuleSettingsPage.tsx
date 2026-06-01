import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Package, Briefcase, FolderKanban, Landmark, Users } from "lucide-react";

const MODULE_GROUPS: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keys: { key: string; label: string }[];
}[] = [
  {
    title: "Vente",
    description: "Clients, CRM, facturation, fournisseurs",
    icon: Briefcase,
    keys: [
      { key: "module_clients", label: "Clients" },
      { key: "module_crm", label: "Pipeline CRM" },
      { key: "module_invoicing", label: "Facturation (factures, avoirs, dépenses)" },
      { key: "module_suppliers", label: "Fournisseurs" },
    ],
  },
  {
    title: "Opérations",
    description: "Projets",
    icon: FolderKanban,
    keys: [
      { key: "module_projects", label: "Projets" },
    ],
  },
  {
    title: "Finance",
    description: "Comptabilité, paiements, banque",
    icon: Landmark,
    keys: [
      { key: "module_accounting", label: "Comptabilité" },
      { key: "module_payments", label: "Paiements" },
      { key: "module_banking", label: "Banque" },
    ],
  },
  {
    title: "RH & Outils",
    description: "RH, CV Tech, GED, signature",
    icon: Users,
    keys: [
      { key: "module_hr", label: "RH & Absences" },
      { key: "module_cvtech", label: "CV Tech" },
      { key: "module_ged", label: "GED" },
      { key: "module_signature", label: "Signature électronique" },
    ],
  },
];

export function ModuleSettingsPage() {
  const [moduleFlags, setModuleFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      if (user.role === "PLATFORM_ADMIN" || !user.tenantId) {
        setLoading(false);
        return;
      }
      setTenantId(user.tenantId);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      try {
        const flags = await apiClient.getTenantModuleFlags(tenantId);
        setModuleFlags(flags);
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger les modules");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenantId]);

  const handleToggle = (key: string, value: boolean) => {
    setModuleFlags((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await apiClient.updateTenantModules(tenantId, moduleFlags);
      toast.success("Modules enregistrés.");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-muted-foreground">Chargement des modules…</p>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-muted-foreground">Réservé aux administrateurs de société.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-7 w-7" />
          Modules (App Store)
        </h1>
        <p className="text-muted-foreground mt-1">
          Activez ou désactivez les modules visibles dans le menu. Les données existantes ne sont pas modifiées.
        </p>
      </div>

      {MODULE_GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {group.title}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.keys.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="cursor-pointer flex-1">
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={!!moduleFlags[key]}
                    onCheckedChange={(v) => handleToggle(key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer les modules"}
        </Button>
      </div>
    </div>
  );
}
