import { useState } from "react";
import { apiClient } from "../lib/api-client-backend";
import { toast } from "sonner";

const MODULES = [
  { id: "SALES",      name: "Sales",      price: 10, desc: "Invoices, credits, sales management", color: "#a78bfa", icon: "sales" },
  { id: "PURCHASES",  name: "Purchases",  price: 5,  desc: "Expenses, suppliers, purchasing",       color: "#60a5fa", icon: "purchases" },
  { id: "PROJECTS",   name: "Projects",   price: 8,  desc: "Project management and CRA",            color: "#fbbf24", icon: "projects" },
  { id: "HR",         name: "HR",         price: 12, desc: "Absences, payroll, HR management",      color: "#f472b6", icon: "hr" },
  { id: "ACCOUNTING", name: "Accounting", price: 15, desc: "Accounting entries, balance sheet",     color: "#34d399", icon: "accounting" },
];

const BASE = 10;
const EUR_TO_TND = 3.4;
const STEPS = ["Personal", "Company", "Modules"];

function ModuleIcon({ type, color }: { type: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    sales: <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 5h13" strokeLinecap="round" strokeLinejoin="round" />,
    purchases: <path d="M20 7h-3V5a4 4 0 0 0-8 0v2H6a1 1 0 0 0-1 .93L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-1-12.07A1 1 0 0 0 20 7zM10 5a2 2 0 0 1 4 0v2h-4z" strokeLinecap="round" strokeLinejoin="round" />,
    projects: <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M13 3h8v8M21 3l-9 9" strokeLinecap="round" strokeLinejoin="round" />,
    hr: <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />,
    accounting: <path d="M9 2h6l1 4H8l1-4zM5 6h14l1 4H4l1-4zM4 10h16l-1 11H5L4 10zM9 14v4M12 14v4M15 14v4" strokeLinecap="round" strokeLinejoin="round" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">{icons[type]}</svg>;
}

export function RegisterPage() {
  const navigate = (path: string) => { window.location.href = path; };

  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState<"EUR" | "TND">("EUR");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bump, setBump] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"", company:"", taxId:"" });
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentClaimed, setPaymentClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const totalEur = BASE + MODULES.filter(m => selected.has(m.id)).reduce((s, m) => s + m.price, 0);
  const total = currency === "TND" ? Math.round(totalEur * EUR_TO_TND) : totalEur;
  const symbol = currency === "TND" ? "DT" : "€";
  const conv = (p: number) => currency === "TND" ? Math.round(p * EUR_TO_TND) : p;

  const toggle = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setBump(true); setTimeout(() => setBump(false), 350);
  };

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password) { toast.error("Please fill in all personal info fields"); return false; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (!form.company || !form.taxId) { toast.error("Please fill in all company fields"); return false; }
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
      setTotalAmount(totalEur);
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

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      .f-display { font-family: 'Space Grotesk', sans-serif; }
      .f-body { font-family: 'Inter', sans-serif; }
      @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-18px) scale(1.05)} 66%{transform:translate(-14px,22px) scale(0.97)} }
      @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-22px,18px) scale(1.04)} 66%{transform:translate(18px,-14px) scale(0.98)} }
      @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-18px,-16px) scale(1.06)} }
      @keyframes bump { 0%{transform:scale(1)} 40%{transform:scale(1.15)} 100%{transform:scale(1)} }
      @keyframes fadein { from{opacity:0; transform:translateY(-3px);} to{opacity:1; transform:translateY(0);} }
      @keyframes shine { 0%{left:-100%} 100%{left:200%} }
      .blob1 { animation: drift1 9s ease-in-out infinite; }
      .blob2 { animation: drift2 11s ease-in-out infinite; }
      .blob3 { animation: drift3 13s ease-in-out infinite; }
      .price-bump { animation: bump 0.35s ease; }
      .breakdown-row { animation: fadein 0.25s ease; }
      .pill-shine { position:relative; overflow:hidden; }
      .pill-shine::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent); animation: shine 2.6s infinite; }
      .mod-card { transition: all 0.22s; }
      .mod-card:hover { transform: translateY(-3px); }
      .mod-card.on { transform: translateY(-3px); }
      .inp-f { transition: all 0.2s; }
      .inp-f:focus { transform: translateY(-1px); box-shadow: 0 0 0 3.5px rgba(124,58,237,0.14); }
      .submit-btn { position:relative; overflow:hidden; transition:all 0.2s; }
      .submit-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transition:left 0.5s; }
      .submit-btn:hover::before { left:100%; }
      .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,0.4); }
      .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .cur-toggle { transition: all 0.2s; }
      .left-panel { display: none; }
       media (min-width: 900px) { .left-panel { display: flex; } }
    `}</style>
  );

  if (registered) {
    return (
      <>
        <GlobalStyle />
        <div className="f-body relative min-h-screen flex items-center justify-center py-10 px-4 overflow-hidden">
          <div className="fixed inset-0 z-0" style={{ background: "linear-gradient(160deg,#1e0a4e,#2b0f63 45%,#1e0a4e)" }} />
          <div className="blob1 fixed z-[1] pointer-events-none rounded-full" style={{ top:"-100px", left:"-100px", width:"460px", height:"460px", background:"radial-gradient(circle,rgba(139,92,246,0.35) 0%,transparent 70%)" }} />
          <div className="blob2 fixed z-[1] pointer-events-none rounded-full" style={{ bottom:"-120px", right:"-100px", width:"420px", height:"420px", background:"radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)" }} />

          <div className="relative z-10 w-full max-w-[540px] rounded-[28px] overflow-hidden" style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(28px)", boxShadow:"0 30px 80px rgba(0,0,0,0.45)" }}>
            <div className="px-10 py-9">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p className="f-display text-lg font-semibold text-gray-900">Compte créé avec succès</p>
                  <p className="text-sm text-gray-500">Finalisez votre inscription en effectuant le paiement</p>
                </div>
              </div>

              <div className="rounded-2xl p-5 mb-5" style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
                <p className="text-violet-700 font-bold text-lg">Montant à régler : <span className="text-2xl">{totalAmount} TND/mois</span></p>
              </div>

              <div className="border border-violet-100 rounded-2xl p-5 mb-5">
                <p className="font-semibold text-gray-800 mb-3">📋 Instructions de virement bancaire</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Bénéficiaire</span><span className="font-semibold">Invoicia SAS</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">IBAN</span><span className="font-semibold font-mono">TN59 XXXX XXXX XXXX XXXX</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">BIC</span><span className="font-semibold">BIATTNTT</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Référence</span><span className="font-semibold text-violet-600">{form.company.toUpperCase()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-bold text-violet-600">{totalAmount} TND</span></div>
                </div>
              </div>

              {!paymentClaimed ? (
                <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-4 mb-5">
                  <p className="text-sm font-semibold text-emerald-800 mb-2">✅ Vous avez effectué votre virement ?</p>
                  <p className="text-xs text-emerald-700 mb-3">Cliquez ci-dessous pour notifier l'administrateur.</p>
                  <button onClick={handleClaimPayment} disabled={claimLoading} className="w-full text-white font-bold text-sm rounded-xl py-3 border-none cursor-pointer" style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
                    {claimLoading ? "Envoi en cours..." : "J'ai effectué mon virement"}
                  </button>
                </div>
              ) : (
                <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-4 mb-5 text-center">
                  <p className="font-semibold text-emerald-800">Déclaration envoyée !</p>
                  <p className="text-xs text-emerald-700 mt-1">Accès activé sous 24-48h.</p>
                </div>
              )}

              <button onClick={() => navigate("/login")} className="w-full border border-gray-300 rounded-xl py-3 text-sm font-semibold text-gray-700 bg-white cursor-pointer">
                Aller à la page de connexion
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <div className="f-body fixed inset-0 flex overflow-y-auto">

        {/* LEFT BRAND PANEL */}
        <div className="left-panel flex-col justify-between w-[42%] relative overflow-hidden p-12" style={{ background: "linear-gradient(160deg,#1e0a4e,#3b1590 45%,#1e3a8a)" }}>
          <div className="blob1 fixed z-[1] pointer-events-none rounded-full" style={{ top:"-120px", left:"-100px", width:"420px", height:"420px", background:"radial-gradient(circle,rgba(167,139,250,0.4) 0%,transparent 70%)" }} />
          <div className="blob3 fixed z-[1] pointer-events-none rounded-full" style={{ bottom:"5%", left:"10%", width:"360px", height:"260px", background:"radial-gradient(circle,rgba(96,165,250,0.3) 0%,transparent 70%)" }} />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center border border-white/25 bg-white/20">
              <span style={{ fontSize: "17px", fontWeight: 800 }} className="text-white">I</span>
            </div>
            <span className="text-white f-display font-semibold text-[19px] tracking-tight">Invoicia</span>
          </div>

          <div className="relative z-10">
            <p className="f-display text-white text-[30px] font-semibold leading-[1.25] mb-3">Your books,<br/>beautifully run.</p>
            <p className="text-white/60 text-sm mb-9 max-w-[300px]">Multi-tenant accounting built for Tunisian companies — invoicing, payroll, and reporting in one place.</p>

            <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.14)" }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/50 text-[11px] font-mono">INV-0248</span>
                <span className="text-white/70 text-[11px] font-medium">TechCorp SARL</span>
              </div>
              {[["Sales module","10"],["Accounting module","15"],["HR module","12"]].map(([l,p]) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-white/[0.08]">
                  <span className="text-white/70 text-[12.5px]">{l}</span>
                  <span className="text-white/90 text-[12.5px] font-medium">{p} DT</span>
                </div>
              ))}
              <div className="flex justify-between pt-3">
                <span className="text-white text-[13.5px] font-semibold">Total</span>
                <span className="text-[15px] font-bold" style={{ color: "#34d399" }}>37.00 DT</span>
              </div>
            </div>
          </div>

          <span className="relative z-10 text-white/30 text-xs">🇹🇳 Made for Tunisian businesses</span>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ background: "linear-gradient(180deg,#faf9ff,#f3f0ff)" }}>
          <form onSubmit={handleSubmit} className="w-full max-w-[480px] rounded-[28px] p-9" style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.04)" }}>

            <p className="f-display text-[24px] font-semibold mb-1 text-gray-900">Create your account</p>
            <p className="text-[13.5px] text-gray-500 mb-6">
              {step === 1 && "Tell us who you are"}
              {step === 2 && "Tell us about your company"}
              {step === 3 && "Choose your modules"}
            </p>

            <div className="flex items-center gap-2 mb-7">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const state = n < step ? "done" : n === step ? "active" : "upcoming";
                return (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{
                        background: state === "done" ? "linear-gradient(135deg,#34d399,#059669)" : state === "active" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "#e5e7eb",
                        color: state === "upcoming" ? "#9ca3af" : "#fff",
                      }}>{state === "done" ? "✓" : n}</span>
                      <span className="text-[12px] font-medium hidden sm:inline" style={{ color: state === "upcoming" ? "#9ca3af" : "#374151" }}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className="flex-1 h-[2px] rounded-full" style={{ background: n < step ? "linear-gradient(90deg,#34d399,#059669)" : "#e5e7eb" }} />}
                  </div>
                );
              })}
            </div>

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <Field label="Full name"><Inp placeholder="Jean Dupont" value={form.name} onChange={v => setForm({...form,name:v})} /></Field>
                <Field label="Email"><Inp type="email" placeholder="you@company.tn" value={form.email} onChange={v => setForm({...form,email:v})} /></Field>
                <Field label="Password" hint="At least 6 characters"><Inp type="password" placeholder="Min. 6 characters" value={form.password} onChange={v => setForm({...form,password:v})} /></Field>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <Field label="Company name"><Inp placeholder="Ma Societe SARL" value={form.company} onChange={v => setForm({...form,company:v})} /></Field>
                <Field label="Tax ID"><Inp placeholder="1234567/A/B/M/000" value={form.taxId} onChange={v => setForm({...form,taxId:v})} /></Field>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10.5px] font-bold uppercase tracking-[1.2px] text-violet-400">Available modules</span>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-full bg-violet-100 p-0.5">
                      <button type="button" onClick={() => setCurrency("EUR")} className={`cur-toggle text-[11px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer ${currency === "EUR" ? "bg-white text-violet-700 shadow-sm" : "bg-transparent text-violet-400"}`}>EUR</button>
                      <button type="button" onClick={() => setCurrency("TND")} className={`cur-toggle text-[11px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer ${currency === "TND" ? "bg-white text-violet-700 shadow-sm" : "bg-transparent text-violet-400"}`}>DT</button>
                    </div>
                    <span className="pill-shine bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13px] font-bold px-3.5 py-1 rounded-full">{symbol}{total}/mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {MODULES.map(m => {
                    const on = selected.has(m.id);
                    return (
                      <div key={m.id} onClick={() => toggle(m.id)} className={`mod-card ${on?"on":""} rounded-2xl p-3.5 cursor-pointer select-none border-[1.5px]`}
                        style={{ borderColor: on ? m.color : "rgba(124,58,237,0.12)", background: on ? `linear-gradient(160deg, ${m.color}18, ${m.color}08)` : "rgba(255,255,255,0.7)", boxShadow: on ? `0 10px 24px ${m.color}22` : "none" }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: on ? m.color : `${m.color}18` }}>
                            <ModuleIcon type={m.icon} color={on ? "#ffffff" : m.color} />
                          </div>
                          <div className="w-8 h-[18px] rounded-full flex items-center px-0.5 flex-shrink-0" style={{ background: on ? m.color : "#e5e7eb" }}>
                            <div className="w-[14px] h-[14px] rounded-full bg-white shadow-sm" style={{ transform: on ? "translateX(14px)" : "translateX(0)", transition:"transform 0.2s" }} />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                        <p className="text-xs font-bold mb-1" style={{ color: m.color }}>+{symbol}{conv(m.price)}/mo</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-violet-100 px-5 py-4" style={{ background:"linear-gradient(135deg,rgba(245,243,255,0.9),rgba(237,233,254,0.8))" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-gray-700">Monthly total</p>
                      <p className="text-[11px] text-violet-400">Base plan included</p>
                    </div>
                    <div><span className={`text-[28px] font-extrabold text-violet-700 tracking-tight ${bump ? "price-bump" : ""}`}>{symbol}{total}</span><span className="text-[13px] text-violet-400">/mo</span></div>
                  </div>
                  {selected.size > 0 && (
                    <div className="mt-3 pt-3 border-t border-violet-200/60 flex flex-col gap-1.5">
                      {MODULES.filter(m => selected.has(m.id)).map(m => (
                        <div key={m.id} className="breakdown-row flex items-center justify-between text-[12px]">
                          <span className="flex items-center gap-1.5 text-gray-600"><span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />{m.name}</span>
                          <span className="font-semibold" style={{ color: m.color }}>+{symbol}{conv(m.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && <button type="button" onClick={handleBack} className="flex-1 border border-gray-300 rounded-2xl text-sm font-semibold text-gray-700 bg-white cursor-pointer" style={{ height:"50px" }}>← Back</button>}
              {step < 3 && <button type="button" onClick={handleNext} className="submit-btn flex-1 text-white font-bold text-[15px] rounded-2xl border-none cursor-pointer" style={{ height:"50px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>Continue →</button>}
              {step === 3 && <button type="submit" disabled={isLoading} className="submit-btn flex-1 text-white font-bold text-[15px] rounded-2xl border-none cursor-pointer" style={{ height:"50px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>{isLoading ? "Création en cours..." : "Create account →"}</button>}
            </div>

            <p className="text-center text-[13px] text-gray-400 mt-4">Already have an account? <a href="/login" className="text-violet-600 font-semibold hover:underline">Sign in</a></p>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) {
  return (
    <div>
      <label className="flex gap-1 text-[13px] font-medium text-gray-700 mb-1.5">{label} <span className="text-violet-600">*</span></label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Inp({ type="text", placeholder, value, onChange }: { type?:string; placeholder?:string; value:string; onChange:(v:string)=>void }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      className="inp-f w-full h-[42px] px-3.5 border-[1.5px] border-gray-200 rounded-[11px] text-sm bg-white/85 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:bg-white" />
  );
}