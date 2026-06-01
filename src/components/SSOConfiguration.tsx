import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { 
  Building2, 
  Key, 
  CheckCircle, 
  Copy,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { toast } from "sonner";

interface SSOProvider {
  id: string;
  name: string;
  enabled: boolean;
  config?: {
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    clientId?: string;
    clientSecret?: string;
    domain?: string;
  };
}

export function SSOConfiguration() {
  const { tenant, updateSecuritySettings } = useCompanySettings();
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: "saml",
      name: "SAML 2.0",
      enabled: false,
    },
    {
      id: "oidc",
      name: "OpenID Connect",
      enabled: false,
    },
    {
      id: "azure",
      name: "Azure AD",
      enabled: false,
    },
    {
      id: "google",
      name: "Google Workspace",
      enabled: false,
    },
  ]);

  const [selectedProvider, setSelectedProvider] = useState<string>("saml");
  const [formData, setFormData] = useState<any>({});

  const currentProvider = providers.find(p => p.id === selectedProvider);

  const toggleProvider = async (id: string) => {
    const updatedProviders = providers.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setProviders(updatedProviders);
    
    // Note: La configuration SSO détaillée pourrait être stockée dans tenant.securitySettings
    // Pour l'instant, on synchronise juste l'état activé/désactivé
    try {
      // Ici on pourrait sauvegarder la configuration SSO dans securitySettings
      await updateSecuritySettings({ ssoEnabled: updatedProviders.some(p => p.enabled) });
      toast.success("Configuration SSO mise à jour");
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour SSO:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSave = async () => {
    setProviders(providers.map(p =>
      p.id === selectedProvider
        ? { ...p, config: formData }
        : p
    ));
    
    try {
      // Sauvegarder la configuration SSO
      await updateSecuritySettings({ ssoConfig: formData });
      toast.success("Configuration SSO enregistrée");
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const mockCallbackUrl = "https://votre-app.fr/auth/sso/callback";
  const mockEntityId = "https://votre-app.fr/saml/metadata";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Single Sign-On (SSO)
            </CardTitle>
            <CardDescription>
              Configurez l'authentification unique pour votre organisation
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Le SSO permet à vos utilisateurs de se connecter avec leurs identifiants d'entreprise existants (Azure AD, Google Workspace, etc.)
            </AlertDescription>
          </Alert>

          <div>
            <Label className="mb-3 block">Fournisseurs d'identité disponibles</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-4 border-2 rounded-lg ${
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setSelectedProvider(provider.id)}
                      className="flex-1 text-left"
                    >
                      <h4>{provider.name}</h4>
                    </button>
                    <div className="flex items-center gap-2">
                      {provider.enabled && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Actif
                        </Badge>
                      )}
                      <Switch
                        checked={provider.enabled}
                        onCheckedChange={() => toggleProvider(provider.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <h3>Configuration de {currentProvider?.name}</h3>

            {selectedProvider === "saml" && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="text-sm">Informations du Service Provider (SP)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="w-32">Entity ID:</Label>
                      <code className="flex-1 px-3 py-2 bg-background rounded text-sm">
                        {mockEntityId}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(mockEntityId)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32">ACS URL:</Label>
                      <code className="flex-1 px-3 py-2 bg-background rounded text-sm">
                        {mockCallbackUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(mockCallbackUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idpEntityId">Identity Provider Entity ID</Label>
                  <Input
                    id="idpEntityId"
                    placeholder="https://idp.example.com/metadata"
                    value={formData.entityId || ""}
                    onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ssoUrl">SSO URL</Label>
                  <Input
                    id="ssoUrl"
                    placeholder="https://idp.example.com/sso"
                    value={formData.ssoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, ssoUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate">Certificat X.509</Label>
                  <Textarea
                    id="certificate"
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={6}
                    value={formData.certificate || ""}
                    onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {selectedProvider === "oidc" && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="text-sm">Callback URL</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-background rounded text-sm">
                      {mockCallbackUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(mockCallbackUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="votre-client-id"
                    value={formData.clientId || ""}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={formData.clientSecret || ""}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discoveryUrl">Discovery URL</Label>
                  <Input
                    id="discoveryUrl"
                    placeholder="https://idp.example.com/.well-known/openid-configuration"
                    value={formData.discoveryUrl || ""}
                    onChange={(e) => setFormData({ ...formData, discoveryUrl: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(selectedProvider === "azure" || selectedProvider === "google") && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configuration simplifiée pour {currentProvider?.name}. Suivez les étapes ci-dessous.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="domain">
                    {selectedProvider === "azure" ? "Domaine Azure AD" : "Domaine Google Workspace"}
                  </Label>
                  <Input
                    id="domain"
                    placeholder={selectedProvider === "azure" ? "votre-entreprise.onmicrosoft.com" : "votre-entreprise.com"}
                    value={formData.domain || ""}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    {selectedProvider === "azure" ? "Application (client) ID" : "Client ID"}
                  </Label>
                  <Input
                    id="clientId"
                    placeholder="votre-client-id"
                    value={formData.clientId || ""}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={formData.clientSecret || ""}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm mb-2">Documentation</h4>
                  <a
                    href={selectedProvider === "azure" 
                      ? "https://docs.microsoft.com/azure/active-directory/" 
                      : "https://developers.google.com/identity"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Guide de configuration {currentProvider?.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Tester la connexion</Button>
              <Button onClick={handleSave}>
                Enregistrer la configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


