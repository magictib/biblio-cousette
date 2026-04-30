'use client';

import { useState } from 'react';
import { Pattern } from '@/types';

interface PatternListProps {
  patterns: Pattern[];
  onDelete: (id: string) => void;
}

const difficultyStyle: Record<string, { bg: string; color: string; border: string }> = {
  facile:    { bg: '#E8F5EC', color: '#2E7A46', border: '#80C894' },
  moyen:     { bg: '#FAF3E0', color: '#8A6A10', border: '#D4B86A' },
  difficile: { bg: '#FAE8E8', color: '#943030', border: '#D48080' },
};

export default function PatternList({ patterns, onDelete }: PatternListProps) {
  const [previewPattern, setPreviewPattern] = useState<Pattern | null>(null);

  if (patterns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
        <p>Aucun patron pour l&apos;instant.<br/>Commencez par en ajouter un !</p>
      </div>
    );
  }

  return (
    <>
    {/* ── Modal visualisateur PDF ───────────────────────────────── */}
    {previewPattern?.pdfDataUrl && (
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(61,36,24,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        onClick={e => { if (e.target === e.currentTarget) setPreviewPattern(null); }}
      >
        <div style={{
          backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)', borderRadius: '12px',
          width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(61,36,24,.3)', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--mauve-pale)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--mauve)', fontSize: '1rem' }}>
              📄 {previewPattern.name}
            </span>
            <button onClick={() => setPreviewPattern(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--brun-mid)' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
            {previewPattern.pdfDataUrl.startsWith('data:application/pdf') ? (
              <iframe
                src={previewPattern.pdfDataUrl}
                style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '6px' }}
                title={previewPattern.name}
              />
            ) : (
              <img
                src={previewPattern.pdfDataUrl}
                alt={previewPattern.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto', borderRadius: '6px', border: '1.5px solid var(--mauve-pale)' }}
              />
            )}
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patterns.map((pattern) => {
        const ds = difficultyStyle[pattern.difficulty] ?? difficultyStyle.moyen;

        return (
          <div key={pattern.id} className="item-card">
            <div style={{ padding: '16px' }}>

              {/* En-tête */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '1rem', color: 'var(--brun)', margin: 0, marginBottom: '2px' }}>
                    {pattern.name}
                  </h4>
                  {/* Créatrice */}
                  {pattern.designer && (
                    <p style={{ color: 'var(--mauve)', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>
                      ✦ {pattern.designer}
                    </p>
                  )}
                  <p style={{ color: 'var(--brun-mid)', fontSize: '0.78rem', margin: 0, marginTop: '2px', textTransform: 'capitalize' }}>
                    {pattern.clothingType}
                  </p>
                </div>

                {/* Badge difficulté */}
                <span style={{
                  flexShrink: 0, padding: '3px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 'bold',
                  backgroundColor: ds.bg, color: ds.color, border: `1px solid ${ds.border}`,
                  fontFamily: 'Georgia, serif',
                }}>
                  {pattern.difficulty}
                </span>
              </div>

              {/* Dimensions */}
              {(pattern.width > 0 || pattern.height > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--brun-mid)' }}>Dimensions</span>
                  <span style={{ color: 'var(--brun)', fontWeight: 600 }}>
                    {pattern.width.toFixed(0)} × {pattern.height.toFixed(0)} cm
                  </span>
                </div>
              )}

              {/* Notes */}
              {pattern.notes && (
                <div style={{ backgroundColor: 'var(--linen)', border: '1px solid var(--mauve-pale)', borderRadius: '5px', padding: '7px 10px', fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', marginBottom: '10px' }}>
                  {pattern.notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {pattern.pdfDataUrl && (
                  <button
                    onClick={() => setPreviewPattern(pattern)}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                      border: '1.5px solid var(--mauve-light)', backgroundColor: 'var(--mauve-pale)',
                      color: 'var(--mauve)', fontFamily: 'Georgia, serif',
                    }}>
                    📄 Voir le patron
                  </button>
                )}
                <button className="btn-danger" onClick={() => onDelete(pattern.id)}>
                  🗑 Supprimer
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
