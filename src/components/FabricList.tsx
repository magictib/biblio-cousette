'use client';

import { useState } from 'react';
import { Fabric } from '@/types';

interface FabricListProps {
  fabrics:  Fabric[];
  onDelete: (id: string) => void;
  onEdit:   (fabric: Fabric) => void;
}

export default function FabricList({ fabrics, onDelete, onEdit }: FabricListProps) {
  const [preview, setPreview] = useState<{ photos: string[]; idx: number } | null>(null);

  if (fabrics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧵</div>
        <p>Aucun tissu pour l&apos;instant.<br/>Commencez par en ajouter un !</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Lightbox photo ───────────────────────────────────── */}
      {preview && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(40,20,58,.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}
        >
          <div style={{
            backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)', borderRadius: '12px',
            maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(40,20,58,.3)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--mauve-pale)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--mauve)', fontSize: '1rem' }}>
                🖼 Photo
              </span>
              <button onClick={() => setPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--brun-mid)' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <img src={preview.photos[preview.idx]} alt=""
                style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', border: '1.5px solid var(--mauve-pale)', display: 'block' }} />
              {preview.photos.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {preview.photos.map((src, i) => (
                    <img key={i} src={src} alt="" onClick={() => setPreview({ ...preview, idx: i })}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer',
                        border: `2px solid ${i === preview.idx ? 'var(--mauve)' : 'transparent'}`,
                        opacity: i === preview.idx ? 1 : 0.6 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tableau ───────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--mauve-light)' }}>
              {['Nom', 'Type', 'Couleur', 'Dimensions', 'Motif', 'Notes', '', '', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--brun-mid)', fontWeight: 'normal', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fabrics.map((f, idx) => {
              const lengthCm = Math.round(f.length * 100);
              const dims = f.isScrap
                ? (f.width > 0 || lengthCm > 0
                    ? `${f.width > 0 ? f.width.toFixed(0) + ' cm' : '?'} × ${lengthCm > 0 ? lengthCm + ' cm' : '?'}`
                    : f.estimatedArea ? `≈ ${f.estimatedArea.toLocaleString('fr-FR')} cm²` : '—')
                : `${f.width.toFixed(0)} cm × ${f.length.toFixed(2)} m`;

              return (
                <tr key={f.id} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(94,53,120,.05)', borderBottom: '1px solid var(--mauve-pale)' }}>

                  {/* Nom */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun)', fontWeight: 'bold', maxWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}
                      </span>
                      {f.isScrap && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '8px', backgroundColor: 'var(--mauve)', color: 'var(--creme)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          ✂️ Chute
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun-mid)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {f.type}
                  </td>

                  {/* Couleur */}
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {f.photos.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '4px', flexShrink: 0,
                          backgroundColor: f.color, border: '1.5px solid var(--mauve-light)',
                          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.25)',
                        }}/>
                        <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontFamily: 'monospace' }}>{f.color}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontStyle: 'italic' }}>voir photo</span>
                    )}
                  </td>

                  {/* Dimensions */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun-mid)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {dims}
                  </td>

                  {/* Motif */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun-mid)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {f.pattern || '—'}
                  </td>

                  {/* Notes */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun-mid)', fontStyle: 'italic', fontSize: '0.78rem', maxWidth: '200px' }}>
                    {f.notes ? (
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.notes}
                      </span>
                    ) : '—'}
                  </td>

                  {/* Icône photo */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', width: '36px' }}>
                    {f.photos.length > 0 ? (
                      <button
                        onClick={() => setPreview({ photos: f.photos, idx: 0 })}
                        title="Voir la photo"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '5px', lineHeight: 1 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--mauve-pale)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mauve)" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </button>
                    ) : (
                      <span style={{ color: 'var(--mauve-pale)', fontSize: '0.7rem' }}>—</span>
                    )}
                  </td>

                  {/* Icône modifier */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', width: '36px' }}>
                    <button
                      onClick={() => onEdit(f)}
                      title="Modifier"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '5px', lineHeight: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--mauve-pale)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--mauve)" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </td>

                  {/* Icône supprimer */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', width: '36px' }}>
                    <button
                      onClick={() => onDelete(f.id)}
                      title="Supprimer"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '5px', lineHeight: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAE8E8')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#943030" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
