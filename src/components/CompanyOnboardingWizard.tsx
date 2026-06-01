import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Loader2, Building2, FileText, Landmark, FolderOpen, Rocket } from "lucide-react";
import type { Tenant } from "../lib/tenants";

const INVOICE_TEMPLATES = [
  { value: "classique", label: "Classique" },
  { value: "moderne", label: "Moderne" },
  { value: "minimaliste", label: "Minimaliste" },
];

export function CompanyOnboardingWizard() {
  const { tenant, refreshTenant } = useCompanySettings();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [warnEInvoicing, setWarnEInvoicing] = useState(0);

  // Données du formulaire (synchronisées avec le tenant)
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    matriculeFiscal: "",
    registreCommerce: "",
    affiliationCNSS: "",
    tvaNumber: "",
    address: { line1: "", line2: "", postalCode: "", city: "", country: "Tunisie" },
    email: "",
    logo: "",
    invoiceTemplate: "moderne",
    facturXGeneration: true,
    eInvoicingTransmission: false,
    defaultBankAccount: { bankName: "", bankAddress: "", iban: "", bic: "" },
    gedAutoRecognition: false,
  });

  const tenantId = tenant?.id || (tenant as any)?._id;
  const isConfigured = tenant?.isConfigured === true;
  const moduleFlags = (tenant as any)?.moduleFlags || {};
  const hasBanking = moduleFlags.module_banking !== false;
  const hasGed = moduleFlags.module_ged === true;

  const open = Boolean(tenantId && !isConfigured);

  // Initialiser le formulaire depuis le tenant
  React.useEffect(() => {
    if (!tenant) return;
    setForm((prev) => ({
      ...prev,
      name: tenant.name || prev.name,
      businessName: tenant.businessName || prev.businessName,
      matriculeFiscal: (tenant as any).matriculeFiscal || prev.matriculeFiscal,
      registreCommerce: (tenant as any).registreCommerce || prev.registreCommerce,
      affiliationCNSS: (tenant as any).affiliationCNSS || prev.affiliationCNSS,
      tvaNumber: tenant.tvaNumber || prev.tvaNumber,
      address: {
        ...prev.address,
        ...tenant.address,
        country: tenant.address?.country || "Tunisie",
      },
      email: tenant.email || prev.email,
      logo: tenant.logo || prev.logo,
      invoiceTemplate: (tenant.invoiceSettings as any)?.template || "moderne",
      facturXGeneration: (tenant.invoiceSettings as any)?.facturXGeneration !== false,
      eInvoicingTransmission: (tenant.invoiceSettings as any)?.eInvoicingTransmission === true,
      defaultBankAccount: {
        ...prev.defaultBankAccount,
        ...tenant.defaultBankAccount,
      },
    }));
  }, [tenant]);

  const totalSteps = useMemo(() => {
    let n = 2;
    if (hasBanking) n++;
    if (hasGed) n++;
    return n;
  }, [hasBanking, hasGed]);

  const currentStepIndex = useMemo(() => {
    if (step === 1) return 1;
    if (step === 2) return 2;
    if (hasBanking && step === 3) return 3;
    if (hasGed && (step === (hasBanking ? 4 : 3))) return totalSteps;
    return step;
  }, [step, hasBanking, hasGed, totalSteps]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choisissez une image (PNG, JPG).");
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.uploadLogo(tenantId, file);
      const id = (res as any)?.data?.id || (res as any)?.data?._id;
      if (id) {
        const base = (import.meta as any).env?.VITE_API_URL || "/api";
        const url = `${base}/attachments/download/${id}`;
        setForm((f) => ({ ...f, logo: url }));
        toast.success("Logo enregistré.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur upload logo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEInvoicingChoice = (choice: "facturx" | "portail") => {
    if (choice === "portail") {
      if (warnEInvoicing === 0) {
        setWarnEInvoicing(1);
        toast.warning("Action irréversible. Confirmez une seconde fois.");
        return;
      }
      if (warnEInvoicing === 1) {
        setWarnEInvoicing(2);
        toast.warning("Flux fiscal réel. Vous confirmez ?");
        return;
      }
      setForm((f) => ({
        ...f,
        eInvoicingTransmission: true,
        facturXGeneration: false,
      }));
      setWarnEInvoicing(0);
    } else {
      setForm((f) => ({
        ...f,
        facturXGeneration: true,
        eInvoicingTransmission: false,
      }));
      setWarnEInvoicing(0);
    }
  };

  const canNext = () => {
    if (step === 1) {
      return form.name?.trim() && form.matriculeFiscal?.trim() && form.email?.trim();
    }
    if (step === 2) return true;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      if (step === 2 && hasBanking) setStep(3);
      else if ((hasBanking && step === 3) || (!hasBanking && step === 2)) {
        if (hasGed) setStep(hasBanking ? 4 : 3);
        else handleFinish();
      } else if (step === 1) setStep(2);
      else handleFinish();
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await apiClient.updateTenant(tenantId, {
        name: form.name,
        businessName: form.businessName,
        matriculeFiscal: form.matriculeFiscal,
        registreCommerce: form.registreCommerce || undefined,
        affiliationCNSS: form.affiliationCNSS || undefined,
        tvaNumber: form.tvaNumber,
        address: form.address,
        email: form.email,
        logo: form.logo || undefined,
        invoiceSettings: {
          ...(tenant?.invoiceSettings as object),
          template: form.invoiceTemplate,
          facturXGeneration: form.facturXGeneration,
          eInvoicingTransmission: form.eInvoicingTransmission,
        },
        defaultBankAccount: hasBanking ? form.defaultBankAccount : undefined,
        isConfigured: true,
      });
      toast.success("Espace configuré. Bienvenue !");
      await refreshTenant();
      setStep(1);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l’enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const isLastStep =
      (hasBanking && hasGed && step === 4) ||
      (hasBanking && !hasGed && step === 3) ||
      (!hasBanking && hasGed && step === 3) ||
      (!hasBanking && !hasGed && step === 2);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        resizable={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle>Configuration de votre espace</DialogTitle>
          <DialogDescription>
            Étape {currentStepIndex} / {totalSteps} — Complétez ces informations pour activer votre espace.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Identité légale & branding
              </CardTitle>
              <CardDescription>Nom, Matricule Fiscal, adresse, email et logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom société *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ma Société SAS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raison sociale</Label>
                  <Input
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    placeholder="Ma Société"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Matricule Fiscal *</Label>
                  <Input
                    value={form.matriculeFiscal}
                    onChange={(e) => setForm((f) => ({ ...f, matriculeFiscal: e.target.value }))}
                    placeholder="1234567/A/B/M/000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro TVA</Label>
                  <Input
                    value={form.tvaNumber}
                    onChange={(e) => setForm((f) => ({ ...f, tvaNumber: e.target.value }))}
                    placeholder="TVA Tunisie"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={form.address.line1}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: { ...f.address, line1: e.target.value } }))
                  }
                  placeholder="N° et voie"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={form.address.postalCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: { ...f.address, postalCode: e.target.value } }))
                    }
                    placeholder="CP"
                  />
                  <Input
                    value={form.address.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))
                    }
                    placeholder="Ville"
                  />
                  <Input
                    value={form.address.country}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: { ...f.address, country: e.target.value } }))
                    }
                    placeholder="Pays"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email facturation *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="facturation@..."
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {form.logo && (
                    <img src={form.logo} alt="Logo" className="h-16 w-auto object-contain border rounded" />
                  )}
                  <Input type="file" accept="image/*" onChange={handleLogoChange} disabled={saving} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Paramétrage facturation
              </CardTitle>
              <CardDescription>Modèle de facture et conformité 2026.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Modèle de facture</Label>
                <Select
                  value={form.invoiceTemplate}
                  onValueChange={(v) => setForm((f) => ({ ...f, invoiceTemplate: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TEMPLATES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conformité facturation électronique</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant={form.facturXGeneration ? "default" : "outline"}
                    onClick={() => handleEInvoicingChoice("facturx")}
                  >
                    Génération Factur-X (conforme)
                  </Button>
                  <Button
                    type="button"
                    variant={form.eInvoicingTransmission ? "default" : "outline"}
                    onClick={() => handleEInvoicingChoice("portail")}
                  >
                    Transmission portail public
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasBanking && step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Banque
              </CardTitle>
              <CardDescription>IBAN principal pour affichage sur facture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  value={form.defaultBankAccount.iban}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      defaultBankAccount: { ...f.defaultBankAccount, iban: e.target.value },
                    }))
                  }
                  placeholder="FR76..."
                />
              </div>
              <div className="space-y-2">
                <Label>BIC</Label>
                <Input
                  value={form.defaultBankAccount.bic}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      defaultBankAccount: { ...f.defaultBankAccount, bic: e.target.value },
                    }))
                  }
                  placeholder="BNPAFRPP"
                />
              </div>
              <div className="space-y-2">
                <Label>Nom de la banque</Label>
                <Input
                  value={form.defaultBankAccount.bankName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      defaultBankAccount: { ...f.defaultBankAccount, bankName: e.target.value },
                    }))
                  }
                  placeholder="BNP Paribas"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {hasGed && (step === (hasBanking ? 4 : 3)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                GED
              </CardTitle>
              <CardDescription>Reconnaissance automatique des documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={form.gedAutoRecognition ? "default" : "outline"}
                  onClick={() => setForm((f) => ({ ...f, gedAutoRecognition: true }))}
                >
                  Oui
                </Button>
                <Button
                  type="button"
                  variant={!form.gedAutoRecognition ? "default" : "outline"}
                  onClick={() => setForm((f) => ({ ...f, gedAutoRecognition: false }))}
                >
                  Non
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2 pt-4">
          {!isLastStep ? (
            <Button onClick={handleNext} disabled={!canNext() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suivant"}
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Lancer mon espace
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
