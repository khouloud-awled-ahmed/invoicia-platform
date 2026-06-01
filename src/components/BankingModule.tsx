import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";
import { Building2, Plus, RefreshCw, Loader2, Link2, Banknote, TrendingUp, FileText } from "lucide-react";
import { BankSelectionModal } from "./BankSelectionModal";

interface BankAccount {
  id: string;
  name: string;
  iban?: string;
  bankName?: string;
  balance: number;
  currency: string;
  provider: 'MANUAL' | 'GOCARDLESS' | 'BRIDGE';
  lastSyncAt?: string;
  isActive: boolean;
}

interface BankConnection {
  id: string;
  provider: 'GOCARDLESS' | 'BRIDGE';
  institutionId: string;
  institutionName?: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export function BankingModule() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankSelectionOpen, setIsBankSelectionOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accounts, connections] = await Promise.all([
        apiClient.getBankAccounts(),
        apiClient.getBankConnections(),
      ]);
      setBankAccounts(accounts);
      setBankConnections(connections);
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des comptes bancaires");
      // En cas d'erreur, initialiser avec des tableaux vides
      setBankAccounts([]);
      setBankConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBank = () => {
    // Ouvrir la modale de sélection de banque
    setIsBankSelectionOpen(true);
  };

  const handleSyncAccount = async (connectionId: string) => {
    setIsSyncing(connectionId);
    try {
      const transactions = await apiClient.syncBankTransactions(connectionId);
      toast.success(`Synchronisation réussie : ${transactions.length} transaction(s) récupérée(s)`);
      await loadData();
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error(error?.message || "Erreur lors de la synchronisation");
    } finally {
      setIsSyncing(null);
    }
  };

  // Vérifier si on revient d'un callback OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('banking_oauth_state');

    if (code && state && storedState === state) {
      handleOAuthCallback(code, state);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem('banking_oauth_state');
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      await apiClient.exchangeBankCode(code, state);
      toast.success("Banque connectée avec succès !");
      await loadData();
    } catch (error: any) {
      console.error("Erreur lors du callback OAuth:", error);
      toast.error(error?.message || "Erreur lors de la connexion");
    }
  };

  const formatBalance = (balance: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(balance);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProviderBadge = (provider: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      MANUAL: 'outline',
      GOCARDLESS: 'default',
      BRIDGE: 'secondary',
    };
    return variants[provider] || 'outline';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comptes Bancaires</h1>
          <p className="text-muted-foreground mt-1">
            Connectez vos comptes bancaires pour synchroniser automatiquement vos transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = '/banking/import'}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Importer un fichier
          </Button>
          <Button
            onClick={handleConnectBank}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connecter une banque
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes connectés</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {bankAccounts.filter(a => a.isActive).length} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBalance(
                bankAccounts.reduce((sum, acc) => sum + acc.balance, 0),
                'EUR'
              )}
            </div>
            <p className="text-xs text-muted-foreground">Tous comptes confondus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankConnections.length}</div>
            <p className="text-xs text-muted-foreground">
              {bankConnections.filter(c => c.isActive).length} actives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des comptes */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes bancaires</CardTitle>
          <CardDescription>
            Liste de tous vos comptes bancaires connectés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun compte bancaire connecté</p>
              <p className="text-sm mt-2">Connectez votre première banque pour commencer</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Dernière synchro</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.bankName || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {account.iban || '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatBalance(account.balance, account.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getProviderBadge(account.provider)}>
                        {account.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(account.lastSyncAt)}</TableCell>
                    <TableCell className="text-right">
                      {account.provider !== 'MANUAL' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncAccount(account.id)}
                          disabled={isSyncing === account.id}
                        >
                          {isSyncing === account.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modale de sélection de banque */}
      <BankSelectionModal
        open={isBankSelectionOpen}
        onOpenChange={setIsBankSelectionOpen}
      />
    </div>
  );
}
