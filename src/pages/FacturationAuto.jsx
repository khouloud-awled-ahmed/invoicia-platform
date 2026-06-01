import { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:3001/api';
const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';

export default function FacturationAuto() {
  const [lines, setLines] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(BASE_URL + '/facturation/pending').then(r => r.json()),
      fetch(BASE_URL + '/facturation/stats').then(r => r.json()),
    ]).then(([l, s]) => { setLines(l); setStats(s); }).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const selectedAmount = lines.filter(l => selected.has(l.id)).reduce((s, l) => s + l.amount, 0);
  const selectedHours  = lines.filter(l => selected.has(l.id)).reduce((s, l) => s + l.hours, 0);
  const pendingAmount  = lines.filter(l => !selected.has(l.id)).reduce((s, l) => s + l.amount, 0);

  const generate = async () => {
    setGenerating(true);
    const res = await fetch(BASE_URL + '/facturation/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ craLineIds: [...selected] }),
    });
    const data = await res.json();
    setSuccess(data.invoiceCount + ' facture(s) generee(s) !');
    const [l, s] = await Promise.all([
      fetch(BASE_URL + '/facturation/pending').then(r => r.json()),
      fetch(BASE_URL + '/facturation/stats').then(r => r.json()),
    ]);
    setLines(l); setStats(s); setSelected(new Set()); setGenerating(false);
  };

  if (loading) return <div style={s.loading}>Chargement...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Facturation Automatique</h1>
          <p style={s.sub}>Generation automatique de factures depuis les CRA valides</p>
        </div>
        <button style={{ ...s.btn, ...(selected.size === 0 ? s.btnOff : {}) }}
          disabled={selected.size === 0 || generating} onClick={generate}>
          {generating ? 'Generation...' : 'Generer Factures (' + selected.size + ')'}
        </button>
      </div>

      {success && <div style={s.alert}>{success} <span style={{cursor:'pointer'}} onClick={() => setSuccess('')}>x</span></div>}

      <div style={s.grid}>
        {[
          { label: 'A Facturer',   value: fmt(pendingAmount),  sub: lines.filter(l => !selected.has(l.id)).length + ' ligne(s) en attente', accent: false },
          { label: 'Selectionne',  value: fmt(selectedAmount), sub: selectedHours + 'h selectionnees', accent: true },
          { label: 'Deja Facture', value: fmt(stats?.alreadyInvoiced ?? 0), sub: 'Ce mois', accent: true },
          { label: 'Total Mois',   value: fmt(stats?.totalMonth ?? 0), sub: stats?.month ?? '', accent: false },
        ].map(c => (
          <div key={c.label} style={s.card}>
            <p style={s.cardLabel}>{c.label}</p>
            <p style={{ ...s.cardValue, ...(c.accent ? s.green : {}) }}>{c.value}</p>
            <p style={{ ...s.cardSub, ...(c.accent ? s.green : {}) }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Heures Facturables</h2>
        <p style={s.sectionSub}>{lines.length} ligne(s) de CRA validees</p>
        {lines.map(line => (
          <div key={line.id} style={s.row} onClick={() => toggle(line.id)}>
            <div style={{ ...s.cb, ...(selected.has(line.id) ? s.cbOn : {}) }}>
              {selected.has(line.id) && <span style={s.check}>✓</span>}
            </div>
            <div style={s.rowInfo}>
              <p style={s.rowName}>{line.projectName}</p>
              <p style={s.rowMeta}>{line.consultant} · {line.date}</p>
            </div>
            <div style={s.rowRight}>
              <p style={s.rowAmt}>{fmt(line.amount)}</p>
              <p style={s.rowMeta}>{line.hours}h x {fmt(line.rate)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page:       { maxWidth: 900, margin: '0 auto', padding: '28px 24px', fontFamily: 'sans-serif' },
  loading:    { textAlign: 'center', padding: 40, color: '#888' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:      { fontSize: 22, fontWeight: 600, margin: 0 },
  sub:        { fontSize: 13, color: '#888', marginTop: 4 },
  btn:        { background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  btnOff:     { background: '#AFA9EC', cursor: 'not-allowed' },
  alert:      { background: '#EAF3DE', color: '#3B6D11', border: '0.5px solid #97C459', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: 16, display: 'flex', justifyContent: 'space-between' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  card:       { background: '#f6f6f6', borderRadius: 8, padding: '14px 16px' },
  cardLabel:  { fontSize: 12, color: '#888', margin: '0 0 6px' },
  cardValue:  { fontSize: 22, fontWeight: 600, margin: 0 },
  cardSub:    { fontSize: 12, color: '#888', margin: '3px 0 0' },
  green:      { color: '#1D9E75' },
  section:    { border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '16px 20px' },
  sectionTitle: { fontSize: 15, fontWeight: 600, margin: '0 0 2px' },
  sectionSub: { fontSize: 12, color: '#888', margin: '0 0 12px' },
  row:        { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '0.5px solid #f0f0f0', cursor: 'pointer' },
  cb:         { width: 18, height: 18, border: '1.5px solid #ccc', borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' },
  cbOn:       { background: '#534AB7', borderColor: '#534AB7' },
  check:      { color: '#fff', fontSize: 11, fontWeight: 700 },
  rowInfo:    { flex: 1 },
  rowName:    { fontSize: 14, fontWeight: 500, margin: 0 },
  rowMeta:    { fontSize: 12, color: '#888', margin: '2px 0 0' },
  rowRight:   { textAlign: 'right' },
  rowAmt:     { fontSize: 14, fontWeight: 500, color: '#1D9E75', margin: 0 },
};