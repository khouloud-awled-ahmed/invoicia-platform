import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import {
  Search,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  FRENCH_BANKS,
  CONNECTION_STEPS,
  getPopularBanks,
  getBanksByType,
  searchBanks,
  type FrenchBank,
} from "../lib/french-banks";

interface BankConnectionWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (bankId: string, accounts: any[]) => void;
}

export function BankConnectionWizard({ open, onClose, onSuccess }: BankConnectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBank, setSelectedBank] = useState<FrenchBank | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const popularBanks = getPopularBanks();
  const filteredBanks = searchQuery
    ? searchBanks(searchQuery)
    : FRENCH_BANKS;

  const mockAccounts = [
    { id: "acc-1", name: "Compte Courant", number: "****1234", balance: 3456.78 },
    { id: "acc-2", name: "Livret A", number: "****5678", balance: 12340.50 },
    { id: "acc-3", name: "Compte Pro", number: "****9012", balance: 45678.90 },
  ];

  const handleBankSelection = (bank: FrenchBank) => {
    setSelectedBank(bank);
    setCurrentStep(1);
  };

  const handleCredentialsSubmit = () => {
    if (!credentials.username || !credentials.password) {
      return;
    }
    setIsConnecting(true);
    // Simulation de connexion
    setTimeout(() => {
      setIsConnecting(false);
      setCurrentStep(2);
      setSelectedAccounts(mockAccounts.map(acc => acc.id));
    }, 2000);
  };

  const handleAccountsNext = () => {
    if (selectedAccounts.length === 0) {
      return;
    }
    setCurrentStep(3);
  };

  const handleConsentNext = () => {
    if (!consentAccepted) {
      return;
    }
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setCurrentStep(4);
      setTimeout(() => {
        onSuccess(selectedBank!.id, selectedAccounts);
        handleClose();
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedBank(null);
    setSearchQuery("");
    setCredentials({ username: "", password: "" });
    setSelectedAccounts([]);
    setConsentAccepted(false);
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedBank(null);
    }
  };

  const stepProgress = ((currentStep + 1) / CONNECTION_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedBank ? `Connexion à ${selectedBank.name}` : "Connecter une banque"}
          </DialogTitle>
          <DialogDescription>
            {selectedBank 
              ? "Suivez les étapes pour connecter votre compte bancaire en toute sécurité"
              : "Choisissez votre banque pour commencer la connexion sécurisée"}
          </DialogDescription>
        </DialogHeader>

        {selectedBank && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="text-4xl">{selectedBank.logo}</div>
              <div className="flex-1">
                <h3>{selectedBank.name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{selectedBank.type === "traditional" ? "Banque traditionnelle" : selectedBank.type === "online" ? "Banque en ligne" : "Néobanque"}</Badge>
                  <Badge variant="outline">
                    <Shield className="w-3 h-3 mr-1" />
                    PSD2
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    ~{selectedBank.avgConnectionTime}s
                  </Badge>
                </div>
              </div>
            </div>

            <Progress value={stepProgress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              {CONNECTION_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 ${
                    idx <= currentStep ? "text-primary" : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                      idx < currentStep
                        ? "bg-primary border-primary text-primary-foreground"
                        : idx === currentStep
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="hidden md:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          {!selectedBank && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une banque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {!searchQuery && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Banques populaires
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {popularBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleBankSelection(bank)}
                          className="p-4 border-2 rounded-lg text-left hover:border-primary transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{bank.logo}</div>
                            <div className="flex-1">
                              <h4>{bank.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {bank.type === "traditional"
                                  ? "Banque traditionnelle"
                                  : bank.type === "online"
                                  ? "Banque en ligne"
                                  : "Néobanque"}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Tabs defaultValue="all">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">Toutes</TabsTrigger>
                      <TabsTrigger value="traditional" className="flex-1">Traditionnelles</TabsTrigger>
                      <TabsTrigger value="online" className="flex-1">En ligne</TabsTrigger>
                      <TabsTrigger value="neobank" className="flex-1">Néobanques</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-2 mt-4">
                      {FRENCH_BANKS.map((bank) => (
                        <BankListItem key={bank.id} bank={bank} onSelect={handleBankSelection} />
                      ))}
                    </TabsContent>

                    <TabsContent value="traditional" className="space-y-2 mt-4">
                      {getBanksByType("traditional").map((bank) => (
                        <BankListItem key={bank.id} bank={bank} onSelect={handleBankSelection} />
                      ))}
                    </TabsContent>

                    <TabsContent value="online" className="space-y-2 mt-4">
                      {getBanksByType("online").map((bank) => (
                        <BankListItem key={bank.id} bank={bank} onSelect={handleBankSelection} />
                      ))}
                    </TabsContent>

                    <TabsContent value="neobank" className="space-y-2 mt-4">
                      {getBanksByType("neobank").map((bank) => (
                        <BankListItem key={bank.id} bank={bank} onSelect={handleBankSelection} />
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {searchQuery && (
                <div className="space-y-2">
                  {filteredBanks.length > 0 ? (
                    filteredBanks.map((bank) => (
                      <BankListItem key={bank.id} bank={bank} onSelect={handleBankSelection} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune banque trouvée
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedBank && currentStep === 1 && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connexion 100% sécurisée</strong> - Vos identifiants sont directement transmis à votre banque via une connexion chiffrée. Ils ne sont jamais stockés par notre application.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Identifiant bancaire</Label>
                  <Input
                    id="username"
                    placeholder="Votre identifiant"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Protocole PSD2 / Open Banking</p>
                    <p className="text-blue-700">
                      Cette connexion utilise les APIs officielles de votre banque conformément à la directive européenne PSD2. Vos données sont protégées et l'accès est révocable à tout moment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  onClick={handleCredentialsSubmit}
                  disabled={!credentials.username || !credentials.password || isConnecting}
                >
                  {isConnecting ? "Connexion..." : "Suivant"}
                  {!isConnecting && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          )}

          {selectedBank && currentStep === 2 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sélectionnez les comptes que vous souhaitez synchroniser avec l'application.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {mockAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAccounts.includes(account.id)
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedAccounts(
                        selectedAccounts.includes(account.id)
                          ? selectedAccounts.filter(id => id !== account.id)
                          : [...selectedAccounts, account.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedAccounts.includes(account.id)}
                          onCheckedChange={() => {}}
                        />
                        <div>
                          <h4>{account.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {account.number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg">{account.balance.toLocaleString()} €</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleAccountsNext} disabled={selectedAccounts.length === 0}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {selectedBank && currentStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Conformément à la directive PSD2, vous devez autoriser explicitement l'accès à vos données bancaires.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4 space-y-4">
                <h4>Autorisation d'accès aux données</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Lecture de vos comptes et transactions</p>
                      <p className="text-muted-foreground">
                        Accès aux soldes, historiques de transactions et informations de compte
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Synchronisation automatique</p>
                      <p className="text-muted-foreground">
                        Mise à jour quotidienne de vos transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Durée du consentement : 90 jours</p>
                      <p className="text-muted-foreground">
                        Renouvelable automatiquement ou révocable à tout moment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={consentAccepted}
                    onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                  />
                  <label htmlFor="consent" className="text-sm cursor-pointer">
                    J'autorise l'accès en lecture à mes données bancaires pour une durée de 90 jours, conformément à la réglementation PSD2. Je comprends que je peux révoquer cet accès à tout moment depuis les paramètres de l'application.
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  onClick={handleConsentNext}
                  disabled={!consentAccepted || isConnecting}
                >
                  {isConnecting ? "Finalisation..." : "Autoriser et connecter"}
                  {!isConnecting && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          )}

          {selectedBank && currentStep === 4 && (
            <div className="space-y-4 py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3>Connexion réussie !</h3>
              <p className="text-muted-foreground">
                Votre banque {selectedBank.name} a été connectée avec succès.
                <br />
                {selectedAccounts.length} compte{selectedAccounts.length > 1 ? "s" : ""} synchronisé{selectedAccounts.length > 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BankListItem({
  bank,
  onSelect,
}: {
  bank: FrenchBank;
  onSelect: (bank: FrenchBank) => void;
}) {
  return (
    <button
      onClick={() => onSelect(bank)}
      className="w-full p-3 border rounded-lg text-left hover:border-primary transition-all flex items-center gap-3"
    >
      <div className="text-2xl">{bank.logo}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm">{bank.name}</h4>
          {bank.popular && (
            <Badge variant="outline" className="text-xs">Populaire</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {bank.type === "traditional"
            ? "Banque traditionnelle"
            : bank.type === "online"
            ? "Banque en ligne"
            : "Néobanque"}{" "}
          · {bank.apiProvider}
        </p>
      </div>
      <div className="text-xs text-muted-foreground">
        ~{bank.avgConnectionTime}s
      </div>
    </button>
  );
}