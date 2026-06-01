import React, { useState, useEffect } from "react";
import { SuperAdminLayout } from "./components/SuperAdminLayout";
import { MainLayout } from "./components/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { User, isSuperAdmin } from "./lib/auth";
import { ProjectProvider } from "./lib/projectContext";
import { InvoiceTemplateProvider } from "./utils/invoiceTemplateContext";
import { InvoiceSettingsProvider } from "./utils/invoiceSettingsContext";
import { CompanySettingsProvider } from "./contexts/CompanySettingsContext";
import { CompanyOnboardingWizard } from "./components/CompanyOnboardingWizard";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PlatformLayout } from "./components/PlatformLayout";
import { PlatformDashboardPage } from "./pages/platform/PlatformDashboardPage";
import { PlatformTenantsPage } from "./pages/platform/PlatformTenantsPage";
import { PlatformPlansPage } from "./pages/platform/PlatformPlansPage";
import { PlatformSettingsPage } from "./pages/platform/PlatformSettingsPage";
import { PaymentSettingsPage } from "./pages/PaymentSettingsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { apiClient } from "./lib/api-client-backend";

export default function App() {
  // Tous les hooks doivent être déclarés en premier
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [PublicSignaturePageComponent, setPublicSignaturePageComponent] = useState<React.ComponentType<any> | null>(null);

  // Fonction pour charger l'utilisateur depuis localStorage
  const loadUserFromStorage = React.useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setIsCheckingAuth(false);
        return;
      }

      const user = JSON.parse(userStr);
      
      // Vérifier que l'utilisateur a les champs requis
      // ET que tenantId n'est pas 'tenant-1' (valeur obsolète)
      if (user && user.email && user.id) {
        // Rejeter explicitement 'tenant-1' si présent dans localStorage
        if (user.tenantId === 'tenant-1') {
          console.warn('Tenant ID obsolète détecté, nettoyage du localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsCheckingAuth(false);
          return;
        }
        setCurrentUser(user as User);
        setIsLoggedIn(true);
      } else {
        // Données invalides, nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      // Nettoyer le localStorage en cas d'erreur
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    // Vérifier si c'est une page de signature publique
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith("/sign/") || window.location.pathname === "/sign")) {
      // Import dynamique pour éviter les erreurs de chargement
      import("./pages/PublicSignaturePage").then((module) => {
        setPublicSignaturePageComponent(module.PublicSignaturePage);
        setIsCheckingAuth(false);
      }).catch((error) => {
        console.error("Erreur lors du chargement de PublicSignaturePage:", error);
        setIsCheckingAuth(false);
      });
      return;
    }

    // Charger l'utilisateur depuis localStorage au démarrage
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const handleLogout = () => {
    // Nettoyer le localStorage
    apiClient.clearToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdminMode(false);
    
    // Rediriger vers la page de login
    window.location.href = '/login';
  };

  // Écouter les changements de localStorage pour mettre à jour l'état
  useEffect(() => {
    const handleStorageChange = () => {
      loadUserFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadUserFromStorage]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Page publique de signature (chargée dynamiquement)
  if (PublicSignaturePageComponent) {
    return <PublicSignaturePageComponent />;
  }
  
  // Affichage d'un loader pendant le chargement de la page de signature
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith("/sign/") || window.location.pathname === "/sign")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la page de signature...</p>
        </div>
      </div>
    );
  }

  // Gestion des routes basée sur window.location.pathname
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // Routes publiques (non protégées)
  if (pathname === '/login') {
    // Si déjà connecté, rediriger vers le dashboard
    if (isLoggedIn && currentUser) {
      window.location.href = '/';
      return null;
    }
    return <LoginPage />;
  }
  
  if (pathname === '/register') {
    // Si déjà connecté, rediriger vers le dashboard
    if (isLoggedIn && currentUser) {
      window.location.href = '/';
      return null;
    }
    return <RegisterPage />;
  }

  if (pathname === '/forgot-password') {
    // Si déjà connecté, rediriger vers le dashboard
    if (isLoggedIn && currentUser) {
      window.location.href = '/';
      return null;
    }
    return <ForgotPasswordPage />;
  }

  if (pathname === '/reset-password') {
    // Si déjà connecté, rediriger vers le dashboard
    if (isLoggedIn && currentUser) {
      window.location.href = '/';
      return null;
    }
    return <ResetPasswordPage />;
  }
  
  // Routes Platform Admin (protégées)
  if (pathname.startsWith('/platform/')) {
    return (
      <ProtectedRoute requiredRole="PLATFORM_ADMIN">
        <PlatformLayout user={currentUser!} onLogout={handleLogout}>
          {(() => {
            if (pathname.includes('/platform/tenants')) {
              return <PlatformTenantsPage />;
            } else if (pathname.includes('/platform/plans')) {
              return <PlatformPlansPage />;
            } else if (pathname.includes('/platform/settings')) {
              return <PlatformSettingsPage />;
            } else {
              return <PlatformDashboardPage />;
            }
          })()}
        </PlatformLayout>
      </ProtectedRoute>
    );
  }
  
  // Route Payment Settings (protégée)
  if (pathname === '/settings/payments') {
    return (
      <ProtectedRoute>
        {currentUser && (currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'PLATFORM_ADMIN') ? (
          <PaymentSettingsPage />
        ) : (
          <LoginPage />
        )}
      </ProtectedRoute>
    );
  }

  // Routing intelligent selon le rôle
  if (isLoggedIn && currentUser) {
    // Si CONSULTANT essaie d'accéder à des routes admin, rediriger vers /my-leaves
    if (currentUser.role === 'CONSULTANT') {
      const allowedPaths = ['/my-leaves', '/my-profile'];
      const isAllowedPath = allowedPaths.includes(pathname) || pathname.startsWith('/login') || pathname.startsWith('/register');
      
      if (!isAllowedPath) {
        if (pathname === '/' || pathname === '/dashboard') {
          window.location.href = '/my-leaves';
          return null;
        }
        window.location.href = '/my-leaves';
        return null;
      }
    }

    // TENANT_ADMIN, MANAGER, RH : ACCÈS TOTAL à toutes les routes (sauf /platform/*)
    // Ne PAS les rediriger, laisser MainLayout gérer toutes leurs routes
    if (currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'MANAGER' || currentUser.role === 'RH') {
      // Seulement bloquer l'accès à /platform/*
      if (pathname.startsWith('/platform/')) {
        window.location.href = '/';
        return null;
      }
      // Pour toutes les autres routes, laisser passer (pas de redirection)
    }

    // PLATFORM_ADMIN : rediriger uniquement depuis la racine vers /platform/admin
    if (currentUser.role === 'PLATFORM_ADMIN' && !pathname.startsWith('/platform/') && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      // Ne rediriger que depuis la racine ou /dashboard
      if (pathname === '/' || pathname === '/dashboard') {
        window.location.href = '/platform/admin';
        return null;
      }
      // Pour toutes les autres routes, laisser passer
    }
  }

  // Route Onboarding (protégée mais accessible si INCOMPLETE)
  if (pathname === '/onboarding') {
    return (
      <ProtectedRoute>
        {(user) => {
          // Vérifier le statut d'abonnement
          if (user.role === 'PLATFORM_ADMIN') {
            window.location.href = '/platform/admin';
            return null;
          }
          return <OnboardingPage />;
        }}
      </ProtectedRoute>
    );
  }

  // Toutes les autres routes sont protégées
  return (
    <ProtectedRoute>
      {(user) => {
        // TENANT_ADMIN, MANAGER, RH : ACCÈS TOTAL - Ne PAS rediriger
        // Seulement bloquer l'accès à /platform/*
        if (user.role === 'TENANT_ADMIN' || user.role === 'MANAGER' || user.role === 'RH') {
          if (pathname.startsWith('/platform/')) {
            window.location.href = '/';
            return null;
          }
          // Pour toutes les autres routes, laisser passer (pas de redirection)
        }

        // PLATFORM_ADMIN : rediriger uniquement depuis la racine
        if (user.role === 'PLATFORM_ADMIN' && !pathname.startsWith('/platform/') && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
          if (pathname === '/' || pathname === '/dashboard') {
            window.location.href = '/platform/admin';
            return null;
          }
          // Pour toutes les autres routes, laisser passer
        }

        // CONSULTANT : rediriger vers /my-leaves si accès à une route admin
        if (user.role === 'CONSULTANT') {
          const allowedPaths = ['/my-leaves', '/my-profile'];
          if (!allowedPaths.includes(pathname) && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            if (pathname === '/' || pathname === '/dashboard') {
              window.location.href = '/my-leaves';
              return null;
            }
            window.location.href = '/my-leaves';
            return null;
          }
        }

        // Vérifier si l'utilisateur doit compléter l'onboarding (dans CompanySettingsContext)

        return (
          <>
            {/* Mode Super-Admin */}
            {isAdminMode && isSuperAdmin(user) ? (
              <SuperAdminLayout onExit={() => setIsAdminMode(false)} />
            ) : user.role === 'PLATFORM_ADMIN' ? (
              /* Platform Admin Layout */
              <PlatformLayout user={user} onLogout={handleLogout}>
                {(() => {
                  const pathname = window.location.pathname;
                  if (pathname.includes('/platform/tenants')) {
                    return <PlatformTenantsPage />;
                  } else if (pathname.includes('/platform/plans')) {
                    return <PlatformPlansPage />;
                  } else if (pathname.includes('/platform/settings')) {
                    return <PlatformSettingsPage />;
                  } else {
                    return <PlatformDashboardPage />;
                  }
                })()}
              </PlatformLayout>
            ) : (
              /* Mode Utilisateur Normal */
              <ProjectProvider>
                <InvoiceTemplateProvider>
                  <InvoiceSettingsProvider>
                    <CompanySettingsProvider>
                      <CompanyOnboardingWizard />
                      <MainLayout 
                        user={user}
                        onSwitchToAdmin={isSuperAdmin(user) ? () => setIsAdminMode(true) : undefined}
                        onLogout={handleLogout}
                      />
                    </CompanySettingsProvider>
                  </InvoiceSettingsProvider>
                </InvoiceTemplateProvider>
              </ProjectProvider>
            )}
          </>
        );
      }}
    </ProtectedRoute>
  );
}