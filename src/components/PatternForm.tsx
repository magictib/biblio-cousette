'use client';

import { useState } from 'react';
import { Pattern, PatternFile } from '@/types';
import CatalogBrowser from './CatalogBrowser';

interface PatternFormProps {
  onSubmit:       (pattern: Omit<Pattern, 'id'>) => void;
  onCancel?:      () => void;
  initialValues?: Pattern;
}

const CLOTHING_TYPES = ['robe', 't-shirt', 'pull', 'blouse', 'pantalon', 'jupe', 'veste', 'manteau', 'combinaison', 'sweat', 'chemise', 'accessoire', 'sous-vêtement', 'pyjama', 'robe de chambre', 'maillot', 'autres'];

function loadClothingTypes(): string[] {
  try {
    const custom = JSON.parse(localStorage.getItem('custom_clothing_types') ?? '[]') as string[];
    const merged = [...CLOTHING_TYPES];
    for (const t of custom) if (!merged.includes(t)) merged.push(t);
    return merged;
  } catch { return CLOTHING_TYPES; }
}

function saveClothingType(type: string): void {
  if (CLOTHING_TYPES.includes(type)) return;
  try {
    const custom = JSON.parse(localStorage.getItem('custom_clothing_types') ?? '[]') as string[];
    if (!custom.includes(type)) {
      localStorage.setItem('custom_clothing_types', JSON.stringify([...custom, type]));
    }
  } catch { /* ignore */ }
}

