'use client';

import { useState, useEffect, useRef } from 'react';
import { Fabric, Pattern } from '@/types';
import { loadFabricsDB, loadPatternsDB } from '@/lib/db';
import LayPlanCanvas, { PatternPiece, FabricConstraints, computeLayPlan } from './LayPlanCanvas';
import type { PatternPieceRaw } from '@/utils/openai';

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

const STRETCH_OPTIONS = [
  { value: '',                  label: 'Non' },
  { value: 'sens horizontal',   label: '↔ Horizontal' },
  { value: 'sens vertical',     label: '↕ Vertical' },
  { value: '4 sens',            label: '✱ 4 sens' },
];

const GARMENT_SUBTYPES = ['culotte', 'tanga', 'shorty', 'brassière', 'débardeur', 'crop top', 'combinaison', 'autre'];

interface Props { uid: string }

export default function LayPlanTool({ uid }: Props) {
  const [fabrics,    setFabrics]    = useState<Fabric[]>([]);
  const [patterns,   setPatterns]   = useState<Pattern[]>([]);
  const [fabricId,   setFabricId]   = useState('');
  const [patternId,  setPatternId]  = useState('');
  const [size,       setSize]       = useState('38');
  const [pieces,     setPieces]     = useState<PatternPiece[]>([EMPTY_PIECE()]);
  const [showResult, setShowResult] = useState(false);

  /* Contraintes tissu */
  const [constraints, setConstraints] = useState<FabricConstraints>({
    hasNap: false, patternRepeatH: 0, patternRepeatV: 0,
  });
  const [showRepeat, setShowRepeat] = useState(false);
  const [repeatH,    setRepeatH]    = useState('');
  const [repeatV,    setRepeatV]    = useState('');

  /* Analyse IA */
  const [version,        setVersion]        = useState('');
  const [garmentSubtype, setGarmentSubtype] = useState('');
  const [stretchDir,     setStretchDir]     = useState('');
  const [analysisImage,  setAnalysisImage]  = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [analysisError,  setAnalysisError]  = useState('');

  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFabricsDB(uid).then(setFabrics).catch(() => null);
    loadPatternsDB(uid).then(setPatterns).catch(() => null);
  }, [uid]);

  useEffect(() => {
    setConstraints(prev => ({
      ...prev,
      patternRepeatH: showRepeat ? (parseFloat(repeatH) || 0) : 0,
      patternRepeatV: showRepeat ? (parseFloat(repeatV) || 0) : 0,
    }));
  }, [showRepeat, repeatH, repeatV]);

  const regularFabrics = fabrics.filter(f => !f.isScrap);
  const selectedFabric = regularFabrics.find(f => f.id === fabricId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePiece = (idx: number, key: keyof PatternPiece, val: any) =>
    setPieces(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));

  const addPiece    = () => setPieces(prev => [...prev, EMPTY_PIECE()]);
  const removePiece = (idx: number) => setPieces(prev => prev.filter((_, i) => i !== idx));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAnalysisImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFabric) return;
    setAnalysisStatus('loading');
    setAnalysisError('');
    try {
      const res = await fetch('/api/analyze-pattern-gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl:     analysisImage ?? undefined,
          fabricWidthCm:    selectedFabric.width,
          fabricLengthM:    selectedFabric.length,
          size,
          version:          version        || undefined,
          garmentSubtype:   garmentSubtype || undefined,
          stretchDirection: stretchDir     || undefined,
        }),
      });
      const data = await res.json() as { garment_type?: string; pieces?: PatternPieceRaw[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      if ((data.pieces ?? []).length > 0) {
        setPieces((data.pieces ?? []).map((p: PatternPieceRaw) => ({
          name:          p.name,
          widthCm:       p.width_cm,
          heightCm:      p.height_cm,
          quantity:      p.quantity,
          onFold:        p.on_fold,
          areaCm2:       p.area_cm2,
          shape:         p.shape as PatternPiece['shape'],
          grainLine:     'vertical' as const,
          needsMatching: false,
        })));
        setAnalysisStatus('done');
      } else {
        setAnalysisStatus('error');
        setAnalysisError('Aucune pièce identifiée. Précisez la version ou le type de vêtement.');
      }
    } catch (err) {
      setAnalysisStatus('error');
      setAnalysisError(String(err).replace('Error: ', ''));
    }
  };

  const validPieces  = pieces.filter(p => p.name && p.widthCm > 0 && p.heightCm > 0);
  const canGenerate  = validPieces.length > 0 && !!selectedFabric;
  const canAnalyze   = !!selectedFabric;
  const hasRepeatActive = showRepeat && (parseFloat(repeatH) > 0 || parseFloat(repeatV) > 0);

  return (
    <div style={{ padding: '28px 28px 36px' }}>

      {/* Titre */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Placement sur tissu
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Estimez le métrage et visualisez la disposition des pièces. L&apos;IA GPT-4o peut remplir la liste automatiquement.
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
            <label className="field-label">Tissu</label>
            <select className="field-input" value={fabricId} onChange={e => setFabricId(e.target.value)} style={{ marginTop: '6px' }}>
              <option value="">— Sélectionner —</option>
              {regularFabrics.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.width.toFixed(0)} cm × {f.length.toFixed(2)} m)</option>
              ))}
            </select>
            {selectedFabric && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: selectedFabric.color, border: '1.5px solid var(--mauve-pale)', borderRadius: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--brun-mid)' }}>
                  {selectedFabric.type} · {selectedFabric.length.toFixed(2)} m
                </span>
              </div>
            )}
          </Panel>

          {/* ── Contraintes tissu ──────────────────────────────── */}
          <Panel>
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.9rem', margin: '0 0 12px' }}>
              Contraintes tissu
            </p>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="field-label" style={{ margin: 0 }}>Sens du poil</label>
                <ToggleBtn active={constraints.hasNap} onClick={() => setConstraints(prev => ({ ...prev, hasNap: !prev.hasNap }))} />
              </div>
              {constraints.hasNap && (
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  Velours, jersey directionnel, fourrure.
                </p>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="field-label" style={{ margin: 0 }}>Raccords de motifs</label>
                <ToggleBtn active={showRepeat} onClick={() => setShowRepeat(v => !v)} />
              </div>
              {showRepeat && (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    Rapport en cm (vide = pas de contrainte dans ce sens).
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '3px' }}>Horizontal (cm)</label>
                      <input className="field-input" type="number" min="1" step="0.5" value={repeatH} onChange={e => setRepeatH(e.target.value)} placeholder="Ex : 25" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '3px' }}>Vertical (cm)</label>
                      <input className="field-input" type="number" min="1" step="0.5" value={repeatV} onChange={e => setRepeatV(e.target.value)} placeholder="Ex : 30" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Panel>

          {/* ── Analyse GPT-4o ─────────────────────────────────── */}
          <Panel>
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.9rem', margin: '0 0 12px' }}>
              Analyse GPT-4o
            </p>

            {/* Patron */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Patron (optionnel)
              </label>
              <select className="field-input" value={patternId} onChange={e => setPatternId(e.target.value)} style={{ fontSize: '0.85rem', padding: '6px 8px', marginBottom: '6px' }}>
                <option value="">— Sélectionner un patron —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.designer ? ` — ${p.designer}` : ''}</option>
                ))}
              </select>
            </div>

            {/* Version */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Version
              </label>
              <input className="field-input" list="version-list" value={version} onChange={e => setVersion(e.target.value)}
                placeholder="Ex : débardeur, manches simples, dentelle…" style={{ fontSize: '0.85rem', padding: '6px 8px' }} />
              <datalist id="version-list">
                {['débardeur', 'manches simples', 'dentelle', 'bretelles fines', 'sans manches', 'manches longues', 'col V', 'col rond'].map(v => <option key={v} value={v} />)}
              </datalist>
            </div>

            {/* Type de vêtement */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Type de vêtement
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {GARMENT_SUBTYPES.map(t => (
                  <button key={t} type="button" onClick={() => setGarmentSubtype(g => g === t ? '' : t)}
                    style={{ padding: '4px 9px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.73rem', fontFamily: 'Georgia, serif', border: `1.5px solid ${garmentSubtype === t ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: garmentSubtype === t ? 'var(--mauve)' : 'transparent', color: garmentSubtype === t ? 'var(--creme)' : 'var(--brun-mid)' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Extensibilité */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tissu extensible
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {STRETCH_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setStretchDir(d => d === opt.value ? '' : opt.value)}
                    style={{ padding: '4px 9px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.73rem', fontFamily: 'Georgia, serif', border: `1.5px solid ${stretchDir === opt.value ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: stretchDir === opt.value ? 'var(--mauve)' : 'transparent', color: stretchDir === opt.value ? 'var(--creme)' : 'var(--brun-mid)' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image optionnelle */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Image du patron (optionnel)
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '6px', border: '1.5px dashed var(--mauve-light)', backgroundColor: 'var(--creme)', color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '0.78rem', cursor: 'pointer' }}>
                  📷 {analysisImage ? 'Changer' : 'Ajouter une photo'}
                  <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
                {analysisImage && (
                  <>
                    <img src={analysisImage} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--mauve-pale)' }} />
                    <button type="button" onClick={() => setAnalysisImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brun-mid)', fontSize: '0.9rem', padding: 0 }}>✕</button>
                  </>
                )}
              </div>
              <p style={{ margin: '5px 0 0', fontSize: '0.68rem', color: 'var(--brun-mid)', fontStyle: 'italic' }}>
                Images uniquement (PNG, JPG). GPT-4o analyse la photo du patron.
              </p>
            </div>

            {/* Statut */}
            {analysisStatus === 'done' && (
              <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '6px', padding: '7px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#2E7A46' }}>
                ✅ {pieces.length} pièce{pieces.length > 1 ? 's' : ''} identifiée{pieces.length > 1 ? 's' : ''} — vérifiez et ajustez si nécessaire.
              </div>
            )}
            {analysisStatus === 'error' && (
              <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '7px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#943030' }}>
                ⚠️ {analysisError}
              </div>
            )}

            <button type="button" onClick={handleAnalyze}
              disabled={!canAnalyze || analysisStatus === 'loading'}
              className="btn-couture"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem', padding: '9px', opacity: (canAnalyze && analysisStatus !== 'loading') ? 1 : 0.5, cursor: (canAnalyze && analysisStatus !== 'loading') ? 'pointer' : 'not-allowed' }}>
              {analysisStatus === 'loading' ? '⏳ Analyse en cours…' : '✦ Analyser avec GPT-4o'}
            </button>
            {!selectedFabric && (
              <p style={{ fontSize: '0.7rem', color: 'var(--brun-mid)', fontStyle: 'italic', textAlign: 'center', marginTop: '5px' }}>
                Sélectionnez d&apos;abord un tissu.
              </p>
            )}
          </Panel>
        </div>

        {/* ── Colonne droite : pièces ────────────────────────────── */}
        <div className="lg:col-span-2">
          <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '16px', position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.45 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '0.95rem', margin: 0 }}>Pièces du patron</p>
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mauve-light)', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>✕</button>
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
                      title="Sur le pli : dimensions doublées"
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
                ＋ Ajouter une pièce manuellement
              </button>
            </div>
          </div>

          <button type="button" onClick={() => setShowResult(true)} disabled={!canGenerate}
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
            const needed = totalLengthCm / 100;
            if (needed > selectedFabric.length * 1.05) {
              return (
                <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '7px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.85rem', color: '#943030' }}>
                  ⚠️ Métrage estimé ({needed.toFixed(2)} m) supérieur au tissu disponible ({selectedFabric.length.toFixed(2)} m).
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

function ToggleBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '3px 12px', borderRadius: '10px', border: `1.5px solid ${active ? 'var(--mauve)' : 'var(--mauve-pale)'}`, backgroundColor: active ? 'var(--mauve)' : 'transparent', color: active ? 'var(--creme)' : 'var(--brun-mid)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.75rem', fontWeight: 'bold' }}>
      {active ? '✓ Activé' : 'Désactivé'}
    </button>
  );
}
