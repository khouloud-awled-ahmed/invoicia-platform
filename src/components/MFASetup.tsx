import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Copy,
  QrCode
} from "lucide-react";
import { Switch } from "./ui/switch";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./ui/input-otp";
import { Alert, AlertDescription } from "./ui/alert";
import { useCompanySettings } from "../contexts/CompanySettingsContext";
import { toast } from "sonner";

interface MFASetupProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function MFASetup({ isEnabled, onToggle }: MFASetupProps) {
  const { tenant, updateSecuritySettings } = useCompanySettings();
  const [selectedMethod, setSelectedMethod] = useState<"totp" | "sms" | "email">("totp");
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  // Synchroniser avec tenant.securitySettings
  useEffect(() => {
    if (tenant?.securitySettings?.mfaRequired !== undefined) {
      onToggle(tenant.securitySettings.mfaRequired);
    }
  }, [tenant?.securitySettings?.mfaRequired]);

  const mockSecret = "JBSWY3DPEHPK3PXP";
  const mockBackupCodes = [
    "A1B2-C3D4-E5F6",
    "G7H8-I9J0-K1L2",
    "M3N4-O5P6-Q7R8",
    "S9T0-U1V2-W3X4",
    "Y5Z6-A7B8-C9D0",
  ];

  const handleEnableMFA = () => {
    setShowQRCode(true);
  };

  const handleVerifyCode = async () => {
    // Simulation de vérification
    if (verificationCode.length === 6) {
      setIsVerified(true);
      setBackupCodes(mockBackupCodes);
      try {
        await updateSecuritySettings({ mfaRequired: true });
        onToggle(true);
        toast.success("MFA activé avec succès");
      } catch (error: any) {
        console.error('Erreur lors de l\'activation du MFA:', error);
        toast.error('Erreur lors de l\'activation du MFA');
      }
    }
  };

  const handleDisableMFA = async () => {
    try {
      await updateSecuritySettings({ mfaRequired: false });
      onToggle(false);
      setIsVerified(false);
      setShowQRCode(false);
      setBackupCodes([]);
      toast.success("MFA désactivé");
    } catch (error: any) {
      console.error('Erreur lors de la désactivation du MFA:', error);
      toast.error('Erreur lors de la désactivation du MFA');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const mfaMethods = [
    {
      id: "totp",
      name: "Application d'authentification",
      description: "Google Authenticator, Authy, etc.",
      icon: Smartphone,
      recommended: true,
    },
    {
      id: "sms",
      name: "SMS",
      description: "Code envoyé par SMS",
      icon: Smartphone,
      recommended: false,
    },
    {
      id: "email",
      name: "Email",
      description: "Code envoyé par email",
      icon: Mail,
      recommended: false,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authentification Multi-Facteurs (MFA)
              </CardTitle>
              <CardDescription>
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEnabled && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activé
                </Badge>
              )}
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleEnableMFA();
                  } else {
                    handleDisableMFA();
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEnabled && !showQRCode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                L'authentification multi-facteurs est actuellement désactivée. Activez-la pour améliorer la sécurité de votre compte.
              </AlertDescription>
            </Alert>
          )}

          {showQRCode && !isVerified && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Choisissez votre méthode d'authentification</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {mfaMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id as any)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Icon className="w-5 h-5" />
                          {method.recommended && (
                            <Badge variant="outline" className="text-xs">
                              Recommandé
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm mb-1">{method.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {method.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod === "totp" && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-48 h-48 bg-white border rounded-lg flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-300" />
                        <div className="absolute text-xs text-center text-muted-foreground">
                          QR Code simulé
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="mb-2">1. Scannez le QR code</h4>
                          <p className="text-sm text-muted-foreground">
                            Ouvrez votre application d'authentification (Google Authenticator, Authy, etc.) et scannez ce code.
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2">Ou entrez manuellement cette clé :</h4>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                              {mockSecret}
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(mockSecret)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>2. Entrez le code de vérification à 6 chiffres</Label>
                    <div className="flex items-center gap-4">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        onClick={handleVerifyCode}
                        disabled={verificationCode.length !== 6}
                      >
                        Vérifier
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(selectedMethod === "sms" || selectedMethod === "email") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {selectedMethod === "sms" ? "Numéro de téléphone" : "Adresse email"}
                    </Label>
                    <Input
                      type={selectedMethod === "sms" ? "tel" : "email"}
                      placeholder={
                        selectedMethod === "sms"
                          ? "+33 6 12 34 56 78"
                          : "votre@email.fr"
                      }
                    />
                  </div>
                  <Button onClick={() => setShowQRCode(true)}>
                    Envoyer le code de vérification
                  </Button>
                </div>
              )}
            </div>
          )}

          {isVerified && backupCodes.length > 0 && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  MFA configuré avec succès ! Conservez précieusement vos codes de secours.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Codes de secours
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez ces codes si vous n'avez pas accès à votre application d'authentification
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(backupCodes.join("\n"))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <code key={idx} className="px-3 py-2 bg-muted rounded text-sm">
                      {code}
                    </code>
                  ))}
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Chaque code ne peut être utilisé qu'une seule fois. Conservez-les dans un endroit sûr.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