export default function PatternForm({ onSubmit, onCancel, initialValues }: PatternFormProps) {
  const iv = initialValues;
  const isEdit = !!iv;

  const [name,            setName]            = useState(iv?.name         ?? '');
  const [designer,        setDesigner]        = useState(iv?.designer     ?? '');
  const [clothingType,    setClothingType]    = useState(iv?.clothingType ?? 'robe');
  const [clothingTypes,   setClothingTypes]   = useState<string[]>(loadClothingTypes);
  const [difficulty,      setDifficulty]      = useState<Pattern['difficulty']>(iv?.difficulty ?? 'moyen');
  const [width,           setWidth]           = useState(iv?.width  ? String(Math.round(iv.width))  : '60');
  const [height,          setHeight]          = useState(iv?.height ? String(Math.round(iv.height)) : '80');
  const [notes,           setNotes]           = useState(iv?.notes        ?? '');
  const [unit,            setUnit]            = useState<'cm' | 'inch'>('cm');
  const [showCatalog,     setShowCatalog]     = useState(false);
  const [pdfFiles,        setPdfFiles]        = useState<PatternFile[]>(iv?.pdfFiles ?? []);
  const [primaryPdfIndex, setPrimaryPdfIndex] = useState(iv?.primaryPdfIndex ?? 0);

  const handleCatalogSelect = (pattern: Omit<Pattern, 'id'>) => {
    setName(pattern.name);
    setDesigner(pattern.designer ?? '');
    setClothingType(pattern.clothingType);
    setDifficulty(pattern.difficulty);
    setWidth(String(Math.round(pattern.width)));
    setHeight(String(Math.round(pattern.height)));
    setNotes(pattern.notes ?? '');
    setUnit('cm');
    setShowCatalog(false);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        const baseName = file.name.replace(/\.[^.]+$/, '');
        setPdfFiles(prev => [...prev, { name: baseName, dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePdfFile = (i: number) => {
    setPdfFiles(prev => prev.filter((_, j) => j !== i));
    setPrimaryPdfIndex(prev => {
      if (i < prev) return prev - 1;
      if (i === prev) return 0;
      return prev;
    });
  };

  const renamePdfFile = (i: number, newName: string) => {
    setPdfFiles(prev => prev.map((f, j) => j === i ? { ...f, name: newName } : f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clothingType.trim()) {
      saveClothingType(clothingType.trim());
      setClothingTypes(loadClothingTypes);
    }
    const factor = unit === 'inch' ? 2.54 : 1;
    onSubmit({
      name,
      designer:        designer || undefined,
      clothingType,
      difficulty,
      width:           (parseFloat(width)  || 60) * factor,
      height:          (parseFloat(height) || 80) * factor,
      notes:           notes || undefined,
      pdfFiles:        pdfFiles.length > 0 ? pdfFiles : undefined,
      primaryPdfIndex: pdfFiles.length > 0 ? Math.min(primaryPdfIndex, pdfFiles.length - 1) : 0,
    });
  };

  const difficultyOptions: { value: Pattern['difficulty']; label: string; color: string }[] = [
    { value: 'facile',    label: 'Facile',    color: 'var(--sage)' },
    { value: 'moyen',     label: 'Moyen',     color: 'var(--gold)' },
    { value: 'difficile', label: 'Difficile', color: '#A04040' },
  ];

  return (
    <>
      {showCatalog && (
        <CatalogBrowser
          onSelect={handleCatalogSelect}
          onAddPattern={(p) => { onSubmit(p); setShowCatalog(false); }}
          onClose={() => setShowCatalog(false)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
            {isEdit ? `Modifier "${iv.name}"` : 'Ajouter un patron'}
          </h4>
          {!isEdit && (
            <button type="button" onClick={() => setShowCatalog(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)', backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 'bold' }}>
              📚 Parcourir le catalogue
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label className="field-label">Nom du patron *</label>
            <input className="field-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Robe Lilas" />
          </div>

          <div>
            <label className="field-label">Créatrice / Marque</label>
            <input className="field-input" value={designer} onChange={e => setDesigner(e.target.value)} placeholder="Ex : Deer &amp; Doe" />
          </div>

          <div>
            <label className="field-label">Type de vêtement</label>
            <input className="field-input" list="clothing-types-list" value={clothingType} onChange={e => setClothingType(e.target.value)} placeholder="Ex : robe, blouse, pantalon…" />
            <datalist id="clothing-types-list">
              {clothingTypes.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div>
            <label className="field-label">Difficulté</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {difficultyOptions.map(d => (
                <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', border: `1.5px solid ${difficulty === d.value ? d.color : 'var(--mauve-pale)'}`, backgroundColor: difficulty === d.value ? d.color : 'transparent', color: difficulty === d.value ? 'white' : 'var(--brun-mid)', fontFamily: 'Georgia, serif', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Dimensions du patron (boîte englobante)</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {(['cm', 'inch'] as const).map(u => (
                <button key={u} type="button" onClick={() => setUnit(u)}
                  style={{ padding: '4px 14px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif', backgroundColor: unit === u ? 'var(--mauve)' : 'var(--mauve-pale)', color: unit === u ? 'var(--creme)' : 'var(--brun-mid)' }}>
                  {u === 'cm' ? 'cm' : 'pouces'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Largeur ({unit})</label>
                <input className="field-input" type="number" min="1" step="1" required value={width} onChange={e => setWidth(e.target.value)} placeholder="60" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Hauteur ({unit})</label>
                <input className="field-input" type="number" min="1" step="1" required value={height} onChange={e => setHeight(e.target.value)} placeholder="80" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="field-label">Notes</label>
          <textarea className="field-input" value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} style={{ resize: 'vertical' }} placeholder="Tailles disponibles, remarques, description…" />
        </div>

        {/* ── Fichiers PDF ───────────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <label className="field-label">Fichiers PDF</label>

          {pdfFiles.length > 0 && (
            <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {pdfFiles.map((file, i) => {
                const isPrimary = primaryPdfIndex === i;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px', borderRadius: '6px',
                    border: `1.5px solid ${isPrimary ? '#A07828' : 'var(--mauve-pale)'}`,
                    backgroundColor: isPrimary ? 'rgba(160,120,40,.07)' : 'transparent',
                  }}>
                    <button type="button" onClick={() => setPrimaryPdfIndex(i)}
                      title={isPrimary ? 'Fichier par défaut' : 'Définir comme fichier par défaut'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: isPrimary ? '#A07828' : 'var(--mauve-pale)', padding: '0', lineHeight: 1, flexShrink: 0 }}>
                      {isPrimary ? '★' : '☆'}
                    </button>
                    <input
                      value={file.name}
                      onChange={e => renamePdfFile(i, e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: 'var(--brun)', outline: 'none', minWidth: 0 }}
                      placeholder="Nom du fichier"
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--brun-mid)', fontStyle: 'italic', flexShrink: 0 }}>
                      {file.dataUrl.startsWith('data:application/pdf') ? 'PDF' : 'Image'}
                    </span>
                    <button type="button" onClick={() => removePdfFile(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#943030', fontSize: '0.9rem', padding: '0 2px', flexShrink: 0, lineHeight: 1 }}>
                      ✕
                    </button>
                  </div>
                );
              })}
              <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--brun-mid)', fontStyle: 'italic' }}>
                Cliquez sur ☆ pour choisir le fichier affiché par défaut dans la collection.
              </p>
            </div>
          )}

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)', backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 'bold' }}>
            📄 {pdfFiles.length === 0 ? 'Ajouter un fichier PDF' : 'Ajouter un autre fichier'}
            <input type="file" accept=".pdf,image/*" multiple onChange={handlePdfUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-sage" style={{ flex: 1, justifyContent: 'center' }}>
            {isEdit ? '✓ Enregistrer les modifications' : '＋ Ajouter le patron'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              style={{ padding: '9px 18px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)', backgroundColor: 'transparent', color: 'var(--brun-mid)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.88rem' }}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </>
  );
}
