import { useState, useEffect } from "react";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = (path: string) => { window.location.href = path; };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await apiClient.login({ email, password });
      if (result.access_token) {
        toast.success("Connexion réussie");
        if (result.user.role === "PLATFORM_ADMIN") navigate("/platform/admin");
        else navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .btn-login:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(109,40,217,0.5) !important;
        }
        .btn-login:active {
          transform: translateY(0px) !important;
        }
        .input-field:focus {
          border-color: #6d28d9 !important;
          box-shadow: 0 0 0 4px rgba(109,40,217,0.1) !important;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.2) !important;
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

        {/* LEFT PANEL */}
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 30%, #4f46e5 60%, #2563eb 100%)",
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
          position: "relative",
          overflow: "hidden",
          animation: mounted ? "slideInLeft 0.7s ease forwards" : "none",
        }}>

          {/* Animated background circles */}
          <div style={{
            position: "absolute", top: "10%", right: "10%",
            width: "300px", height: "300px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            animation: "float 6s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "20%", left: "-5%",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            animation: "float2 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "50%", right: "20%",
            width: "150px", height: "150px", borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            animation: "float 10s ease-in-out infinite",
          }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1,
            animation: mounted ? "fadeInUp 0.8s ease 0.2s both" : "none" }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "14px",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: "900", border: "1px solid rgba(255,255,255,0.3)"
            }}>I</div>
            <span style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>Invoicia</span>
          </div>

          {/* Main content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: "13px",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "20px", marginBottom: "24px",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: mounted ? "fadeInUp 0.8s ease 0.3s both" : "none"
            }}>
              <span>🚀</span> Plateforme SaaS Multi-Tenant
            </div>

            <h1 style={{
              fontSize: "40px", fontWeight: "900", lineHeight: "1.15",
              marginBottom: "16px", letterSpacing: "-1px",
              animation: mounted ? "fadeInUp 0.8s ease 0.4s both" : "none"
            }}>
              Gérez votre activité<br />en toute simplicité
            </h1>

            <p style={{
              fontSize: "16px", opacity: "0.8", lineHeight: "1.7", maxWidth: "400px",
              animation: mounted ? "fadeInUp 0.8s ease 0.5s both" : "none"
            }}>
              Facturation, projets, GED, comptabilité et analytics — tout en un seul endroit.
            </p>

            {/* Feature pills */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px",
              animation: mounted ? "fadeInUp 0.8s ease 0.6s both" : "none"
            }}>
              {["✅ Facturation auto", "📊 Analytics", "🔐 Multi-tenant", "📁 GED", "🤖 IA intégrée"].map(f => (
                <span key={f} style={{
                  fontSize: "12px", padding: "5px 12px", borderRadius: "20px",
                  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)"
                }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "16px", position: "relative", zIndex: 1,
            animation: mounted ? "fadeInUp 0.8s ease 0.7s both" : "none"
          }}>
            {[["500+", "Entreprises", "🏢"], ["50K+", "Factures", "📄"], ["99.9%", "Disponibilité", "⚡"]].map(([val, label, icon]) => (
              <div key={label} className="stat-card" style={{
                flex: 1, textAlign: "center", padding: "16px 12px",
                background: "rgba(255,255,255,0.1)", borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)", transition: "all 0.3s ease", cursor: "default"
              }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
                <div style={{ fontSize: "22px", fontWeight: "800" }}>{val}</div>
                <div style={{ fontSize: "11px", opacity: "0.7", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px", background: "#f8fafc",
          animation: mounted ? "slideInRight 0.7s ease forwards" : "none",
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>

            {/* Logo */}
            <div style={{
              textAlign: "center", marginBottom: "32px",
              animation: mounted ? "fadeInUp 0.8s ease 0.3s both" : "none"
            }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "16px",
                  background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
                  animation: "pulse-ring 2s ease-out infinite",
                }} />
                <div style={{
                  width: "56px", height: "56px", borderRadius: "16px",
                  background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "26px", fontWeight: "900",
                  position: "relative", zIndex: 1, marginBottom: "12px"
                }}>I</div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e1b4b", marginTop: "8px" }}>Invoicia</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Plateforme SaaS · v2026</div>
            </div>

            {/* Card */}
            <div style={{
              background: "white", borderRadius: "24px", padding: "40px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              animation: mounted ? "fadeInUp 0.8s ease 0.4s both" : "none"
            }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e1b4b", marginBottom: "4px" }}>
                Bon retour ! 👋
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "28px" }}>
                Connectez-vous à votre espace Invoicia
              </p>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    Adresse email
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field"
                    style={{
                      width: "100%", padding: "13px 16px", borderRadius: "12px",
                      border: "2px solid #e5e7eb", fontSize: "14px", outline: "none",
                      background: "#f9fafb", boxSizing: "border-box", transition: "all 0.2s"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Mot de passe</label>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}
                      style={{ fontSize: "12px", color: "#6d28d9", textDecoration: "none", fontWeight: "500" }}>
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field"
                    style={{
                      width: "100%", padding: "13px 16px", borderRadius: "12px",
                      border: "2px solid #e5e7eb", fontSize: "14px", outline: "none",
                      background: "#f9fafb", boxSizing: "border-box", transition: "all 0.2s"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-login"
                  style={{
                    width: "100%", padding: "15px", borderRadius: "12px", border: "none",
                    background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #6d28d9, #4f46e5)",
                    color: "white", fontSize: "15px", fontWeight: "700",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(109,40,217,0.35)",
                    transition: "all 0.2s ease", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "8px"
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white", borderRadius: "50%",
                        animation: "rotate 0.8s linear infinite"
                      }} />
                      Connexion en cours...
                    </>
                  ) : "Se connecter →"}
                </button>

                <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6b7280" }}>
                  Pas encore de compte ?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}
                    style={{ color: "#6d28d9", fontWeight: "700", textDecoration: "none" }}>
                    Créer un compte
                  </a>
                </p>
              </form>
            </div>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#9ca3af" }}>
              © 2026 Invoicia Platform · Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
