'use client';

import { useState } from 'react';
import { Fabric } from '@/types';

interface Props {
  onAdd: (fabric: Omit<Fabric, 'id'>) => void;
}

const LAIZES = ['90', '110', '115', '140', '145', '150', '160'];

const MT_TYPES = [
  'coton imprimé', 'coton uni', 'lin', 'lin mélangé', 'jersey coton', 'jersey viscose',
  'viscose', 'crêpe', 'mousseline', 'voile', 'satin', 'doublure', 'dentelle',
  'velours', 'lainage', 'polaire', 'simili cuir', 'enduit', 'toile', 'autres',
];

// Couleurs prédéfinies fréquentes chez Mondial Tissus
const QUICK_COLORS: { name: string; hex: string }[] = [
  { name: 'Blanc',        hex: '#F5F5F0' },
  { name: 'Écru',         hex: '#F0EAD6' },
  { name: 'Beige',        hex: '#C8B89A' },
  { name: 'Camel',        hex: '#C19A6B' },
  { name: 'Marron',       hex: '#7B4F2E' },
  { name: 'Noir',         hex: '#1C1C1C' },
  { name: 'Gris clair',   hex: '#C0BDB8' },
  { name: 'Gris anthracite', hex: '#555450' },
  { name: 'Marine',       hex: '#1B2A4A' },
  { name: 'Bleu ciel',    hex: '#89C4E1' },
  { name: 'Bleu canard',  hex: '#2E8B8B' },
  { name: 'Vert kaki',    hex: '#7B8B5E' },
  { name: 'Vert sauge',   hex: '#8FAF8F' },
  { name: 'Bordeaux',     hex: '#6E1423' },
  { name: 'Rouge',        hex: '#CC2222' },
  { name: 'Rose poudré',  hex: '#E8B4B8' },
  { name: 'Rose vif',     hex: '#E8637A' },
  { name: 'Moutarde',     hex: '#C9A84C' },
  { name: 'Terracotta',   hex: '#C46A45' },
  { name: 'Lilas',        hex: '#B8A0C8' },
];

