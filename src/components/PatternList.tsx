'use client';

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
  if (patterns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
        <p>Aucun patron pour l&apos;instant.<br/>Commencez par en ajouter un !</p>
      </div>
    );
  }

  return (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' }}>
                <span style={{ color: 'var(--brun-mid)' }}>Dimensions</span>
                <span style={{ color: 'var(--brun)', fontWeight: 600 }}>
                  {pattern.width.toFixed(0)} × {pattern.height.toFixed(0)} cm
                </span>
              </div>

              {/* Notes */}
              {pattern.notes && (
                <div style={{ backgroundColor: 'var(--linen)', border: '1px solid var(--mauve-pale)', borderRadius: '5px', padding: '7px 10px', fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', marginBottom: '10px' }}>
                  {pattern.notes}
                </div>
              )}

              <button className="btn-danger" onClick={() => onDelete(pattern.id)}>
                🗑 Supprimer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
