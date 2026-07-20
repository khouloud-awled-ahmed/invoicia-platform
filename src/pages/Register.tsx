import { useState } from "react";

const MODULES = [
  { id: "sales",      name: "Sales",      price: 10, desc: "Invoices, credits, sales management" },
  { id: "purchases",  name: "Purchases",  price: 5,  desc: "Expenses, suppliers, purchasing" },
  { id: "projects",   name: "Projects",   price: 8,  desc: "Project management and CRA" },
  { id: "hr",         name: "HR",         price: 12, desc: "Absences, payroll, HR management" },
  { id: "accounting", name: "Accounting", price: 15, desc: "Accounting entries, balance sheet" },
];

const BASE = 10;

export default function Register() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bump, setBump]         = useState(false);
  const [form, setForm]         = useState({ name:"", email:"", password:"", company:"", taxId:"" });

  const total = BASE + MODULES.filter(m => selected.has(m.id)).reduce((s, m) => s + m.price, 0);

  const toggle = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setBump(true); setTimeout(() => setBump(false), 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // await axios.post("/api/auth/register", { ...form, modules: [...selected] });
  };

  return (
    <>
      <style>{`
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-18px) scale(1.05)} 66%{transform:translate(-14px,22px) scale(0.97)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-22px,18px) scale(1.04)} 66%{transform:translate(18px,-14px) scale(0.98)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-18px,-16px) scale(1.06)} }
        @keyframes float  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-12px) scale(1.04)} }
        @keyframes shine  { 0%{left:-100%} 100%{left:200%} }
        @keyframes pop    { 0%{transform:scale(1)} 40%{transform:scale(1.3)} 70%{transform:scale(0.9)} 100%{transform:scale(1)} }
        @keyframes bump   { 0%{transform:scale(1)} 40%{transform:scale(1.15)} 100%{transform:scale(1)} }
        .blob1 { animation: drift1 8s ease-in-out infinite; }
        .blob2 { animation: drift2 10s ease-in-out infinite; }
        .blob3 { animation: drift3 12s ease-in-out infinite; }
        .blob4 { animation: drift1 9s ease-in-out infinite reverse; }
        .orb-a { animation: float 6s ease-in-out infinite; }
        .orb-b { animation: float 8s ease-in-out infinite reverse; }
        .pill-shine { position:relative; overflow:hidden; }
        .pill-shine::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent); animation: shine 2.5s infinite; }
        .mod-card { transition: all 0.22s; }
        .mod-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(124,58,237,0.1); }
        .mod-card.on { transform:translateY(-2px); box-shadow:0 0 0 3px rgba(124,58,237,0.12),0 6px 20px rgba(124,58,237,0.12); }
        .chk-pop.on { animation: pop 0.3s ease; }
        .price-bump { animation: bump 0.35s ease; }
        .inp-f { transition: all 0.2s; }
        .inp-f:focus { transform:translateY(-1px); }
        .submit-btn { position:relative; overflow:hidden; transition:all 0.2s; }
        .submit-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent); transition:left 0.5s; }
        .submit-btn:hover::before { left:100%; }
        .submit-btn:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(124,58,237,0.35); }
        .submit-btn:active { transform:scale(0.98); }
      `}</style>

      <div className="relative min-h-screen flex items-start justify-center py-10 px-4 overflow-hidden">
        <div className="fixed inset-0 z-0" style={{ background: "#1e0a4e" }} />
        <div className="fixed bottom-0 left-0 right-0 z-0" style={{ height: "50vh", background: "#f0edff" }} />
        <div className="fixed left-0 right-0 z-0" style={{ top: "35vh", height: "30vh", background: "linear-gradient(to bottom, #1e0a4e, #f0edff)" }} />

        <div className="blob1 fixed z-[2] pointer-events-none rounded-full" style={{ top:"-60px", left:"-60px", width:"380px", height:"380px", background:"radial-gradient(circle,rgba(139,92,246,0.5) 0%,transparent 70%)" }} />
        <div className="blob2 fixed z-[2] pointer-events-none rounded-full" style={{ top:"40px", right:"-80px", width:"320px", height:"320px", background:"radial-gradient(circle,rgba(99,102,241,0.4) 0%,transparent 70%)" }} />
        <div className="blob3 fixed z-[2] pointer-events-none rounded-full" style={{ bottom:"-40px", left:"25%", width:"460px", height:"260px", background:"radial-gradient(circle,rgba(196,181,253,0.45) 0%,transparent 70%)" }} />
        <div className="blob4 fixed z-[2] pointer-events-none rounded-full" style={{ top:"38%", right:"8%", width:"260px", height:"260px", background:"radial-gradient(circle,rgba(167,139,250,0.3) 0%,transparent 70%)" }} />

        <div className="fixed top-0 left-0 right-0 z-[3] pointer-events-none" style={{ height:"50vh", backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="fixed bottom-0 left-0 right-0 z-[3] pointer-events-none" style={{ height:"50vh", backgroundImage:"linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        <div className="relative z-10 w-full max-w-[600px] rounded-[28px] overflow-hidden" style={{ background:"rgba(255,255,255,0.78)", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.92)", boxShadow:"0 24px 64px rgba(15,5,50,0.25),0 4px 16px rgba(124,58,237,0.1),inset 0 1px 0 rgba(255,255,255,0.95)" }}>

          <div className="relative overflow-hidden px-10 py-9" style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5,#2563eb)" }}>
            <div className="orb-a absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/[0.07]" />
            <div className="orb-b absolute -bottom-10 left-10 w-36 h-36 rounded-full bg-white/[0.05]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center border border-white/25 bg-white/20">
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-white font-bold text-[19px] tracking-tight">Invocia</span>
              </div>
              <h1 className="text-white text-[25px] font-bold tracking-tight mb-1.5">Create your account</h1>
              <p className="text-white/70 text-sm">Choose your modules and get started in minutes</p>
              <div className="flex gap-1.5 mt-[18px]">
                {[0,1,2].map(i => (<div key={i} className={`h-[3px] flex-1 rounded-full ${i < 2 ? "bg-white" : "bg-white/25"}`} />))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-10 py-9">
            <SectionLabel>Personal info</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Full name"><Inp placeholder="Jean Dupont" value={form.name} onChange={v => setForm({...form,name:v})} /></Field>
              <Field label="Email"><Inp type="email" placeholder="you@company.fr" value={form.email} onChange={v => setForm({...form,email:v})} /></Field>
            </div>
            <div className="mb-6">
              <Field label="Password" hint="At least 6 characters"><Inp type="password" placeholder="Min. 6 characters" value={form.password} onChange={v => setForm({...form,password:v})} /></Field>
            </div>
            <SectionLabel>Company</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Field label="Company name"><Inp placeholder="Ma Societe SARL" value={form.company} onChange={v => setForm({...form,company:v})} /></Field>
              <Field label="Tax ID"><Inp placeholder="1234567/A/B/M/000" value={form.taxId} onChange={v => setForm({...form,taxId:v})} /></Field>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-bold uppercase tracking-[1.2px] text-violet-400">Available modules</span>
              <span className="pill-shine bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13px] font-bold px-3.5 py-1 rounded-full">€{total}/mo</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {MODULES.map(m => {
                const on = selected.has(m.id);
                return (
                  <div key={m.id} onClick={() => toggle(m.id)} className={`mod-card ${on?"on":""} border-[1.5px] rounded-[13px] p-3.5 cursor-pointer select-none ${on ? "border-violet-500 bg-violet-50/95" : "border-violet-100 bg-white/70 hover:border-violet-300 hover:bg-violet-50/90"}`}>
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                        <p className="text-xs font-bold text-violet-600">+€{m.price}/mo</p>
                      </div>
                      <div className={`chk-pop ${on?"on":""} w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${on ? "bg-violet-600 border-violet-600" : "bg-white border-gray-300"}`}>
                        {on && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="relative overflow-hidden mt-4 rounded-2xl border-[1.5px] border-violet-100 px-5 py-4 flex items-center justify-between" style={{ background:"linear-gradient(135deg,rgba(245,243,255,0.9),rgba(237,233,254,0.8))" }}>
              <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-violet-200/30 pointer-events-none" />
              <div>
                <p className="text-[13.5px] font-medium text-gray-700">Monthly total</p>
                <p className="text-[11.5px] text-violet-400 mt-0.5">Base plan included</p>
              </div>
              <div>
                <span className={`text-[30px] font-extrabold text-violet-700 tracking-tight ${bump ? "price-bump" : ""}`}>€{total}</span>
                <span className="text-[13px] text-violet-400">/mo</span>
              </div>
            </div>

            <button type="submit" className="submit-btn w-full mt-5 text-white font-bold text-[15px] rounded-2xl border-none cursor-pointer" style={{ height:"52px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              Create my account →
            </button>
            <p className="text-center text-[13px] text-gray-400 mt-3.5">
              Already have an account?{" "}<a href="/login" className="text-violet-600 font-semibold hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[1.2px] text-violet-400 mb-3.5 mt-6 first:mt-0">
      {children}
      <div className="flex-1 h-px bg-gradient-to-r from-violet-200 to-transparent" />
    </div>
  );
}

function Field({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) {
  return (
    <div>
      <label className="flex gap-1 text-[13px] font-medium text-gray-700 mb-1.5">
        {label} <span className="text-violet-600">*</span>
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Inp({ type="text", placeholder, value, onChange }: { type?:string; placeholder?:string; value:string; onChange:(v:string)=>void }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      className="inp-f w-full h-[42px] px-3.5 border-[1.5px] border-gray-200 rounded-[11px] text-sm bg-white/85 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(124,58,237,0.12)]" />
  );
}
