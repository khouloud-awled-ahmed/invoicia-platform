import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { Building2, Upload, AlertCircle, Check, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { validateSIRET, validateSIREN, validateTVA, validateIBAN, validateBIC } from "../utils/companyValidation";
import { apiClient } from "../lib/api-client-backend";
import { useInvoiceTemplate } from "../utils/invoiceTemplateContext";

export function CompanySettingsEnhanced() {
  const { tenant, loading, updateCompanyInfo, updateBankAccount, updateLogo, refreshTenant } = useCompanySettings();
  const { updateLogo: updateTemplateLogo } = useInvoiceTemplate();
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // État local pour les données du formulaire
  const [companyData, setCompanyData] = useState({
    legalName: "",
    siret: "",
    siren: "",
    tvaNumber: "",
    isVatSubject: false,
    legalForm: "",
    capital: "",
    rcs: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    country: "France",
    email: "",
    phone: "",
    website: "",
    logo: null as string | null,
    bankName: "",
    bankAddress: "",
    iban: "",
    bic: "",
    penaltyRate: "",
    penaltyDescription: "",
    recoveryFee: "",
    discountPolicy: "",
    paymentTermsDefault: "",
  });

  // Charger les données depuis le tenant
  useEffect(() => {
    if (tenant) {
      const address = typeof tenant.address === 'object' && tenant.address
        ? tenant.address
        : null;

      setCompanyData({
        legalName: tenant.businessName || tenant.name || "",
        siret: tenant.siret || "",
        siren: tenant.siren || "",
        tvaNumber: tenant.tvaNumber || "",
        isVatSubject: tenant.isVatSubject ?? false,
        legalForm: tenant.legalForm || "",
        capital: tenant.capital?.toString() || "",
        rcs: tenant.rcs || "",
        addressLine1: address?.line1 || "",
        addressLine2: address?.line2 || "",
        postalCode: address?.postalCode || "",
        city: address?.city || "",
        country: address?.country || "France",
        email: tenant.email || "",
        phone: tenant.phone || "",
        website: "",
        logo: tenant.logo || null,
        bankName: tenant.defaultBankAccount?.bankName || "",
        bankAddress: tenant.defaultBankAccount?.bankAddress || "",
        iban: tenant.defaultBankAccount?.iban || "",
        bic: tenant.defaultBankAccount?.bic || "",
        penaltyRate: tenant.defaultTerms?.penaltyRate?.toString() || "",
        penaltyDescription: tenant.defaultTerms?.penaltyDescription || "",
        recoveryFee: tenant.defaultTerms?.recoveryFee?.toString() || "",
        discountPolicy: tenant.defaultTerms?.discountPolicy || "",
        paymentTermsDefault: tenant.defaultTerms?.paymentTermsDefault?.toString() || "",
      });
    }
  }, [tenant]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }

    // Validation de la taille (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le logo ne doit pas dépasser 2 Mo');
      return;
    }

    // Afficher une preview immédiate
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setCompanyData({ ...companyData, logo: previewUrl });
    };
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const tenantId = user?.tenantId;
      
      if (!tenantId) {
        throw new Error('Aucun tenantId trouvé. Veuillez vous reconnecter.');
      }

      // Upload vers attachments
      const result = await apiClient.uploadAttachment('invoice', `company-logo-${tenantId}`, file);
      
      if (result.success && result.data) {
        const attachmentId = result.data.id;
        const logoUrl = apiClient.getAttachmentDownloadUrl(attachmentId);
        
        // Sauvegarder l'URL dans le tenant via le contexte
        await updateLogo(logoUrl);
        
        // Mettre à jour le logo dans le template config
        updateTemplateLogo(logoUrl);
        
        // Mettre à jour la preview avec l'URL finale
        setCompanyData({ ...companyData, logo: logoUrl });
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'upload du logo:', error);
      toast.error(error?.message || 'Erreur lors du téléchargement du logo');
      setCompanyData({ ...companyData, logo: null });
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateLogo(null);
      updateTemplateLogo(undefined);
      setCompanyData({ ...companyData, logo: null });
    } catch (error: any) {
      console.error('Erreur lors de la suppression du logo:', error);
      toast.error('Erreur lors de la suppression du logo');
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!companyData.legalName) {
      newErrors.legalName = "Raison sociale requise";
    }

    if (!companyData.siret) {
      newErrors.siret = "SIRET invalide (14 chiffres requis)";
    }
    
    if (!companyData.siren) {
      newErrors.siren = "SIREN invalide (9 chiffres requis)";
    }

    if (companyData.isVatSubject && (!companyData.tvaNumber || !validateTVA(companyData.tvaNumber))) {
      newErrors.tvaNumber = "Numéro de TVA requis et valide pour une entreprise assujettie";
    }

    if (!companyData.bankName || !companyData.bankAddress || !companyData.iban || !companyData.bic) {
      if (!companyData.iban || !validateIBAN(companyData.iban)) {
        newErrors.iban = "IBAN invalide";
      }
      if (!companyData.bic || !validateBIC(companyData.bic)) {
        newErrors.bic = "BIC invalide (8 ou 11 caractères)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Veuillez corriger les erreurs avant de sauvegarder");
      return;
    }

    try {
      // Sauvegarder les informations de la société
      await updateCompanyInfo({
        siren: companyData.siren,
        tvaNumber: companyData.tvaNumber,
        isVatSubject: companyData.isVatSubject,
        legalForm: companyData.legalForm,
        capital: companyData.capital ? parseFloat(companyData.capital) : undefined,
        rcs: companyData.rcs,
        address: {
          line1: companyData.addressLine1,
          line2: companyData.addressLine2 || undefined,
          postalCode: companyData.postalCode,
          city: companyData.city,
          country: companyData.country,
        },
        email: companyData.email,
        phone: companyData.phone,
      });

      // Sauvegarder le compte bancaire par défaut
      if (companyData.bankName && companyData.bankAddress && companyData.iban && companyData.bic) {
        await updateBankAccount({
          bankName: companyData.bankName,
          bankAddress: companyData.bankAddress,
          iban: companyData.iban,
          bic: companyData.bic,
        });
      }

      // Note: Les CGV (defaultTerms) ne sont pas encore gérées par un endpoint dédié
      // Elles seront sauvegardées via updateTenant général si nécessaire

      toast.success("Paramètres de l'entreprise enregistrés avec succès");
      setErrors({});
      await refreshTenant();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Chargement des paramètres...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations légales obligatoires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informations Légales Obligatoires
          </CardTitle>
          <CardDescription>
            Ces informations apparaîtront sur toutes vos factures conformément à la législation française
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Les champs marqués d'un * sont obligatoires et doivent figurer sur toutes les factures émises.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legalName">Raison sociale *</Label>
              <Input
                id="legalName"
                value={companyData.legalName}
                onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                placeholder="Ex: CONSULTING SERVICES SARL"
                className={errors.legalName ? "border-red-500" : ""}
              />
              {errors.legalName && (
                <p className="text-sm text-red-600">{errors.legalName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique *</Label>
              <Input
                id="legalForm"
                value={companyData.legalForm}
                onChange={(e) => setCompanyData({ ...companyData, legalForm: e.target.value })}
                placeholder="Ex: SARL, SAS, SASU, EURL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siren">SIREN *</Label>
              <Input
                id="siren"
                value={companyData.siren}
                onChange={(e) => setCompanyData({ ...companyData, siren: e.target.value })}
                placeholder="123 456 789"
                className={errors.siren ? "border-red-500" : ""}
              />
              {errors.siren && (
                <p className="text-sm text-red-600">{errors.siren}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET *</Label>
              <Input
                id="siret"
                value={companyData.siret}
                onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })}
                placeholder="123 456 789 00012"
                className={errors.siret ? "border-red-500" : ""}
              />
              {errors.siret && (
                <p className="text-sm text-red-600">{errors.siret}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capital">Capital social *</Label>
              <Input
                id="capital"
                value={companyData.capital}
                onChange={(e) => setCompanyData({ ...companyData, capital: e.target.value })}
                placeholder="10000"
                type="number"
              />
              <p className="text-xs text-muted-foreground">En euros</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rcs">RCS *</Label>
              <Input
                id="rcs"
                value={companyData.rcs}
                onChange={(e) => setCompanyData({ ...companyData, rcs: e.target.value })}
                placeholder="Paris"
              />
              <p className="text-xs text-muted-foreground">Ville du Registre du Commerce</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Assujetti à la TVA *</Label>
                <p className="text-sm text-muted-foreground">
                  Indique si votre entreprise est assujettie à la TVA
                </p>
              </div>
              <Switch
                checked={companyData.isVatSubject}
                onCheckedChange={(checked) =>
                  setCompanyData({ ...companyData, isVatSubject: checked })
                }
              />
            </div>

            {companyData.isVatSubject && (
              <div className="space-y-2">
                <Label htmlFor="tvaNumber">Numéro de TVA Intracommunautaire *</Label>
                <Input
                  id="tvaNumber"
                  value={companyData.tvaNumber}
                  onChange={(e) => setCompanyData({ ...companyData, tvaNumber: e.target.value })}
                  placeholder="FR 12 345 678 901"
                  className={errors.tvaNumber ? "border-red-500" : ""}
                />
                {errors.tvaNumber && (
                  <p className="text-sm text-red-600">{errors.tvaNumber}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      <Card>
        <CardHeader>
          <CardTitle>Adresse du siège social *</CardTitle>
          <CardDescription>Cette adresse apparaîtra sur vos factures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Adresse ligne 1 *</Label>
            <Input
              id="addressLine1"
              value={companyData.addressLine1}
              onChange={(e) => setCompanyData({ ...companyData, addressLine1: e.target.value })}
              placeholder="Numéro et nom de rue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Adresse ligne 2</Label>
            <Input
              id="addressLine2"
              value={companyData.addressLine2}
              onChange={(e) => setCompanyData({ ...companyData, addressLine2: e.target.value })}
              placeholder="Complément d'adresse (optionnel)"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={companyData.postalCode}
                onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                placeholder="75001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={companyData.city}
                onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                placeholder="Paris"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays *</Label>
              <Input
                id="country"
                value={companyData.country}
                onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées de contact *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                placeholder="contact@entreprise.fr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                placeholder="www.entreprise.fr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo de l'entreprise</CardTitle>
          <CardDescription>
            Votre logo apparaîtra sur toutes vos factures (Format: PNG, JPG, WebP - Max: 2 Mo)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {companyData.logo ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={companyData.logo}
                    alt="Logo entreprise"
                    className="h-32 w-auto max-w-xs object-contain mx-auto rounded border border-gray-200 bg-white p-2"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={isUploadingLogo}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingLogo ? 'Téléchargement...' : 'Changer le logo'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="w-32 h-32 mx-auto bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm font-medium mb-1">Télécharger votre logo</p>
              <p className="text-xs text-muted-foreground mb-4">
                PNG, JPG, WebP jusqu'à 2 Mo
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={isUploadingLogo}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingLogo ? 'Téléchargement...' : 'Télécharger un logo'}
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coordonnées bancaires */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées Bancaires *</CardTitle>
          <CardDescription>
            Ces informations seront affichées sur vos factures pour les paiements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bankName">Nom de la banque *</Label>
              <Input
                id="bankName"
                value={companyData.bankName}
                onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })}
                placeholder="BNP Paribas"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bankAddress">Adresse de la banque / Domiciliation *</Label>
              <Input
                id="bankAddress"
                value={companyData.bankAddress}
                onChange={(e) => setCompanyData({ ...companyData, bankAddress: e.target.value })}
                placeholder="16 Boulevard des Italiens, 75009 Paris"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                value={companyData.iban}
                onChange={(e) => setCompanyData({ ...companyData, iban: e.target.value })}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className={errors.iban ? "border-red-500" : ""}
              />
              {errors.iban && (
                <p className="text-sm text-red-600">{errors.iban}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bic">BIC / SWIFT *</Label>
              <Input
                id="bic"
                value={companyData.bic}
                onChange={(e) => setCompanyData({ ...companyData, bic: e.target.value })}
                placeholder="BNPAFRPPXXX"
                className={errors.bic ? "border-red-500" : ""}
              />
              {errors.bic && (
                <p className="text-sm text-red-600">{errors.bic}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions Générales de Vente */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions Générales de Vente par Défaut *</CardTitle>
          <CardDescription>
            Ces mentions légales apparaîtront automatiquement sur toutes vos factures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Conformément à la LME (Loi de Modernisation de l'Économie), ces mentions sont obligatoires sur toutes les factures.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="penaltyRate">Taux de pénalité de retard (% annuel) *</Label>
              <Input
                id="penaltyRate"
                value={companyData.penaltyRate}
                onChange={(e) => setCompanyData({ ...companyData, penaltyRate: e.target.value })}
                placeholder="10.00"
                type="number"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Minimum légal: 3 fois le taux d'intérêt légal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recoveryFee">Indemnité forfaitaire de recouvrement (€) *</Label>
              <Input
                id="recoveryFee"
                value={companyData.recoveryFee}
                onChange={(e) => setCompanyData({ ...companyData, recoveryFee: e.target.value })}
                placeholder="40"
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Montant légal minimum: 40 €
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="penaltyDescription">Texte des pénalités de retard *</Label>
              <Textarea
                id="penaltyDescription"
                value={companyData.penaltyDescription}
                onChange={(e) =>
                  setCompanyData({ ...companyData, penaltyDescription: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="discountPolicy">Politique d'escompte *</Label>
              <Input
                id="discountPolicy"
                value={companyData.discountPolicy}
                onChange={(e) => setCompanyData({ ...companyData, discountPolicy: e.target.value })}
                placeholder="Pas d'escompte en cas de paiement anticipé"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTermsDefault">Délai de paiement par défaut (jours) *</Label>
              <Input
                id="paymentTermsDefault"
                value={companyData.paymentTermsDefault}
                onChange={(e) =>
                  setCompanyData({ ...companyData, paymentTermsDefault: e.target.value })
                }
                placeholder="30"
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Maximum légal: 60 jours (ou 45 jours fin de mois)
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Aperçu des mentions légales :</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>• {companyData.penaltyDescription || "Pénalités de retard"}</p>
              <p>• {companyData.discountPolicy || "Politique d'escompte"}</p>
              <p>
                • Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement :{" "}
                {companyData.recoveryFee || "40"} €
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => refreshTenant()}>
          Annuler
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Check className="w-4 h-4 mr-2" />
          Enregistrer tous les paramètres
        </Button>
      </div>
    </div>
  );
}
