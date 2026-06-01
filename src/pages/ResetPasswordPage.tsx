import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { apiClient } from '../lib/api-client-backend';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Récupérer email et token depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const tokenParam = params.get('token');

    console.log('ResetPasswordPage - URL params:', { 
      emailParam, 
      tokenParam: tokenParam ? `${tokenParam.substring(0, 20)}... (length: ${tokenParam.length})` : 'missing',
      fullUrl: window.location.href
    });

    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setEmail(decodedEmail);
      console.log('Email decoded:', decodedEmail);
    }
    if (tokenParam) {
      const decodedToken = decodeURIComponent(tokenParam);
      setToken(decodedToken);
      console.log('Token decoded:', { 
        length: decodedToken.length, 
        firstChars: decodedToken.substring(0, 20),
        lastChars: decodedToken.substring(decodedToken.length - 20)
      });
    }

    // Si email ou token manquant, rediriger vers forgot-password
    if (!emailParam || !tokenParam) {
      console.error('Missing email or token in URL');
      toast.error('Lien de réinitialisation invalide');
      setTimeout(() => {
        window.location.href = '/forgot-password';
      }, 2000);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Reset password attempt:', { email, token: token ? 'present' : 'missing', newPasswordLength: newPassword.length });

    if (!email || !token) {
      console.error('Missing email or token:', { email: !!email, token: !!token, emailValue: email, tokenLength: token?.length });
      toast.error('Lien de réinitialisation invalide. Veuillez redemander un nouveau lien.');
      return;
    }

    if (token.length < 10) {
      console.error('Token seems too short:', token.length);
      toast.error('Token invalide. Veuillez redemander un nouveau lien.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Calling resetPassword API...', { email, tokenLength: token.length, passwordLength: newPassword.length });
      const result = await apiClient.resetPassword(email, token, newPassword);
      console.log('Reset password successful:', result);
      setIsSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès');
      
      // Rediriger vers login après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.message || 'Erreur lors de la réinitialisation';
      console.error('Error details:', { 
        message: errorMessage, 
        email, 
        hasToken: !!token,
        tokenLength: token?.length 
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">Mot de passe réinitialisé !</h2>
              <p className="text-muted-foreground">
                Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            Entrez votre nouveau mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 caractères
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email || !token}
            >
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </Button>
            {(!email || !token) && (
              <p className="text-xs text-red-600 text-center">
                Lien de réinitialisation invalide. Veuillez redemander un nouveau lien.
              </p>
            )}
            <div className="text-center text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className="text-primary hover:underline"
              >
                Retour à la connexion
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
