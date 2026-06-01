import { apiClient } from "../lib/api-client-backend";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  Building2,
  Euro,
  CreditCard,
} from "lucide-react";
import {
  MOCK_BANK_ACCOUNTS,
  ACCOUNT_TYPES,
  ACCOUNT_STATUS,
  CURRENCIES,
  ACCOUNT_COLORS,
  formatIBAN,
  validateIBAN,
  validateBIC,
  getAccountTypeLabel,
  getAccountTypeIcon,
  getStatusBadgeClass,
  getCurrencySymbol,
  setDefaultAccount,
  type BankAccount,
} from "../lib/bank-accounts";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { toast } from "sonner";

export function BankAccountManagement() {
  const { tenant, updateBankAccount, refreshTenant } = useCompanySettings();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Charger les comptes bancaires depuis l'API
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getBankAccounts();
      const transformed = Array.isArray(data) 
        ? data.map((acc: any) => ({
            id: acc._id || acc.id,
            bankName: acc.bankName || acc.name || 'Banque',
            accountNumber: acc.accountNumber || '****',
            iban: acc.iban || '',
            balance: acc.balance || 0,
            currency: acc.currency || 'EUR',
            type: acc.type || 'business',
            connected: acc.isActive !== false,
            lastSync: acc.lastSyncAt ? new Date(acc.lastSyncAt) : undefined,
            provider: acc.provider || 'MANUAL',
          }))
        : [];
      setAccounts(transformed);
    } catch (error: any) {
      console.error("Erreur lors du chargement des comptes:", error);
      toast.error(error?.message || "Erreur lors du chargement des comptes bancaires");
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // État du formulaire
  const [formData, setFormData] = useState({
    accountName: "",
    bankName: "",
    iban: "",
    bic: "",
    accountType: "business" as BankAccount["accountType"],
    currency: "EUR",
    balance: "",
    description: "",
    color: "#3b82f6",
  });

  const [errors, setErrors] = useState({
    iban: "",
    bic: "",
  });

  // Synchroniser le compte par défaut avec tenant.defaultBankAccount
  useEffect(() => {
    if (tenant?.defaultBankAccount) {
      const defaultAccountFromTenant: BankAccount = {
        id: 'tenant-default',
        accountName: 'Compte par défaut',
        bankName: tenant.defaultBankAccount.bankName,
        iban: tenant.defaultBankAccount.iban,
        bic: tenant.defaultBankAccount.bic,
        accountType: 'business',
        currency: 'EUR',
        isDefault: true,
        status: 'active',
        openingDate: new Date(),
        description: tenant.defaultBankAccount.bankAddress,
        color: '#3b82f6',
      };

      // Remplacer ou ajouter le compte par défaut du tenant
      setAccounts(prevAccounts => {
        const withoutTenantDefault = prevAccounts.filter(acc => acc.id !== 'tenant-default');
        const withoutDefaults = withoutTenantDefault.map(acc => ({ ...acc, isDefault: false }));
        return [defaultAccountFromTenant, ...withoutDefaults];
      });
    }
  }, [tenant?.defaultBankAccount]);

  const resetForm = () => {
    setFormData({
      accountName: "",
      bankName: "",
      iban: "",
      bic: "",
      accountType: "business",
      currency: "EUR",
      balance: "",
      description: "",
      color: "#3b82f6",
    });
    setErrors({ iban: "", bic: "" });
  };

  const validateForm = (): boolean => {
    const newErrors = { iban: "", bic: "" };
    let isValid = true;

    if (!validateIBAN(formData.iban)) {
      newErrors.iban = "Format IBAN invalide (27 caractères, commence par FR)";
      isValid = false;
    }

    if (!validateBIC(formData.bic)) {
      newErrors.bic = "Format BIC invalide (8 ou 11 caractères)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const newAccount: BankAccount = {
      id: `acc-${Date.now()}`,
      accountName: formData.accountName,
      bankName: formData.bankName,
      iban: formatIBAN(formData.iban),
      bic: formData.bic.toUpperCase(),
      accountType: formData.accountType,
      currency: formData.currency,
      balance: formData.balance ? parseFloat(formData.balance) : undefined,
      isDefault: accounts.length === 0,
      status: "active",
      openingDate: new Date(),
      description: formData.description,
      color: formData.color,
    };
    try { await apiClient.request("/banking/accounts", { method: "POST", body: JSON.stringify(newAccount) }); } catch {}
    setAccounts([...accounts, newAccount]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      bankName: account.bankName,
      iban: account.iban,
      bic: account.bic,
      accountType: account.accountType,
      currency: account.currency,
      balance: account.balance?.toString() || "",
      description: account.description || "",
      color: account.color || "#3b82f6",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingAccount || !validateForm()) return;

    setAccounts(
      accounts.map((acc) =>
        acc.id === editingAccount.id
          ? {
              ...acc,
              accountName: formData.accountName,
              bankName: formData.bankName,
              iban: formatIBAN(formData.iban),
              bic: formData.bic.toUpperCase(),
              accountType: formData.accountType,
              currency: formData.currency,
              balance: formData.balance ? parseFloat(formData.balance) : undefined,
              description: formData.description,
              color: formData.color,
            }
          : acc
      )
    );
    setIsEditDialogOpen(false);
    setEditingAccount(null);
    resetForm();
  };

  const handleDelete = (accountId: string) => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible."
      )
    ) {
      const accountToDelete = accounts.find((acc) => acc.id === accountId);
      if (accountToDelete?.isDefault && accounts.length > 1) {
        alert("Vous devez d'abord définir un autre compte par défaut.");
        return;
      }
      setAccounts(accounts.filter((acc) => acc.id !== accountId));
    }
  };

  const handleSetDefault = async (accountId: string) => {
    const updatedAccounts = setDefaultAccount(accounts, accountId);
    setAccounts(updatedAccounts);
    
    // Synchroniser avec tenant.defaultBankAccount
    const defaultAccount = updatedAccounts.find(acc => acc.isDefault);
    if (defaultAccount) {
      try {
        await updateBankAccount({
          bankName: defaultAccount.bankName,
          bankAddress: defaultAccount.description || '',
          iban: defaultAccount.iban,
          bic: defaultAccount.bic,
        });
        toast.success('Compte par défaut mis à jour');
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du compte par défaut:', error);
        toast.error('Erreur lors de la mise à jour du compte par défaut');
      }
    }
  };

  const handleStatusChange = (accountId: string, newStatus: BankAccount["status"]) => {
    setAccounts(
      accounts.map((acc) => (acc.id === accountId ? { ...acc, status: newStatus } : acc))
    );
  };

  const totalBalance = accounts
    .filter((acc) => acc.status === "active" && acc.balance)
    .reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const activeAccounts = accounts.filter((acc) => acc.status === "active").length;

  const FormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        <h3>Informations générales</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nom du compte *</Label>
            <Input
              id="accountName"
              placeholder="Ex: Compte Principal"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Nom de la banque *</Label>
            <Input
              id="bankName"
              placeholder="Ex: Banque Populaire"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountType">Type de compte *</Label>
            <Select
              value={formData.accountType}
              onValueChange={(value) => setFormData({ ...formData, accountType: value as typeof formData.accountType })}
            >
              <SelectTrigger id="accountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Devise *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3>Coordonnées bancaires</h3>

        <div className="space-y-2">
          <Label htmlFor="iban">IBAN *</Label>
          <Input
            id="iban"
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            className={errors.iban ? "border-red-500" : ""}
          />
          {errors.iban && <p className="text-sm text-red-600">{errors.iban}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bic">BIC/SWIFT *</Label>
          <Input
            id="bic"
            placeholder="CCBPFRPPXXX"
            value={formData.bic}
            onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
            className={errors.bic ? "border-red-500" : ""}
          />
          {errors.bic && <p className="text-sm text-red-600">{errors.bic}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3>Détails complémentaires</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="balance">Solde actuel (optionnel)</Label>
            <div className="relative">
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {getCurrencySymbol(formData.currency)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Couleur</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => setFormData({ ...formData, color: value })}
            >
              <SelectTrigger id="color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            placeholder="Description ou notes sur ce compte..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false);
            resetForm();
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={
            !formData.accountName || !formData.bankName || !formData.iban || !formData.bic
          }
        >
          {isEdit ? "Mettre à jour" : "Créer le compte"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Comptes bancaires</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos comptes bancaires et coordonnées de paiement
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un compte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un compte bancaire</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau compte bancaire à votre entreprise
              </DialogDescription>
            </DialogHeader>
            <FormFields />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Comptes actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              sur {accounts.length} compte{accounts.length > 1 ? "s" : ""} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Solde total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalBalance.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">Comptes actifs uniquement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Compte par défaut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {accounts.find((acc) => acc.isDefault)?.accountName || "Aucun"}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts.find((acc) => acc.isDefault)?.bankName || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerte si pas de compte par défaut */}
      {accounts.length > 0 && !accounts.some((acc) => acc.isDefault) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            Aucun compte n'est défini par défaut. Définissez un compte par défaut pour les
            paiements.
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des comptes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des comptes bancaires</CardTitle>
          <CardDescription>
            {accounts.length} compte{accounts.length > 1 ? "s" : ""} enregistré
            {accounts.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">Aucun compte bancaire</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez votre premier compte bancaire pour commencer
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un compte
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compte</TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{account.accountName}</span>
                              {account.isDefault && (
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              )}
                            </div>
                            {account.description && (
                              <p className="text-xs text-muted-foreground">
                                {account.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{account.bankName}</TableCell>
                      <TableCell className="font-mono text-xs">{account.iban}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {getAccountTypeIcon(account.accountType)}
                          {getAccountTypeLabel(account.accountType)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {account.balance !== undefined ? (
                          <span>
                            {account.balance.toLocaleString()}{" "}
                            {getCurrencySymbol(account.currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={account.status}
                          onValueChange={(value) => handleStatusChange(account.id, value as BankAccount["status"])}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>
                              <Badge className={getStatusBadgeClass(account.status)}>
                                {ACCOUNT_STATUS.find((s) => s.value === account.status)?.label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_STATUS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!account.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(account.id)}
                              title="Définir par défaut"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account.id)}
                            disabled={account.isDefault && accounts.length > 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le compte bancaire</DialogTitle>
            <DialogDescription>
              Modifiez les informations de ce compte bancaire
            </DialogDescription>
          </DialogHeader>
          <FormFields isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
