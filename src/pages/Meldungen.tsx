import { useMemo, useState } from 'react';

type Rolle = 'Admin' | 'Service' | 'Verwalter' | 'Bewohner';

interface Meldung {
  id: string;
  text: string;
  createdAt: number;
  createdBy?: string;
}

export default function Meldungen() {
  // Rolle wird, wenn vorhanden, aus localStorage oder aus Query gelesen (Fallback: 'Bewohner')
  const initialRolle = (typeof window !== 'undefined' && (localStorage.getItem('rolle') || new URLSearchParams(window.location.search).get('rolle'))) as Rolle || 'Bewohner';
  const [rolle, setRolle] = useState<Rolle>(initialRolle);
  const [list, setList] = useState<Meldung[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('meldungen') || '[]'); } catch { return []; }
  });
  const [text, setText] = useState('');

  const canCreate = useMemo(() => ['Verwalter', 'Bewohner'].includes(rolle), [rolle]);
  const canModerate = useMemo(() => ['Admin', 'Service'].includes(rolle), [rolle]);

  const add = () => {
    if (!text.trim()) return;
    const m: Meldung = { id: String(Date.now()), text: text.trim(), createdAt: Date.now(), createdBy: rolle };
    const next = [m, ...list];
    setList(next);
    if (typeof window !== 'undefined') localStorage.setItem('meldungen', JSON.stringify(next));
    setText('');
  };

  const remove = (id: string) => {
    const next = list.filter(m => m.id !== id);
    setList(next);
    if (typeof window !== 'undefined') localStorage.setItem('meldungen', JSON.stringify(next));
  };

  const update = (id: string, newText: string) => {
    const next = list.map(m => m.id === id ? { ...m, text: newText } : m);
    setList(next);
    if (typeof window !== 'undefined') localStorage.setItem('meldungen', JSON.stringify(next));
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Meldungen</h1>
      <p style={{ marginBottom: 12 }}>Rolle:&nbsp;
        <select value={rolle} onChange={(e)=>{ setRolle(e.target.value as Rolle); if (typeof window !== 'undefined') localStorage.setItem('rolle', e.target.value); }}>
          <option>Bewohner</option>
          <option>Verwalter</option>
          <option>Service</option>
          <option>Admin</option>
        </select>
      </p>

      {canCreate && (
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Neue Meldung eingeben…"
            style={{ width: '100%', minHeight: 80, padding: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={add}>Meldung hinzufügen</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {list.map(m => (
          <div key={m.id} style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{new Date(m.createdAt).toLocaleString()}</div>
              <div>{m.text}</div>
              <div style={{ fontSize: 12, color: '#777' }}>von: {m.createdBy || '—'}</div>
            </div>
            {canModerate && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => update(m.id, prompt('Neuer Text:', m.text) || m.text)}>Bearbeiten</button>
                <button onClick={() => remove(m.id)}>Löschen</button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <div style={{ opacity: 0.7 }}>Keine Meldungen vorhanden.</div>}
      </div>
    </div>
  );
}
