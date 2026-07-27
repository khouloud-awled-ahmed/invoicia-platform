import { useState } from "react";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";

const MODULES = [
  { id: "SALES",      name: "Sales",      price: 10, desc: "Invoices, credits, sales management" },
  { id: "PURCHASES",  name: "Purchases",  price: 5,  desc: "Expenses, suppliers, purchasing" },
  { id: "PROJECTS",   name: "Projects",   price: 8,  desc: "Project management and CRA" },
  { id: "HR",         name: "HR",         price: 12, desc: "Absences, payroll, HR management" },
  { id: "ACCOUNTING", name: "Accounting", price: 15, desc: "Accounting entries, balance sheet" },
];

const BASE = 10;
const STEPS = ["Personal", "Company", "Modules"];

// Illustration for REGISTER: person setting up their workspace / signing up.
export function SignupIllustration() {
  return (
    <svg viewBox="0 0 360 300" width="100%" style={{ display: "block" }}>
      <circle cx="290" cy="50" r="34" fill="rgba(255,255,255,0.06)" />
      <circle cx="40" cy="230" r="26" fill="rgba(255,255,255,0.06)" />
      {/* window */}
      <rect x="24" y="24" width="96" height="70" rx="7" fill="#312E81" stroke="#818CF8" strokeWidth="2.5" />
      <circle cx="75" cy="52" r="16" fill="#F59E0B" opacity="0.9" />
      <circle cx="95" cy="70" r="5" fill="#FCD34D" />
      <circle cx="35" cy="75" r="3" fill="#fff" opacity="0.7" />
      <circle cx="50" cy="34" r="2.5" fill="#fff" opacity="0.5" />
      <circle cx="102" cy="35" r="2" fill="#fff" opacity="0.6" />
      {/* desk */}
      <rect x="10" y="235" width="340" height="16" rx="4" fill="#3730A3" />
      <rect x="30" y="251" width="16" height="46" fill="#312E81" />
      <rect x="314" y="251" width="16" height="46" fill="#312E81" />
      {/* monitor */}
      <rect x="128" y="140" width="130" height="88" rx="8" fill="#1E1B4B" stroke="#818CF8" strokeWidth="3" />
      <rect x="140" y="152" width="106" height="64" rx="3" fill="#0F172A" />
      <rect x="152" y="188" width="12" height="22" fill="#34D399" />
      <rect x="170" y="172" width="12" height="38" fill="#60A5FA" />
      <rect x="188" y="158" width="12" height="52" fill="#A78BFA" />
      <rect x="206" y="180" width="12" height="30" fill="#34D399" />
      {/* checkmark on screen */}
      <circle cx="228" cy="170" r="10" fill="#059669" />
      <path d="M223 170l4 4 8-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="180" y="230" width="26" height="12" fill="#818CF8" />
      <rect x="140" y="244" width="108" height="9" rx="3" fill="#4338CA" />
      {/* person */}
      <g transform="translate(30,122)">
        <circle cx="36" cy="26" r="24" fill="#FDBA74" />
        <path d="M10 26a26 26 0 0 1 52 0" fill="#7C2D12" />
        <path d="M56 16c7 3 12 10 9 20" fill="#7C2D12" />
        <rect x="6" y="50" width="60" height="72" rx="18" fill="#E0E7FF" />
        <rect x="18" y="70" width="36" height="28" rx="5" fill="#818CF8" opacity="0.5" />
        <rect x="6" y="90" width="16" height="34" rx="8" fill="#FDBA74" />
      </g>
      {/* floating cat */}
      <g transform="translate(110,10)">
        <circle cx="12" cy="12" r="11" fill="#F97316" />
        <path d="M3 4l5 6M21 4l-5 6" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="8" cy="12" r="1.6" fill="#1E1B4B" />
        <circle cx="16" cy="12" r="1.6" fill="#1E1B4B" />
      </g>
      {/* document */}
      <g transform="translate(268,160) rotate(-7)">
        <rect x="0" y="0" width="52" height="64" rx="5" fill="#fff" />
        <rect x="10" y="12" width="32" height="5" rx="2.5" fill="#C7D2FE" />
        <rect x="10" y="23" width="32" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="10" y="34" width="22" height="5" rx="2.5" fill="#E5E7EB" />
        <circle cx="38" cy="50" r="10" fill="#4F46E5" />
        <path d="M33 50l3 3 7-7" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* coffee cup */}
      <g transform="translate(96,205)">
        <rect x="0" y="6" width="20" height="20" rx="4" fill="#fff" opacity="0.9" />
        <path d="M20 10h5a5 5 0 0 1 0 10h-5" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9" />
        <path d="M6 2c1-2 3-2 3 0M13 2c1-2 3-2 3 0" stroke="#A78BFA" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function RegisterPage() {
  const navigate = (path: string) => { window.location.href = path; };

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", taxId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentClaimed, setPaymentClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const total = BASE + MODULES.filter(m => selected.has(m.id)).reduce((s, m) => s + m.price, 0);

  const toggle = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password) { toast.error("Please fill in all fields"); return false; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (!form.company || !form.taxId) { toast.error("Please fill in all fields"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => Math.min(3, s + 1));
  };
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    setIsLoading(true);
    try {
      const result = await apiClient.register({
        name: form.name, email: form.email, password: form.password,
        companyName: form.company, matriculeFiscal: form.taxId,
        selectedModules: [...selected],
      } as any);
      setTotalAmount(total);
      setTenantId((result as any)?.user?.tenantId || "");
      setRegistered(true);
    } catch (error: any) {
      let message = "Erreur lors de l'inscription";
      try {
        const parsed = JSON.parse(error.message);
        message = Array.isArray(parsed.message) ? parsed.message.join(", ") : (parsed.message || message);
      } catch { message = error.message || message; }
      toast.error(message);
    } finally { setIsLoading(false); }
  };

  const handleClaimPayment = async () => {
    setClaimLoading(true);
    try {
      await apiClient.request(`/platform/tenants/${tenantId}/claim-payment`, {
        method: "POST",
        body: JSON.stringify({ amount: totalAmount, companyName: form.company, plan: "CUSTOM" }),
      });
      setPaymentClaimed(true);
      toast.success("Votre déclaration a été envoyée à l'administrateur !");
    } catch { toast.error("Erreur lors de l'envoi — réessayez plus tard"); }
    finally { setClaimLoading(false); }
  };

  const SharedStyle = () => (
    <style>{`
      .inp-f { transition: border-color 0.15s, box-shadow 0.15s; }
      .inp-f:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
      .btn-primary { transition: opacity 0.15s, transform 0.15s; }
      .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn-secondary:hover { background: #F3F4F6; }
      .mod-row:hover { border-color: #A5B4FC; }
      @keyframes fadeStep { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      .step-fade { animation: fadeStep 0.25s ease both; }
      @keyframes floatSlow { 0%,100%{ transform: translateY(0px); } 50%{ transform: translateY(-10px); } }
      .float-slow { animation: floatSlow 5s ease-in-out infinite; }
    `}</style>
  );

  if (registered) {
    return (
      <>
        <SharedStyle />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", background: "#F9FAFB", padding: "32px" }}>
          <div style={{ width: "100%", maxWidth: "460px", background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Compte créé avec succès ✅</h2>
            <p style={{ color: "#6B7280", fontSize: "13.5px", marginBottom: "24px" }}>Finalisez votre inscription en effectuant le paiement</p>

            <div style={{ background: "#EEF2FF", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
              <p style={{ color: "#4F46E5", fontWeight: 700, fontSize: "15px" }}>Montant : <span style={{ fontSize: "20px" }}>{totalAmount} TND/mois</span></p>
            </div>

            <div style={{ border: "1px solid #E5E7EB", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
              <p style={{ fontWeight: 600, color: "#111827", marginBottom: "8px", fontSize: "13.5px" }}>📋 Instructions de virement</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#9CA3AF" }}>Bénéficiaire</span><span style={{ fontWeight: 600 }}>Invoicia SAS</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#9CA3AF" }}>IBAN</span><span style={{ fontWeight: 600, fontFamily: "monospace" }}>TN59 XXXX XXXX XXXX XXXX</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#9CA3AF" }}>BIC</span><span style={{ fontWeight: 600 }}>BIATTNTT</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#9CA3AF" }}>Référence</span><span style={{ fontWeight: 600, color: "#4F46E5" }}>{form.company.toUpperCase()}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#9CA3AF" }}>Montant</span><span style={{ fontWeight: 700, color: "#4F46E5" }}>{totalAmount} TND</span></div>
              </div>
            </div>

            {!paymentClaimed ? (
              <div style={{ border: "1px solid #A7F3D0", background: "#ECFDF5", borderRadius: "14px", padding: "14px", marginBottom: "18px" }}>
                <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#065F46", marginBottom: "6px" }}>✅ Virement effectué ?</p>
                <button onClick={handleClaimPayment} disabled={claimLoading} className="btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#059669", color: "white", fontWeight: 700, fontSize: "13.5px", cursor: "pointer" }}>
                  {claimLoading ? "Envoi..." : "J'ai effectué mon virement"}
                </button>
              </div>
            ) : (
              <div style={{ border: "1px solid #A7F3D0", background: "#ECFDF5", borderRadius: "14px", padding: "14px", marginBottom: "18px", textAlign: "center" }}>
                <p style={{ fontWeight: 700, color: "#065F46", fontSize: "13.5px" }}>Déclaration envoyée !</p>
              </div>
            )}

            <button onClick={() => navigate("/login")} className="btn-secondary" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, fontSize: "13.5px", cursor: "pointer" }}>
              Aller à la connexion
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SharedStyle />
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
            <SignupIllustration />
          </div>

          <h1 style={{ color: "white", fontSize: "28px", fontWeight: 800, textAlign: "center", lineHeight: 1.3, maxWidth: "440px", marginTop: "8px" }}>
            Rejoignez Invoicia<br />en quelques minutes
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", textAlign: "center", maxWidth: "360px", marginTop: "10px" }}>
            Créez votre compte, choisissez vos modules, et gérez votre entreprise en toute simplicité.
          </p>
        </div>

        {/* RIGHT — FORM */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "white" }}>
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "480px" }}>

            <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>Registration</h2>
            <div style={{ width: "48px", height: "3px", background: "#4F46E5", borderRadius: "2px", marginBottom: "20px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
              {STEPS.map((label, i) => {
                const n = i + 1;
                return (
                  <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ height: "3px", borderRadius: "2px", background: n <= step ? "#4F46E5" : "#E5E7EB" }} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: n === step ? "#4F46E5" : n < step ? "#111827" : "#9CA3AF" }}>{label}</span>
                  </div>
                );
              })}
            </div>

            <div key={step} className="step-fade">
              {step === 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={fieldLabel}>Full Name</label>
                    <input type="text" placeholder="Please enter your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="inp-f" style={inputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="inp-f" style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={fieldLabel}>Password</label>
                    <input type="password" placeholder="Please enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="inp-f" style={inputStyle} />
                    <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>At least 6 characters</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={fieldLabel}>Company Name</label>
                    <input type="text" placeholder="Ma Societe SARL" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="inp-f" style={inputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Tax ID</label>
                    <input type="text" placeholder="1234567/A/B/M/000" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} className="inp-f" style={inputStyle} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>Modules</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#4F46E5" }}>{total} TND/mo</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {MODULES.map(m => {
                      const on = selected.has(m.id);
                      return (
                        <div key={m.id} onClick={() => toggle(m.id)} className="mod-row" style={{
                          border: `1.5px solid ${on ? "#4F46E5" : "#E5E7EB"}`, background: on ? "#EEF2FF" : "white",
                          borderRadius: "10px", padding: "10px 12px", cursor: "pointer", transition: "all 0.15s",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{m.name}</span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: on ? "#4F46E5" : "#9CA3AF" }}>+{m.price} DT</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>{m.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {step > 1 && (
                <button type="button" onClick={handleBack} className="btn-secondary" style={{ flex: "0 0 auto", padding: "13px 20px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
                  Back
                </button>
              )}
              {step < 3 && (
                <button type="button" onClick={handleNext} className="btn-primary" style={{ flex: 1, padding: "13px", borderRadius: "10px", border: "none", background: "#4F46E5", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  Next Step <span>→</span>
                </button>
              )}
              {step === 3 && (
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ flex: 1, padding: "13px", borderRadius: "10px", border: "none", background: isLoading ? "#9CA3AF" : "#4F46E5", color: "white", fontWeight: 700, fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer" }}>
                  {isLoading ? "Création..." : "Create Account →"}
                </button>
              )}
            </div>

            <p style={{ marginTop: "16px", fontSize: "13px", color: "#6B7280" }}>
              Already have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }} style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Sign in</a>
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