export default function MondialTissusHelper({ onAdd }: Props) {
  const [open,        setOpen]        = useState(false);
  const [search,      setSearch]      = useState('');

  // Champs du tissu
  const [name,        setName]        = useState('');
  const [composition, setComposition] = useState('');
  const [type,        setType]        = useState('');
  const [colorName,   setColorName]   = useState('');
  const [color,       setColor]       = useState('#C4889A');
  const [laize,       setLaize]       = useState('140');
  const [meters,      setMeters]      = useState('');
  const [price,       setPrice]       = useState('');

  const [added, setAdded] = useState('');

  const openSearch = () => {
    const base = 'https://www.mondialtissus.fr/tissus.html';
    const url = search.trim() ? `${base}?q=${encodeURIComponent(search.trim())}` : base;
    window.open(url, '_blank', 'noopener');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !meters) return;

    const notesParts: string[] = [];
    if (composition) notesParts.push(`Composition : ${composition}`);
    if (price)       notesParts.push(`${price} €/m`);
    notesParts.push('Source : Mondial Tissus');

    onAdd({
      name:    name.trim(),
      color,
      type:    type || 'coton',
      width:   parseFloat(laize) || 140,
      length:  parseFloat(meters) || 0,
      pattern: undefined,
      notes:   notesParts.join(' · '),
      photos:  [],
      isScrap: false,
      estimatedArea: undefined,
    });

    setAdded(name.trim());
    setName(''); setComposition(''); setType(''); setColorName('');
    setColor('#C4889A'); setLaize('140'); setMeters(''); setPrice('');
    setTimeout(() => setAdded(''), 3000);
  };

  return (
    <div style={{ marginBottom: '20px' }}>

      {/* Bouton toggle */}
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setAdded(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 16px', borderRadius: '8px', cursor: 'pointer',
          border: `1.5px solid ${open ? 'var(--mauve)' : 'var(--mauve-light)'}`,
          backgroundColor: open ? 'var(--mauve-pale)' : 'var(--creme)',
          color: open ? 'var(--mauve)' : 'var(--brun-mid)',
          fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: open ? 'bold' : 'normal',
          transition: 'all 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Trouver un tissu sur Mondial Tissus
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          marginTop: '8px', padding: '20px',
          backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)',
          borderRadius: '8px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.4 }} />

          {/* ── Étape 1 : Recherche ─────────────────────────────── */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontWeight: 'bold', margin: '0 0 8px' }}>
              1 — Rechercher sur le site
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="field-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ex : lin imprimé fleuri, jersey coton..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), openSearch())}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={openSearch}
                style={{
                  padding: '8px 14px', borderRadius: '7px', cursor: 'pointer',
                  border: '1.5px solid var(--mauve)', backgroundColor: 'var(--mauve)',
                  color: 'var(--creme)', fontFamily: 'Georgia, serif', fontSize: '0.82rem',
                  fontWeight: 'bold', whiteSpace: 'nowrap',
                }}
              >
                Ouvrir ↗
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', fontStyle: 'italic', margin: '5px 0 0' }}>
              Le site s&apos;ouvre dans un nouvel onglet. Revenez ici pour remplir les détails du tissu trouvé.
            </p>
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: '1px dashed var(--mauve-pale)', marginBottom: '16px', position: 'relative', zIndex: 1 }} />

          {/* ── Étape 2 : Saisie du tissu trouvé ───────────────── */}
          <form onSubmit={handleAdd} style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontWeight: 'bold', margin: '0 0 14px' }}>
              2 — Renseigner le tissu trouvé
            </p>

            {added && (
              <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '6px', padding: '7px 12px', marginBottom: '12px', fontSize: '0.82rem', color: '#2E7A46' }}>
                ✅ «{added}» ajouté à votre collection !
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Nom du tissu *</label>
                <input className="field-input" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex : Tissu lin enduit naturel" required />
              </div>

              <div>
                <label className="field-label">Type</label>
                <input className="field-input" list="mt-types-list" value={type}
                  onChange={e => setType(e.target.value)} placeholder="jersey, lin, coton…" />
                <datalist id="mt-types-list">
                  {MT_TYPES.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>

              <div>
                <label className="field-label">Composition</label>
                <input className="field-input" value={composition} onChange={e => setComposition(e.target.value)}
                  placeholder="Ex : 100% coton, 55% lin 45% coton…" />
              </div>

              <div>
                <label className="field-label">Laize</label>
                <select className="field-input" value={laize} onChange={e => setLaize(e.target.value)}>
                  {LAIZES.map(l => <option key={l} value={l}>{l} cm</option>)}
                </select>
              </div>

              <div>
                <label className="field-label">Métrage acheté (m) *</label>
                <input className="field-input" type="number" min="0.1" step="0.1"
                  value={meters} onChange={e => setMeters(e.target.value)} placeholder="2.5" required />
              </div>

              <div>
                <label className="field-label">Prix au mètre (€)</label>
                <input className="field-input" type="number" min="0" step="0.01"
                  value={price} onChange={e => setPrice(e.target.value)} placeholder="12.90" />
              </div>
            </div>

            {/* Couleur */}
            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Coloris</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  style={{ width: '38px', height: '34px', border: '1.5px solid var(--mauve-pale)', borderRadius: '5px', padding: '2px', cursor: 'pointer' }} />
                <input className="field-input" value={colorName} onChange={e => setColorName(e.target.value)}
                  placeholder="Nom de la couleur (ex : marine, écru…)" style={{ flex: 1, fontSize: '0.85rem' }} />
              </div>
              {/* Palette rapide */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {QUICK_COLORS.map(c => (
                  <button
                    key={c.hex} type="button"
                    title={c.name}
                    onClick={() => { setColor(c.hex); setColorName(c.name); }}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${color === c.hex ? 'var(--brun)' : 'transparent'}`,
                      backgroundColor: c.hex, cursor: 'pointer', flexShrink: 0,
                      boxShadow: color === c.hex ? '0 0 0 1px var(--brun)' : '0 1px 3px rgba(0,0,0,.15)',
                      transition: 'transform 0.1s',
                    }}
                  />
                ))}
              </div>
              {colorName && (
                <p style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', fontStyle: 'italic', margin: '4px 0 0' }}>
                  Couleur sélectionnée : {colorName}
                </p>
              )}
            </div>

            <button type="submit" className="btn-sage" style={{ justifyContent: 'center', width: '100%' }}>
              ＋ Ajouter à ma collection
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
