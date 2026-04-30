'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern } from '@/types';
import { loadFabrics, loadPatterns } from '@/utils/migrate';
import VisualizationCanvas from './VisualizationCanvas';

export default function PatternFitter() {
  const [fabrics,         setFabrics]         = useState<Fabric[]>([]);
  const [patterns,        setPatterns]        = useState<Pattern[]>([]);
  const [selectedFabric,  setSelectedFabric]  = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [canFit,          setCanFit]          = useState<boolean | null>(null);
  const [rotations,       setRotations]       = useState({ horizontal: false, vertical: false });

  useEffect(() => {
    setFabrics(loadFabrics());
    setPatterns(loadPatterns());
  }, []);

  const checkFit = () => {
    if (!selectedFabric || !selectedPattern) {
      alert('Veuillez sélectionner un tissu et un patron');
      return;
    }
    const fabric  = fabrics.find(f => f.id === selectedFabric);
    const pattern = patterns.find(p => p.id === selectedPattern);
    if (!fabric || !pattern) return;

    if (fabric.isScrap) {
      alert('Les chutes de tissu ne peuvent pas être testées avec précision.\nUtilisez un tissu avec métrage défini.');
      return;
    }

    const fabricLenCm = fabric.length * 100;
    const hFit = pattern.width <= fabric.width   && pattern.height <= fabricLenCm;
    const vFit = pattern.width <= fabricLenCm    && pattern.height <= fabric.width;

    setCanFit(hFit || vFit);
    setRotations({ horizontal: hFit, vertical: vFit });
  };

  const regularFabrics = fabrics.filter(f => !f.isScrap);

  return (
    <div style={{ padding: '28px' }}>
      <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 24px' }}>
        Testeur de patron
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Sélecteurs ─────────────────────────────────────────── */}
        <div style={{
          backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)',
          borderRadius: '8px', padding: '20px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '5px', border: '1px dashed var(--mauve-pale)', borderRadius: '4px', pointerEvents: 'none', opacity: 0.5 }}/>

          <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', marginBottom: '16px', margin: '0 0 16px' }}>
            Sélectionner
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="field-label">Tissu</label>
              <select className="field-input" value={selectedFabric} onChange={e => setSelectedFabric(e.target.value)}>
                <option value="">— Sélectionner un tissu —</option>
                {regularFabrics.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.width.toFixed(0)} cm × {f.length.toFixed(2)} m)
                  </option>
                ))}
              </select>
              {fabrics.some(f => f.isScrap) && (
                <p style={{ fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic', marginTop: '4px' }}>
                  Les chutes sont exclues du testeur.
                </p>
              )}
            </div>

            <div>
              <label className="field-label">Patron</label>
              <select className="field-input" value={selectedPattern} onChange={e => setSelectedPattern(e.target.value)}>
                <option value="">— Sélectionner un patron —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.designer ? ` (${p.designer})` : ''} — {p.width.toFixed(0)} × {p.height.toFixed(0)} cm
                  </option>
                ))}
              </select>
            </div>

            <button onClick={checkFit} className="btn-couture" style={{ width: '100%', justifyContent: 'center' }}>
              Vérifier l&apos;ajustement
            </button>
          </div>

          {/* Résultat */}
          {canFit !== null && (
            <div style={{
              marginTop: '16px', padding: '14px',
              backgroundColor: canFit ? '#E8F5EC' : '#FAE8E8',
              border: `1.5px solid ${canFit ? '#80C894' : '#D48080'}`,
              borderRadius: '8px',
            }}>
              <p style={{ fontWeight: 'bold', color: canFit ? '#2E7A46' : '#943030', margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
                {canFit ? '✅ Le patron rentre !' : '❌ Le patron ne rentre pas'}
              </p>

              {canFit && (
                <div style={{ fontSize: '0.85rem', color: 'var(--brun)' }}>
                  <p style={{ fontWeight: '600', margin: '0 0 4px' }}>Orientations possibles :</p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {rotations.horizontal && <li>Sans rotation</li>}
                    {rotations.vertical   && <li>Rotation 90°</li>}
                  </ul>
                </div>
              )}

              {(() => {
                const f = fabrics.find(x => x.id === selectedFabric);
                const p = patterns.find(x => x.id === selectedPattern);
                if (!f || !p) return null;
                return (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--brun-mid)' }}>
                    <p style={{ margin: '0' }}>Tissu : {f.width.toFixed(0)} cm × {(f.length * 100).toFixed(0)} cm</p>
                    <p style={{ margin: '0' }}>Patron : {p.width.toFixed(0)} × {p.height.toFixed(0)} cm</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── Canvas ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {selectedFabric && selectedPattern && (
            <VisualizationCanvas
              fabric={fabrics.find(f => f.id === selectedFabric)!}
              pattern={patterns.find(p => p.id === selectedPattern)!}
              canFit={canFit}
              rotations={rotations}
            />
          )}
        </div>
      </div>
    </div>
  );
}
