'use client';

import { useState } from 'react';
import { Pattern } from '@/types';

interface PatternListProps {
  patterns: Pattern[];
  onDelete: (id: string) => void;
  onEdit:   (pattern: Pattern) => void;
  onSetPrimaryPdf?: (id: string, index: number) => void;
}

const diffStyle: Record<string, { bg: string; color: string; border: string }> = {
  facile:    { bg: '#E8F5EC', color: '#2E7A46', border: '#80C894' },
  moyen:     { bg: '#FAF3E0', color: '#8A6A10', border: '#D4B86A' },
  difficile: { bg: '#FAE8E8', color: '#943030', border: '#D48080' },
};

export default function PatternList({ patterns, onDelete, onEdit, onSetPrimaryPdf }: PatternListProps) {
  const [preview, setPreview] = useState<{ pattern: Pattern; fileIdx: number } | null>(null);

  if (patterns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
        <p>Aucun patron pour l&apos;instant.<br/>Commencez par en ajouter un !</p>
      </div>
    );
  }

  const openPreview = (pattern: Pattern) => {
    setPreview({ pattern, fileIdx: pattern.primaryPdfIndex ?? 0 });
  };

  const currentFile = preview?.pattern.pdfFiles?.[preview.fileIdx] ?? null;

  return (
    <>
      {/* ── Modal visualisateur ───────────────────────────────── */}
      {preview && currentFile && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(61,36,24,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}
        >
          <div style={{
            backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)', borderRadius: '12px',
            width: '100%', maxWidth: '960px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(61,36,24,.3)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--mauve-pale)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--mauve)', fontSize: '1rem' }}>
                📄 {preview.pattern.name} — {currentFile.name}
              </span>
              <button onClick={() => setPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--brun-mid)' }}>✕</button>
            </div>

            {/* Body: sidebar + viewer */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', minHeight: 0 }}>
              {/* Sidebar (only if multiple files) */}
              {(preview.pattern.pdfFiles?.length ?? 0) > 1 && (
                <div style={{
                  width: '190px', flexShrink: 0, borderRight: '1.5px solid var(--mauve-pale)',
                  overflowY: 'auto', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px',
                  backgroundColor: 'var(--linen)',
                }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brun-mid)', marginBottom: '6px', padding: '0 4px' }}>
                    Fichiers
                  </div>
                  {preview.pattern.pdfFiles!.map((file, i) => {
                    const isPrimary = (preview.pattern.primaryPdfIndex ?? 0) === i;
                    const isActive = preview.fileIdx === i;
                    return (
                      <div key={i}
                        onClick={() => setPreview({ ...preview, fileIdx: i })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
                          backgroundColor: isActive ? 'var(--mauve-pale)' : 'transparent',
                          border: isActive ? '1px solid var(--mauve-light)' : '1px solid transparent',
                        }}
                      >
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (onSetPrimaryPdf) {
                              onSetPrimaryPdf(preview.pattern.id, i);
                              setPreview({ ...preview, pattern: { ...preview.pattern, primaryPdfIndex: i } });
                            }
                          }}
                          title={isPrimary ? 'Fichier par défaut' : 'Définir comme fichier par défaut'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: 1, fontSize: '0.9rem', color: isPrimary ? '#A07828' : 'var(--mauve-pale)', flexShrink: 0 }}
                        >
                          {isPrimary ? '★' : '☆'}
                        </button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--brun)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {file.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Viewer */}
              <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
                {currentFile.dataUrl.startsWith('data:application/pdf') ? (
                  <iframe src={currentFile.dataUrl} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '6px' }} title={currentFile.name} />
                ) : (
                  <img src={currentFile.dataUrl} alt={currentFile.name}
                    style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto', borderRadius: '6px', border: '1.5px solid var(--mauve-pale)' }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tableau ───────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--mauve-light)' }}>
              {['Nom', 'Créatrice', 'Type', 'Difficulté', 'Dimensions', '', '', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--brun-mid)', fontWeight: 'normal',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patterns.map((p, idx) => {
              const ds = diffStyle[p.difficulty] ?? diffStyle.moyen;
              const fileCount = p.pdfFiles?.length ?? 0;
              return (
                <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(200,180,190,.07)', borderBottom: '1px solid var(--mauve-pale)' }}>

                  {/* Nom */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun)', fontWeight: 'bold', maxWidth: '200px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                  </td>

                  {/* Créatrice */}
                  <td style={{ padding: '10px 12px', color: 'var(--mauve)', fontStyle: 'italic', maxWidth: '140px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.designer ?? '—'}
                    </span>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun-mid)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {p.clothingType}
                  </td>

                  {/* Difficulté */}
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 'bold',
                      backgroundColor: ds.bg, color: ds.color, border: `1px solid ${ds.border}`,
                    }}>
                      {p.difficulty}
                    </span>
                  </td>

                  {/* Dimensions */}
                  <td style={{ padding: '10px 12px', color: 'var(--brun-mid)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {p.width > 0 || p.height > 0 ? `${p.width.toFixed(0)} × ${p.height.toFixed(0)} cm` : '—'}
                  </td>

                  {/* Icône voir patron */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', width: '36px' }}>
                    {fileCount > 0 ? (
                      <button
                        onClick={() => openPreview(p)}
                        title={fileCount > 1 ? `Voir les ${fileCount} fichiers` : 'Voir le patron'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '5px', lineHeight: 1, position: 'relative' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--mauve-pale)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mauve)" strokeWidth="2" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="9" y1="13" x2="15" y2="13"/>
                          <line x1="9" y1="17" x2="13" y2="17"/>
                        </svg>
                        {fileCount > 1 && (
                          <span style={{
                            position: 'absolute', top: '0', right: '0',
                            fontSize: '0.55rem', fontWeight: 'bold',
                            backgroundColor: 'var(--mauve)', color: 'var(--creme)',
                            borderRadius: '50%', width: '13px', height: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                          }}>
                            {fileCount}
                          </span>
                        )}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--mauve-pale)', fontSize: '0.7rem' }}>—</span>
                    )}
                  </td>

                  {/* Icône modifier */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', width: '36px' }}>
                    <button
                      onClick={() => onEdit(p)}
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
                      onClick={() => onDelete(p.id)}
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
