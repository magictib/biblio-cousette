'use client';

import { useState } from 'react';
import { Pattern } from '@/types';

interface PatternFormProps {
  onSubmit: (pattern: Omit<Pattern, 'id'>) => void;
}

const CLOTHING_TYPES = ['robe', 't-shirt', 'pantalon', 'jupe', 'veste', 'manteau', 'sous-vêtement', 'accessoire', 'autres'];

export default function PatternForm({ onSubmit }: PatternFormProps) {
  const [name,         setName]         = useState('');
  const [designer,     setDesigner]     = useState('');
  const [clothingType, setClothingType] = useState('robe');
  const [difficulty,   setDifficulty]   = useState<Pattern['difficulty']>('moyen');
  const [width,        setWidth]        = useState('60');
  const [height,       setHeight]       = useState('80');
  const [notes,        setNotes]        = useState('');
  const [unit,         setUnit]         = useState<'cm' | 'inch'>('cm');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const factor = unit === 'inch' ? 2.54 : 1;
    onSubmit({
      name,
      designer:  designer  || undefined,
      clothingType,
      difficulty,
      width:  (parseFloat(width)  || 60) * factor,
      height: (parseFloat(height) || 80) * factor,
      notes: notes || undefined,
    });
    setName(''); setDesigner(''); setClothingType('robe'); setDifficulty('moyen');
    setWidth('60'); setHeight('80'); setNotes('');
  };

  const difficultyOptions: { value: Pattern['difficulty']; label: string; color: string }[] = [
    { value: 'facile',    label: 'Facile',    color: 'var(--sage)' },
    { value: 'moyen',     label: 'Moyen',     color: 'var(--gold)' },
    { value: 'difficile', label: 'Difficile', color: '#A04040' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <h4 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px' }}>
        Ajouter un patron
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Nom */}
        <div>
          <label className="field-label">Nom du patron *</label>
          <input className="field-input" required value={name}
            onChange={e => setName(e.target.value)} placeholder="Ex : Robe d'été Margot" />
        </div>

        {/* Créatrice — champ dédié */}
        <div>
          <label className="field-label">Créatrice / Marque</label>
          <input className="field-input" value={designer}
            onChange={e => setDesigner(e.target.value)}
            placeholder="Ex : Deer &amp; Doe, Camimade…" />
        </div>

        {/* Type */}
        <div>
          <label className="field-label">Type de vêtement</label>
          <select className="field-input" value={clothingType} onChange={e => setClothingType(e.target.value)}>
            {CLOTHING_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Difficulté */}
        <div>
          <label className="field-label">Difficulté</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {difficultyOptions.map(d => (
              <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: '6px',
                  border: `1.5px solid ${difficulty === d.value ? d.color : 'var(--mauve-pale)'}`,
                  backgroundColor: difficulty === d.value ? d.color : 'transparent',
                  color: difficulty === d.value ? 'white' : 'var(--brun-mid)',
                  fontFamily: 'Georgia, serif', fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="col-span-2" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Dimensions du patron</label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {(['cm', 'inch'] as const).map(u => (
              <button key={u} type="button" onClick={() => setUnit(u)}
                style={{
                  padding: '4px 14px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif',
                  backgroundColor: unit === u ? 'var(--mauve)' : 'var(--mauve-pale)',
                  color: unit === u ? 'var(--creme)' : 'var(--brun-mid)',
                }}>
                {u === 'cm' ? 'cm' : 'pouces'}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Largeur ({unit})</label>
              <input className="field-input" type="number" min="1" step="1" required
                value={width} onChange={e => setWidth(e.target.value)} placeholder="60" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Hauteur ({unit})</label>
              <input className="field-input" type="number" min="1" step="1" required
                value={height} onChange={e => setHeight(e.target.value)} placeholder="80" />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '20px' }}>
        <label className="field-label">Notes</label>
        <textarea className="field-input" value={notes} onChange={e => setNotes(e.target.value)}
          rows={3} style={{ resize: 'vertical' }}
          placeholder="Tailles disponibles, remarques…" />
      </div>

      <button type="submit" className="btn-sage" style={{ width: '100%', justifyContent: 'center' }}>
        ＋ Ajouter le patron
      </button>
    </form>
  );
}
