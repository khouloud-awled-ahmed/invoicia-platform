import { ReactNode, useEffect, useState } from 'react';
import { User } from '../lib/auth';
import { LoginPage } from '../pages/LoginPage';

interface ProtectedRouteProps {
  children: ReactNode | ((user: User) => ReactNode);
  requiredRole?: 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'USER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier si un token existe dans localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      
      // Vérifier que l'utilisateur a les champs requis
      if (!parsedUser || !parsedUser.email || !parsedUser.id) {
        setIsAuthenticated(false);
        return;
      }

      // Vérifier le rôle si requis
      if (requiredRole && parsedUser.role !== requiredRole) {
        // Rediriger selon le rôle requis
        if (requiredRole === 'PLATFORM_ADMIN') {
          window.location.href = '/platform/admin';
        } else {
          window.location.href = '/login';
        }
        setIsAuthenticated(false);
        return;
      }

      setUser(parsedUser as User);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
    }
  }, [requiredRole]);

  // Afficher un loader pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Afficher le contenu protégé
  return <>{typeof children === 'function' ? children(user) : children}</>;
}
