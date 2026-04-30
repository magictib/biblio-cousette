'use client';

import { useState, useEffect, useRef } from 'react';
import { Fabric } from '@/types';
import { loadFabrics } from '@/utils/migrate';
import LayPlanCanvas, { PatternPiece } from './LayPlanCanvas';

const EMPTY_PIECE = (): PatternPiece => ({
  name: '', widthCm: 0, heightCm: 0, quantity: 1, onFold: false, areaCm2: undefined, shape: undefined,
});

type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';

export default function LayPlanTool() {
  const [fabrics,     setFabrics]     = useState<Fabric[]>([]);
  const [fabricId,    setFabricId]    = useState('');
  const [size,        setSize]        = useState('38');
  const [pieces,      setPieces]      = useState<PatternPiece[]>([EMPTY_PIECE()]);
  const [showResult,  setShowResult]  = useState(false);
  const [status,      setStatus]      = useState<AnalysisStatus>('idle');
  const [errorMsg,    setErrorMsg]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFabrics(loadFabrics()); }, []);

  const regularFabrics = fabrics.filter(f => !f.isScrap);
  const selectedFabric = regularFabrics.find(f => f.id === fabricId);

  /* ── Gestion du tableau de pièces ──────────────────────────── */
  const updatePiece = (idx: number, key: keyof PatternPiece, val: string | number | boolean) =>
    setPieces(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));

  const addPiece    = () => setPieces(prev => [...prev, EMPTY_PIECE()]);
  const removePiece = (idx: number) => setPieces(prev => prev.filter((_, i) => i !== idx));

  /* ── Analyse IA depuis PDF / image ─────────────────────────── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setErrorMsg('');
    setShowResult(false);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target!.result as string;
      try {
        const res  = await fetch('/api/analyze-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileDataUrl: dataUrl, size }),
        });
        const data = await res.json() as { pieces?: { name: string; width_cm: number; height_cm: number; area_cm2?: number; quantity: number; on_fold: boolean; shape?: string; notes?: string }[]; garment_type?: string; error?: string };

        if (data.error) {
          setStatus('error');
          setErrorMsg(data.error);
          return;
        }

        if (data.pieces && data.pieces.length > 0) {
          setPieces(data.pieces.map(p => ({
            name:     p.name,
            widthCm:  p.width_cm,
            heightCm: p.height_cm,
            quantity: p.quantity,
            onFold:   p.on_fold,
            areaCm2:  p.area_cm2,
            shape:    p.shape as PatternPiece['shape'],
          })));
          setStatus('done');
        } else {
          setStatus('error');
          setErrorMsg('Aucune pièce identifiée. Essayez avec une image plus nette.');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Erreur réseau.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validPieces = pieces.filter(p => p.name && p.widthCm > 0 && p.heightCm > 0);
  const canGenerate = validPieces.length > 0 && !!selectedFabric;

  return (
    <div style={{ padding: '28px 28px 36px' }}>

      {/* Titre */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Placement sur tissu
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Estimez le métrage nécessaire et visualisez la disposition des pièces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne gauche : paramètres ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Taille */}
          <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }}/>
            <label className="field-label">Taille à couper</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {['34','36','38','40','42','44','46','48','50'].map(s => (
                <button key={s} type="button" onClick={() => setSize(s)}
                  style={{
                    padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif',
                    border: `1.5px solid ${size === s ? 'var(--mauve)' : 'var(--mauve-pale)'}`,
                    backgroundColor: size === s ? 'var(--mauve)' : 'white',
                    color: size === s ? 'var(--creme)' : 'var(--brun-mid)',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tissu */}
          <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }}/>
            <label className="field-label">Tissu utilisé</label>
            <select className="field-input" value={fabricId} onChange={e => setFabricId(e.target.value)} style={{ marginTop: '6px' }}>
              <option value="">— Sélectionner un tissu —</option>
              {regularFabrics.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.width.toFixed(0)} cm × {f.length.toFixed(2)} m)
                </option>
              ))}
            </select>
            {selectedFabric && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: selectedFabric.color, border: '1.5px solid var(--mauve-pale)', borderRadius: '3px', flexShrink: 0 }}/>
                <span style={{ fontSize: '0.8rem', color: 'var(--brun-mid)' }}>
                  {selectedFabric.type} · {selectedFabric.length.toFixed(2)} m disponibles
                </span>
              </div>
            )}
          </div>

          {/* Import PDF / image */}
          <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }}/>
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.9rem', margin: '0 0 8px' }}>
              Analyser un patron (PDF / image)
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.4 }}>
              Importez une photo ou un PDF de votre patron. Claude identifiera les pièces et estimera leurs dimensions pour la taille sélectionnée.
            </p>

            {status === 'loading' && (
              <div style={{ textAlign: 'center', padding: '12px', color: 'var(--mauve)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                ⏳ Analyse en cours…
              </div>
            )}
            {status === 'done' && (
              <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#2E7A46' }}>
                ✅ {pieces.length} pièce{pieces.length > 1 ? 's' : ''} identifiée{pieces.length > 1 ? 's' : ''} — vérifiez et ajustez si nécessaire.
              </div>
            )}
            {status === 'error' && (
              <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#943030' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*,application/pdf"
              onChange={handleFileChange} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()}
              disabled={status === 'loading'}
              style={{
                padding: '8px 14px', border: '1.5px dashed var(--mauve-light)',
                borderRadius: '7px', backgroundColor: 'var(--creme)',
                color: 'var(--mauve)', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                opacity: status === 'loading' ? 0.6 : 1,
              }}>
              📎 Importer PDF ou image
            </button>
          </div>
        </div>

        {/* ── Colonne droite : tableau des pièces ────────────────── */}
        <div className="lg:col-span-2">
          <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }}/>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.95rem', margin: 0 }}>
                Pièces du patron
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontStyle: 'italic' }}>
                {validPieces.length} pièce{validPieces.length !== 1 ? 's' : ''} valide{validPieces.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* En-tête tableau */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 50px 70px 30px', gap: '6px', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
              {['Pièce', 'Larg. (cm)', 'Haut. (cm)', 'Qté', 'Sur le pli', ''].map(h => (
                <span key={h} style={{ fontSize: '0.68rem', color: 'var(--brun-mid)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Georgia, serif' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Lignes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', zIndex: 1 }}>
              {pieces.map((p, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 50px 70px 30px', gap: '6px', alignItems: 'center' }}>
                  <input className="field-input" value={p.name}
                    onChange={e => updatePiece(idx, 'name', e.target.value)}
                    placeholder="Ex : Devant" style={{ fontSize: '0.85rem', padding: '6px 10px' }} />
                  <input className="field-input" type="number" min="1" step="0.5" value={p.widthCm || ''}
                    onChange={e => updatePiece(idx, 'widthCm', parseFloat(e.target.value) || 0)}
                    placeholder="45" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                  <input className="field-input" type="number" min="1" step="0.5" value={p.heightCm || ''}
                    onChange={e => updatePiece(idx, 'heightCm', parseFloat(e.target.value) || 0)}
                    placeholder="65" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                  <input className="field-input" type="number" min="1" max="10" step="1" value={p.quantity}
                    onChange={e => updatePiece(idx, 'quantity', parseInt(e.target.value) || 1)}
                    style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                  {/* Toggle sur le pli */}
                  <button type="button" onClick={() => updatePiece(idx, 'onFold', !p.onFold)}
                    style={{
                      padding: '5px 8px', borderRadius: '5px', border: `1.5px solid ${p.onFold ? 'var(--mauve)' : 'var(--mauve-pale)'}`,
                      backgroundColor: p.onFold ? 'var(--mauve)' : 'transparent',
                      color: p.onFold ? 'var(--creme)' : 'var(--brun-mid)',
                      cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Georgia, serif',
                    }}>
                    {p.onFold ? '✓ pli' : 'pli'}
                  </button>
                  <button type="button" onClick={() => removePiece(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mauve-light)', fontSize: '1rem', padding: '0', lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
              <button type="button" onClick={addPiece}
                style={{
                  padding: '7px 14px', border: '1.5px dashed var(--mauve-light)', borderRadius: '6px',
                  backgroundColor: 'transparent', color: 'var(--mauve)',
                  cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.82rem',
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                }}>
                ＋ Ajouter une pièce
              </button>
            </div>
          </div>

          {/* Bouton générer */}
          <button
            type="button"
            onClick={() => setShowResult(true)}
            disabled={!canGenerate}
            className="btn-couture"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '12px', opacity: canGenerate ? 1 : 0.5, cursor: canGenerate ? 'pointer' : 'not-allowed' }}>
            📐 Calculer le placement
          </button>

          {!canGenerate && (
            <p style={{ fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', textAlign: 'center', marginTop: '6px' }}>
              {!selectedFabric ? 'Sélectionnez un tissu.' : 'Remplissez au moins une pièce (nom + dimensions).'}
            </p>
          )}
        </div>
      </div>

      {/* ── Résultat lay plan ──────────────────────────────────── */}
      {showResult && canGenerate && selectedFabric && (
        <div style={{ marginTop: '32px', borderTop: '2px solid var(--mauve-pale)', paddingTop: '24px' }}>
          <h4 style={{ fontFamily: 'Georgia, serif', color: 'var(--mauve)', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 16px' }}>
            Résultat du placement — Taille {size}
          </h4>

          {/* Avertissement si métrage insuffisant */}
          {(() => {
            const { totalLengthCm } = (LayPlanCanvas as unknown as {
              computeLayPlan?: (p: PatternPiece[], w: number) => { totalLengthCm: number };
            })?.computeLayPlan?.(validPieces, selectedFabric.width) ?? { totalLengthCm: 0 };
            const needed = totalLengthCm / 100;
            const available = selectedFabric.length;
            if (needed > available * 1.05) {
              return (
                <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '7px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.85rem', color: '#943030' }}>
                  ⚠️ Métrage estimé ({needed.toFixed(2)} m) supérieur au tissu disponible ({available.toFixed(2)} m).
                </div>
              );
            }
            return null;
          })()}

          <LayPlanCanvas
            pieces={validPieces}
            fabricWidthCm={selectedFabric.width}
            fabricColor={selectedFabric.color}
          />
        </div>
      )}
    </div>
  );
}
