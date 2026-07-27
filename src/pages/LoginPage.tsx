import { useState } from "react";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";

// Illustration for LOGIN: person unlocking their dashboard — distinct from the register scene.
function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 360 300" width="100%" style={{ display: "block" }}>
      <circle cx="70" cy="45" r="30" fill="rgba(255,255,255,0.06)" />
      <circle cx="320" cy="240" r="24" fill="rgba(255,255,255,0.06)" />

      {/* ground */}
      <ellipse cx="180" cy="270" rx="150" ry="14" fill="rgba(0,0,0,0.15)" />

      {/* shield / dashboard card */}
      <g transform="translate(150,60)">
        <rect x="0" y="0" width="130" height="150" rx="16" fill="#1E1B4B" stroke="#818CF8" strokeWidth="3" />
        <rect x="16" y="20" width="98" height="14" rx="4" fill="#4338CA" />
        <rect x="16" y="44" width="60" height="8" rx="3" fill="#818CF8" opacity="0.6" />
        <rect x="16" y="60" width="98" height="46" rx="6" fill="#0F172A" />
        <path d="M26 96l16-22 14 14 20-26 24 30" stroke="#34D399" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="116" width="45" height="20" rx="6" fill="#4F46E5" />
        <rect x="69" y="116" width="45" height="20" rx="6" fill="#312E81" />
      </g>

      {/* lock, unlocked */}
      <g transform="translate(196,32)">
        <rect x="0" y="14" width="38" height="30" rx="6" fill="#F59E0B" />
        <path d="M6 14V8a13 13 0 0 1 26 0" stroke="#FCD34D" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="19" cy="29" r="4.5" fill="#78350F" />
      </g>

      {/* person walking toward dashboard */}
      <g transform="translate(40,130)">
        <circle cx="34" cy="26" r="24" fill="#C4B5FD" />
        <path d="M8 26a26 26 0 0 1 52 0" fill="#4C1D95" />
        <rect x="4" y="52" width="60" height="70" rx="18" fill="#EDE9FE" />
        <rect x="16" y="70" width="36" height="26" rx="5" fill="#A78BFA" opacity="0.5" />
        {/* raised arm */}
        <rect x="52" y="60" width="14" height="34" rx="7" fill="#C4B5FD" transform="rotate(-25 59 60)" />
      </g>

      {/* key */}
      <g transform="translate(105,150) rotate(-20)">
        <circle cx="10" cy="10" r="10" fill="none" stroke="#FCD34D" strokeWidth="4" />
        <rect x="18" y="7" width="24" height="6" fill="#FCD34D" />
        <rect x="34" y="13" width="5" height="8" fill="#FCD34D" />
        <rect x="42" y="7" width="5" height="8" fill="#FCD34D" />
      </g>

      {/* floating sparkles */}
      <circle cx="290" cy="90" r="3" fill="#fff" opacity="0.7" />
      <circle cx="305" cy="120" r="2" fill="#fff" opacity="0.5" />
      <circle cx="60" cy="90" r="2.5" fill="#fff" opacity="0.6" />
    </svg>
  );
}

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

  return (
    <>
      <style>{`
        .inp-f { transition: border-color 0.15s, box-shadow 0.15s; }
        .inp-f:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        .btn-primary { transition: opacity 0.15s, transform 0.15s; }
        .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes floatSlow { 0%,100%{ transform: translateY(0px); } 50%{ transform: translateY(-10px); } }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif" }}>

        {/* LEFT — ILLUSTRATION + HEADLINE */}
        <div style={{
          flex: 1, background: "linear-gradient(160deg,#312E81,#4F46E5 60%,#1E3A8A)",
          padding: "40px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "24px", left: "40px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "14px" }}>I</div>
            <span style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>Invoicia</span>
          </div>

          <div className="float-slow" style={{ maxWidth: "460px", width: "100%", marginBottom: "8px" }}>
            <WelcomeIllustration />
          </div>

          <h1 style={{ color: "white", fontSize: "28px", fontWeight: 800, textAlign: "center", lineHeight: 1.3, maxWidth: "440px", marginTop: "8px" }}>
            Gérez votre activité<br />en toute simplicité
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", textAlign: "center", maxWidth: "360px", marginTop: "10px" }}>
            Retrouvez vos factures, projets et rapports en un instant.
          </p>
        </div>

        {/* RIGHT — FORM */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "white" }}>
          <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "420px" }}>

            <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>Welcome back</h2>
            <div style={{ width: "48px", height: "3px", background: "#4F46E5", borderRadius: "2px", marginBottom: "8px" }} />
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginBottom: "28px" }}>Connectez-vous à votre espace Invoicia</p>

            <div style={{ marginBottom: "18px" }}>
              <label style={fieldLabel}>Email</label>
              <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="inp-f" style={inputStyle} />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ ...fieldLabel, marginBottom: 0 }}>Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }} style={{ fontSize: "12px", color: "#4F46E5", textDecoration: "none", fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="inp-f" style={inputStyle} />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{
              width: "100%", padding: "13px", borderRadius: "10px", border: "none",
              background: isLoading ? "#9CA3AF" : "#4F46E5", color: "white", fontWeight: 700,
              fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer",
            }}>
              {isLoading ? "Connexion en cours..." : "Sign in →"}
            </button>

            <p style={{ marginTop: "16px", fontSize: "13px", color: "#6B7280" }}>
              Don't have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }} style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Create one</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

const fieldLabel: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: "1.5px solid #E5E7EB", fontSize: "13.5px", outline: "none",
  background: "#F9FAFB", boxSizing: "border-box",
};