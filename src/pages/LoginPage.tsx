import { useState } from "react";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = (path: string) => { window.location.href = path; };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const leftStyle: React.CSSProperties = {
    flex: 1,
    background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #2563eb 100%)",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "white",
  };

  const rightStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    background: "#f8fafc",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, sans-serif" }}>
      {/* Left panel */}
      <div style={leftStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "rgba(255,255,255,0.2)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "22px", fontWeight: "800"
          }}>I</div>
          <span style={{ fontSize: "24px", fontWeight: "800" }}>Invoicia</span>
        </div>

        <div>
          <div style={{ fontSize: "14px", background: "rgba(255,255,255,0.15)", display: "inline-block", padding: "6px 14px", borderRadius: "20px", marginBottom: "20px" }}>
            🚀 Plateforme SaaS Multi-Tenant
          </div>
          <h1 style={{ fontSize: "38px", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px" }}>
            Gérez votre activité en toute simplicité
          </h1>
          <p style={{ fontSize: "16px", opacity: "0.8", lineHeight: "1.7" }}>
            Facturation, projets, GED, comptabilité et analytics — tout en un seul endroit.
          </p>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          {[["500+", "Entreprises"], ["50K+", "Factures"], ["99.9%", "Disponibilité"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "26px", fontWeight: "800" }}>{val}</div>
              <div style={{ fontSize: "12px", opacity: "0.7", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={rightStyle}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "24px", fontWeight: "800", marginBottom: "12px"
            }}>I</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e1b4b" }}>Invoicia</div>
          </div>

          <div style={{
            background: "white", borderRadius: "24px", padding: "40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#1e1b4b", marginBottom: "6px" }}>
              Bon retour ! 👋
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>
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
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: "12px",
                    border: "2px solid #e5e7eb", fontSize: "14px", outline: "none",
                    background: "#f9fafb", boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6d28d9"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                    Mot de passe
                  </label>
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
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: "12px",
                    border: "2px solid #e5e7eb", fontSize: "14px", outline: "none",
                    background: "#f9fafb", boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6d28d9"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                  background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #6d28d9, #4f46e5)",
                  color: "white", fontSize: "15px", fontWeight: "700",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(109,40,217,0.35)"
                }}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter →"}
              </button>

              <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6b7280" }}>
                Pas encore de compte ?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}
                  style={{ color: "#6d28d9", fontWeight: "600", textDecoration: "none" }}>
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
  );
}
