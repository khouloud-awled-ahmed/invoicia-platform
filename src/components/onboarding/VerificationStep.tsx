import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { apiClient } from '../../lib/api-client-backend';
import { toast } from 'sonner';
import { Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';

interface VerificationStepProps {
  settings: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
  };
  data: {
    emailVerified: boolean;
    phoneVerified: boolean;
    phone: string;
  };
  onUpdate: (data: Partial<VerificationStepProps['data']>) => void;
  onComplete: () => void;
}

export function VerificationStep({ settings, data, onUpdate, onComplete }: VerificationStepProps) {
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [phone, setPhone] = useState(data.phone);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [validatingSMS, setValidatingSMS] = useState(false);

  const handleSendEmailOTP = async () => {
    try {
      setSendingEmail(true);
      await apiClient.sendEmailOTP();
      toast.success('Code OTP envoyé par email');
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendSMSOTP = async () => {
    if (!phone) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    try {
      setSendingSMS(true);
      await apiClient.sendSMSOTP(phone);
      toast.success('Code OTP envoyé par SMS');
      onUpdate({ phone });
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setSendingSMS(false);
    }
  };

  const handleValidateEmailOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setValidatingEmail(true);
      await apiClient.validateEmailOTP(emailOTP);
      toast.success('Email vérifié avec succès');
      onUpdate({ emailVerified: true });
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Code invalide'));
    } finally {
      setValidatingEmail(false);
    }
  };

  const handleValidateSMSOTP = async () => {
    if (!phoneOTP || phoneOTP.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setValidatingSMS(true);
      await apiClient.validateSMSOTP(phone, phoneOTP);
      toast.success('Téléphone vérifié avec succès');
      onUpdate({ phoneVerified: true });
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || 'Code invalide'));
    } finally {
      setValidatingSMS(false);
    }
  };

  const canProceed = (!settings.requireEmailVerification || data.emailVerified) &&
    (!settings.requirePhoneVerification || data.phoneVerified);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vérification de votre identité</h2>
        <p className="text-muted-foreground">
          Pour sécuriser votre compte, nous devons vérifier votre email{settings.requirePhoneVerification ? ' et votre téléphone' : ''}
        </p>
      </div>

      {settings.requireEmailVerification && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Vérification Email</h3>
              {data.emailVerified && (
                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
              )}
            </div>
            {!data.emailVerified ? (
              <div className="space-y-4">
                <Button
                  onClick={handleSendEmailOTP}
                  disabled={sendingEmail}
                  variant="outline"
                  className="w-full"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer le code par email
                    </>
                  )}
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="email-otp">Code reçu par email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email-otp"
                      value={emailOTP}
                      onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                    <Button
                      onClick={handleValidateEmailOTP}
                      disabled={validatingEmail || emailOTP.length !== 6}
                    >
                      {validatingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Vérifier'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-green-600 font-medium">✓ Email vérifié</p>
            )}
          </CardContent>
        </Card>
      )}

      {settings.requirePhoneVerification && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Vérification Téléphone</h3>
              {data.phoneVerified && (
                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
              )}
            </div>
            {!data.phoneVerified ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      type="tel"
                    />
                    <Button
                      onClick={handleSendSMSOTP}
                      disabled={sendingSMS || !phone}
                      variant="outline"
                    >
                      {sendingSMS ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Envoyer SMS'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-otp">Code reçu par SMS</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sms-otp"
                      value={phoneOTP}
                      onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                    <Button
                      onClick={handleValidateSMSOTP}
                      disabled={validatingSMS || phoneOTP.length !== 6}
                    >
                      {validatingSMS ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Vérifier'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-green-600 font-medium">✓ Téléphone vérifié</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onComplete} disabled={!canProceed}>
          Continuer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
