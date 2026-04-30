'use client';

import { useState, useMemo, useRef } from 'react';
import catalog, { CatalogEntry } from '@/data/patternCatalog';
import { Pattern } from '@/types';

interface CatalogBrowserProps {
  onSelect: (pattern: Omit<Pattern, 'id'>, fabricMeters?: number) => void;
  onAddPattern?: (pattern: Omit<Pattern, 'id'>) => void;
  onClose: () => void;
}

const TYPES = ['tous', 'blouse', 't-shirt', 'pull', 'robe', 'jupe', 'pantalon', 'veste', 'manteau', 'combinaison', 'sweat', 'chemise', 'accessoire'];
const DIFFICULTIES = ['toutes', 'facile', 'moyen', 'difficile'] as const;

type PdfStatus = 'idle' | 'loading' | 'done' | 'error';

export default function CatalogBrowser({ onSelect, onAddPattern, onClose }: CatalogBrowserProps) {
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [diffFilter, setDiffFilter] = useState<'toutes' | 'facile' | 'moyen' | 'difficile'>('toutes');
  const [selected,   setSelected]   = useState<CatalogEntry | null>(null);
  const [chosenSize, setChosenSize] = useState('');

  const [pdfStatus,  setPdfStatus]  = useState<PdfStatus>('idle');
  const [pdfError,   setPdfError]   = useState('');
  const [pdfSaved,   setPdfSaved]   = useState('');
  const pdfRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => catalog.filter(p => {
    const q = search.toLowerCase();
    const matchText = !q || p.name.toLowerCase().includes(q) || p.designer.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchType = typeFilter === 'tous' || p.clothingType === typeFilter;
    const matchDiff = diffFilter === 'toutes' || p.difficulty === diffFilter;
    return matchText && matchType && matchDiff;
  }), [search, typeFilter, diffFilter]);

  const diffColor: Record<string, { bg: string; color: string }> = {
    facile:    { bg: '#E8F5EC', color: '#2E7A46' },
    moyen:     { bg: '#FAF3E0', color: '#8A6A10' },
    difficile: { bg: '#FAE8E8', color: '#943030' },
  };

  const handleImport = () => {
    if (!selected) return;
    const size = chosenSize || selected.sizes[0];
    const req  = selected.fabricReqs.find(r => r.size === size) ?? selected.fabricReqs[0];

    onSelect({
      name:         selected.name,
      designer:     selected.designer,
      clothingType: selected.clothingType,
      difficulty:   selected.difficulty,
      width:        req ? req.widthCm : 140,
      height:       100,
      notes:        selected.description,
    }, req?.meters);
  };

  const handlePdfImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 8;
    if (file.size > MAX_MB * 1024 * 1024) {
      setPdfStatus('error');
      setPdfError(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum ${MAX_MB} Mo.`);
      e.target.value = '';
      return;
    }

    setPdfStatus('loading');
    setPdfError('');
    setPdfSaved('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target!.result as string;
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
      const pattern: Omit<Pattern, 'id'> = {
        name:         nameWithoutExt,
        designer:     undefined,
        clothingType: 'autres',
        difficulty:   'moyen',
        width:        0,
        height:       0,
        pdfDataUrl:   dataUrl,
      };
      if (onAddPattern) {
        onAddPattern(pattern);
        setPdfStatus('done');
        setPdfSaved(nameWithoutExt);
      } else {
        onSelect(pattern);
        setPdfStatus('done');
      }
    };
    reader.onerror = () => {
      setPdfStatus('error');
      setPdfError('Impossible de lire le fichier.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(61,36,24,.45)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{
        backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)',
        borderRadius: '12px', width: '100%', maxWidth: '860px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(61,36,24,.25)', position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: '6px', border: '1.5px dashed var(--mauve-pale)', borderRadius: '8px', pointerEvents: 'none', opacity: 0.35, zIndex: 0 }}/>

        {/* En-tête */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid var(--mauve-pale)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: 'var(--mauve)', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
              📚 Catalogue de patrons
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Bouton import PDF */}
              <div style={{ position: 'relative' }}>
                <input ref={pdfRef} type="file" accept="image/*,application/pdf"
                  onChange={handlePdfImport} style={{ display: 'none' }} />
                <button
                  type="button"
                  onClick={() => { setPdfStatus('idle'); setPdfError(''); setPdfSaved(''); pdfRef.current?.click(); }}
                  disabled={pdfStatus === 'loading'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 13px', borderRadius: '7px',
                    border: '1.5px solid var(--mauve-light)',
                    backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)',
                    cursor: pdfStatus === 'loading' ? 'not-allowed' : 'pointer',
                    fontFamily: 'Georgia, serif', fontSize: '0.8rem', fontWeight: 'bold',
                    opacity: pdfStatus === 'loading' ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                  }}>
                  {pdfStatus === 'loading' ? '⏳ Lecture…' : '📎 Ajouter un patron (PDF / image)'}
                </button>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--brun-mid)', lineHeight: 1 }}>✕</button>
            </div>
          </div>

          {/* Feedback PDF */}
          {pdfStatus === 'error' && (
            <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#943030' }}>
              ⚠️ {pdfError}
            </div>
          )}
          {pdfStatus === 'done' && pdfSaved && (
            <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#2E7A46' }}>
              ✅ «{pdfSaved}» ajouté à votre collection de patrons.
            </div>
          )}

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              className="field-input"
              type="text"
              placeholder="Rechercher (nom, marque…)"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: '1 1 180px' }}
            />
            <select className="field-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
              {TYPES.map(t => <option key={t} value={t}>{t === 'tous' ? 'Tous types' : t}</option>)}
            </select>
            <select className="field-input" value={diffFilter} onChange={e => setDiffFilter(e.target.value as typeof diffFilter)} style={{ flex: '0 0 auto' }}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'toutes' ? 'Toutes difficultés' : d}</option>)}
            </select>
          </div>
        </div>

        {/* Corps : liste + détail */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

          {/* Liste */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {results.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--brun-mid)', fontStyle: 'italic', padding: '32px' }}>
                Aucun patron ne correspond à ces critères.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.map(entry => {
                  const dc = diffColor[entry.difficulty];
                  const isSelected = selected?.id === entry.id;
                  return (
                    <button key={entry.id} onClick={() => { setSelected(entry); setChosenSize(entry.sizes[Math.floor(entry.sizes.length / 2)]); }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                        border: `1.5px solid ${isSelected ? 'var(--mauve)' : 'var(--mauve-pale)'}`,
                        backgroundColor: isSelected ? 'var(--mauve-pale)' : 'white',
                        borderRadius: '8px', transition: 'all 0.15s',
                      }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.95rem' }}>{entry.name}</span>
                          <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--mauve)' }}>{entry.designer}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', textTransform: 'capitalize' }}>{entry.clothingType}</span>
                          <span style={{ ...dc, fontSize: '0.68rem', padding: '1px 7px', borderRadius: '8px', fontWeight: 'bold' }}>
                            {entry.difficulty}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--brun-mid)' }}>
                            T.{entry.sizes[0]}–{entry.sizes[entry.sizes.length - 1]}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Détail */}
          {selected && (
            <div style={{
              width: '280px', flexShrink: 0, borderLeft: '1.5px solid var(--mauve-pale)',
              padding: '20px', overflowY: 'auto', backgroundColor: 'var(--linen)',
            }}>
              <h4 style={{ fontFamily: 'Georgia, serif', color: 'var(--mauve)', fontWeight: 'bold', fontSize: '1.05rem', margin: '0 0 4px' }}>
                {selected.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--mauve)', fontStyle: 'italic', margin: '0 0 12px' }}>
                {selected.designer}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--brun)', lineHeight: 1.5, margin: '0 0 16px' }}>
                {selected.description}
              </p>

              {selected.piecesCount && (
                <p style={{ fontSize: '0.8rem', color: 'var(--brun-mid)', margin: '0 0 16px' }}>
                  {selected.piecesCount} pièce{selected.piecesCount > 1 ? 's' : ''} dans ce patron
                </p>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Taille</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                  {selected.sizes.map(s => (
                    <button key={s} type="button" onClick={() => setChosenSize(s)}
                      style={{
                        padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem',
                        border: `1.5px solid ${chosenSize === s ? 'var(--mauve)' : 'var(--mauve-pale)'}`,
                        backgroundColor: chosenSize === s ? 'var(--mauve)' : 'white',
                        color: chosenSize === s ? 'var(--creme)' : 'var(--brun-mid)',
                        fontFamily: 'Georgia, serif',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {chosenSize && (() => {
                const req = selected.fabricReqs.find(r => r.size === chosenSize);
                if (!req) return null;
                return (
                  <div style={{ backgroundColor: 'var(--creme)', border: '1px solid var(--mauve-pale)', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', fontSize: '0.82rem' }}>
                    <p style={{ margin: 0, color: 'var(--brun-mid)' }}>Métrage recommandé (taille {chosenSize}) :</p>
                    <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'var(--sage)', fontSize: '1rem', fontFamily: 'Georgia, serif' }}>
                      {req.meters} m <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--brun-mid)' }}>pour tissu {req.widthCm} cm</span>
                    </p>
                  </div>
                );
              })()}

              <button onClick={handleImport} className="btn-sage" style={{ width: '100%', justifyContent: 'center' }}>
                ＋ Importer ce patron
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
