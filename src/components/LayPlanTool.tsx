'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Fabric } from '@/types';
import { loadFabrics } from '@/utils/migrate';
import LayPlanCanvas, { PatternPiece, FabricConstraints, computeLayPlan } from './LayPlanCanvas';
import { analyzePattern } from '@/utils/gemini';

const EMPTY_PIECE = (): PatternPiece => ({
  name: '', widthCm: 0, heightCm: 0, quantity: 1, onFold: false,
  grainLine: 'vertical', needsMatching: false,
  areaCm2: undefined, shape: undefined,
});

type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';

const GRAIN_OPTIONS: { value: PatternPiece['grainLine']; label: string }[] = [
  { value: 'vertical',   label: '↕ Droit fil' },
  { value: 'horizontal', label: '↔ Travers' },
  { value: 'bias',       label: '↗ Biais' },
  { value: 'any',        label: '✱ Libre' },
];

export default function LayPlanTool() {
  const [fabrics,    setFabrics]    = useState<Fabric[]>([]);
  const [fabricId,   setFabricId]   = useState('');
  const [size,       setSize]       = useState('38');
  const [pieces,     setPieces]     = useState<PatternPiece[]>([EMPTY_PIECE()]);
  const [showResult, setShowResult] = useState(false);
  const [status,     setStatus]     = useState<AnalysisStatus>('idle');
  const [errorMsg,   setErrorMsg]   = useState('');

  const [constraints, setConstraints] = useState<FabricConstraints>({
    hasNap: false,
    patternRepeatH: 0,
    patternRepeatV: 0,
  });
  const [showRepeat, setShowRepeat] = useState(false);
  const [repeatH,    setRepeatH]    = useState('');
  const [repeatV,    setRepeatV]    = useState('');

  /* Visualisateur patron importé */
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf'>('image');
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFabrics(loadFabrics()); }, []);

  /* Sync constraints quand les toggles/valeurs changent */
  useEffect(() => {
    setConstraints(prev => ({
      ...prev,
      patternRepeatH: showRepeat ? (parseFloat(repeatH) || 0) : 0,
      patternRepeatV: showRepeat ? (parseFloat(repeatV) || 0) : 0,
    }));
  }, [showRepeat, repeatH, repeatV]);

  const cleanPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const regularFabrics = fabrics.filter(f => !f.isScrap);
  const selectedFabric = regularFabrics.find(f => f.id === fabricId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePiece = (idx: number, key: keyof PatternPiece, val: any) =>
    setPieces(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));

  const addPiece    = () => setPieces(prev => [...prev, EMPTY_PIECE()]);
  const removePiece = (idx: number) => setPieces(prev => prev.filter((_, i) => i !== idx));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('loading');
    setErrorMsg('');
    setShowResult(false);
    cleanPreview();
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setPreviewType(file.type === 'application/pdf' ? 'pdf' : 'image');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target!.result as string;
      try {
        const data = await analyzePattern(dataUrl, size);
        if (data.pieces && data.pieces.length > 0) {
          setPieces(data.pieces.map(p => ({
            name:        p.name,
            widthCm:     p.width_cm,
            heightCm:    p.height_cm,
            quantity:    p.quantity,
            onFold:      p.on_fold,
            areaCm2:     p.area_cm2,
            shape:       p.shape as PatternPiece['shape'],
            grainLine:   'vertical' as const,
            needsMatching: false,
          })));
          setStatus('done');
        } else {
          setStatus('error');
          setErrorMsg('Aucune pièce identifiée. Essayez avec une image plus nette.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(String(err).replace('Error: ', ''));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validPieces = pieces.filter(p => p.name && p.widthCm > 0 && p.heightCm > 0);
  const canGenerate = validPieces.length > 0 && !!selectedFabric;
  const hasRepeatActive = showRepeat && (parseFloat(repeatH) > 0 || parseFloat(repeatV) > 0);

  return (
    <div style={{ padding: '28px 28px 36px' }}>

      {/* ── Modal visualisateur patron importé ─────────────────── */}
      {previewOpen && previewUrl && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(61,36,24,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setPreviewOpen(false); }}
        >
          <div style={{ backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(61,36,24,.3)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--mauve-pale)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--mauve)', fontSize: '1rem' }}>👁 Visualiser le patron importé</span>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--brun-mid)' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
              {previewType === 'pdf'
                ? <iframe src={previewUrl} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '6px' }} title="Patron PDF" />
                : <img src={previewUrl} alt="Patron" style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto', borderRadius: '6px', border: '1.5px solid var(--mauve-pale)' }} />
              }
            </div>
          </div>
        </div>
      )}

      {/* Titre */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Placement sur tissu
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Estimez le métrage nécessaire et visualisez la disposition des pièces selon votre tissu et ses contraintes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne gauche ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Taille */}
          <Panel>
            <label className="field-label">Taille à couper</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {['34','36','38','40','42','44','46','48','50'].map(s => (
                <button key={s} type="button" onClick={() => setSize(s)}
                  style={{ padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif', border: `1.5px solid ${size === s ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: size === s ? 'var(--mauve)' : 'var(--creme)', color: size === s ? 'var(--creme)' : 'var(--brun-mid)' }}>
                  {s}
                </button>
              ))}
            </div>
          </Panel>

          {/* Tissu */}
          <Panel>
            <label className="field-label">Tissu utilisé</label>
            <select className="field-input" value={fabricId} onChange={e => setFabricId(e.target.value)} style={{ marginTop: '6px' }}>
              <option value="">— Sélectionner un tissu —</option>
              {regularFabrics.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.width.toFixed(0)} cm × {f.length.toFixed(2)} m)</option>
              ))}
            </select>
            {selectedFabric && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '18px', height: '18px', backgroundColor: selectedFabric.color, border: '1.5px solid var(--mauve-pale)', borderRadius: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--brun-mid)' }}>
                  {selectedFabric.type} · {selectedFabric.length.toFixed(2)} m disponibles
                </span>
              </div>
            )}
          </Panel>

          {/* ── Contraintes tissu ──────────────────────────────── */}
          <Panel>
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.9rem', margin: '0 0 12px' }}>
              Contraintes tissu
            </p>

            {/* Sens du poil */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="field-label" style={{ margin: 0 }}>Sens du poil</label>
                <button type="button" onClick={() => setConstraints(prev => ({ ...prev, hasNap: !prev.hasNap }))}
                  style={{ padding: '3px 12px', borderRadius: '10px', border: `1.5px solid ${constraints.hasNap ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: constraints.hasNap ? 'var(--mauve)' : 'transparent', color: constraints.hasNap ? 'var(--creme)' : 'var(--brun-mid)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {constraints.hasNap ? '✓ Activé' : 'Désactivé'}
                </button>
              </div>
              {constraints.hasNap && (
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  Velours, jersey directionnel, fourrure — toutes les pièces dans le même sens (flèches affichées sur le tissu).
                </p>
              )}
            </div>

            {/* Raccords de motifs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="field-label" style={{ margin: 0 }}>Raccords de motifs</label>
                <button type="button" onClick={() => setShowRepeat(v => !v)}
                  style={{ padding: '3px 12px', borderRadius: '10px', border: `1.5px solid ${showRepeat ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: showRepeat ? 'var(--mauve)' : 'transparent', color: showRepeat ? 'var(--creme)' : 'var(--brun-mid)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {showRepeat ? '✓ Activé' : 'Désactivé'}
                </button>
              </div>
              {showRepeat && (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    Carreaux, rayures, imprimés à raccorder — entrez le rapport en cm (laisser vide = pas de contrainte dans ce sens).
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '3px' }}>Rapport horizontal (cm)</label>
                      <input className="field-input" type="number" min="1" step="0.5" value={repeatH} onChange={e => setRepeatH(e.target.value)} placeholder="Ex : 25" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '3px' }}>Rapport vertical (cm)</label>
                      <input className="field-input" type="number" min="1" step="0.5" value={repeatV} onChange={e => setRepeatV(e.target.value)} placeholder="Ex : 30" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Panel>

          {/* Import PDF */}
          <Panel>
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.9rem', margin: '0 0 6px' }}>
              Analyser un patron (PDF / image)
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.4 }}>
              Gemini identifie les pièces et dimensions pour la taille sélectionnée.
            </p>
            {status === 'loading' && <div style={{ textAlign: 'center', padding: '10px', color: 'var(--mauve)', fontStyle: 'italic', fontSize: '0.85rem' }}>⏳ Analyse en cours…</div>}
            {status === 'done'    && <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '6px', padding: '7px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#2E7A46' }}>✅ {pieces.length} pièce{pieces.length > 1 ? 's' : ''} identifiée{pieces.length > 1 ? 's' : ''} — vérifiez si nécessaire.</div>}
            {status === 'error'   && <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '7px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#943030' }}>⚠️ {errorMsg}</div>}
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={status === 'loading'}
                style={{ padding: '7px 13px', border: '1.5px dashed var(--mauve-light)', borderRadius: '7px', backgroundColor: 'var(--creme)', color: 'var(--mauve)', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: status === 'loading' ? 0.6 : 1 }}>
                📎 {status === 'idle' ? 'Importer PDF ou image' : 'Changer de fichier'}
              </button>
              {previewUrl && (
                <button type="button" onClick={() => setPreviewOpen(true)}
                  style={{ padding: '7px 13px', border: '1.5px solid var(--mauve-light)', borderRadius: '7px', backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  👁 Voir le patron
                </button>
              )}
            </div>
          </Panel>
        </div>

        {/* ── Colonne droite : pièces ────────────────────────────── */}
        <div className="lg:col-span-2">
          <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.95rem', margin: 0 }}>
                Pièces du patron
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontStyle: 'italic' }}>
                {validPieces.length} pièce{validPieces.length !== 1 ? 's' : ''} valide{validPieces.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
              {pieces.map((p, idx) => (
                <div key={idx} style={{ border: '1.5px solid var(--mauve-pale)', borderRadius: '7px', padding: '10px 12px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,.5)' : 'rgba(94,53,120,.03)' }}>

                  {/* Ligne 1 : nom + supprimer */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input className="field-input" value={p.name}
                      onChange={e => updatePiece(idx, 'name', e.target.value)}
                      placeholder="Nom de la pièce (ex : Devant)" style={{ flex: 1, fontSize: '0.88rem', padding: '6px 10px' }} />
                    <button type="button" onClick={() => removePiece(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mauve-light)', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>
                      ✕
                    </button>
                  </div>

                  {/* Ligne 2 : dimensions + qty + pli */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--brun-mid)' }}>L</span>
                      <input className="field-input" type="number" min="1" step="0.5" value={p.widthCm || ''}
                        onChange={e => updatePiece(idx, 'widthCm', parseFloat(e.target.value) || 0)}
                        placeholder="45" style={{ width: '64px', fontSize: '0.85rem', padding: '5px 7px' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--brun-mid)' }}>× H</span>
                      <input className="field-input" type="number" min="1" step="0.5" value={p.heightCm || ''}
                        onChange={e => updatePiece(idx, 'heightCm', parseFloat(e.target.value) || 0)}
                        placeholder="65" style={{ width: '64px', fontSize: '0.85rem', padding: '5px 7px' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--brun-mid)' }}>cm</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--brun-mid)' }}>Qté</span>
                      <input className="field-input" type="number" min="1" max="10" step="1" value={p.quantity}
                        onChange={e => updatePiece(idx, 'quantity', parseInt(e.target.value) || 1)}
                        style={{ width: '48px', fontSize: '0.85rem', padding: '5px 7px' }} />
                    </div>
                    <button type="button" onClick={() => updatePiece(idx, 'onFold', !p.onFold)}
                      title="Sur le pli : la pièce est découpée sur un tissu plié (dimensions doublées)"
                      style={{ padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Georgia, serif', border: `1.5px solid ${p.onFold ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: p.onFold ? 'var(--mauve)' : 'transparent', color: p.onFold ? 'var(--creme)' : 'var(--brun-mid)', whiteSpace: 'nowrap' }}>
                      {p.onFold ? '✓ Sur le pli' : 'Sur le pli'}
                    </button>
                  </div>

                  {/* Ligne 3 : droit fil + raccord */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', whiteSpace: 'nowrap' }}>Droit fil</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {GRAIN_OPTIONS.map(opt => (
                          <button key={opt.value} type="button" onClick={() => updatePiece(idx, 'grainLine', opt.value)}
                            title={opt.label}
                            style={{ padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'Georgia, serif', border: `1.5px solid ${p.grainLine === opt.value ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: p.grainLine === opt.value ? 'var(--mauve)' : 'transparent', color: p.grainLine === opt.value ? 'var(--creme)' : 'var(--brun-mid)', whiteSpace: 'nowrap' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {hasRepeatActive && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', whiteSpace: 'nowrap' }}>Raccord</span>
                        <button type="button" onClick={() => updatePiece(idx, 'needsMatching', !p.needsMatching)}
                          title="Cette pièce doit être alignée sur le rapport du motif"
                          style={{ padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'Georgia, serif', border: `1.5px solid ${p.needsMatching ? '#A07828' : 'var(--mauve-pale)'}`, backgroundColor: p.needsMatching ? '#A07828' : 'transparent', color: p.needsMatching ? 'white' : 'var(--brun-mid)' }}>
                          {p.needsMatching ? '✓ Oui' : 'Non'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', position: 'relative', zIndex: 1 }}>
              <button type="button" onClick={addPiece}
                style={{ padding: '7px 14px', border: '1.5px dashed var(--mauve-light)', borderRadius: '6px', backgroundColor: 'transparent', color: 'var(--mauve)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                ＋ Ajouter une pièce
              </button>
            </div>
          </div>

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

      {/* ── Résultat ───────────────────────────────────────────── */}
      {showResult && canGenerate && selectedFabric && (
        <div style={{ marginTop: '32px', borderTop: '2px solid var(--mauve-pale)', paddingTop: '24px' }}>
          <h4 style={{ fontFamily: 'Georgia, serif', color: 'var(--mauve)', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 16px' }}>
            Résultat du placement — Taille {size}
          </h4>

          {(() => {
            const { totalLengthCm } = computeLayPlan(validPieces, selectedFabric.width, 1.5, constraints);
            const needed    = totalLengthCm / 100;
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
            constraints={constraints}
          />
        </div>
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
