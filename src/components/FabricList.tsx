'use client';

import { Fabric } from '@/types';

interface FabricListProps {
  fabrics: Fabric[];
  onDelete: (id: string) => void;
}

export default function FabricList({ fabrics, onDelete }: FabricListProps) {
  if (fabrics.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: 'var(--brun-mid)',
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧵</div>
        <p>Aucun tissu pour l&apos;instant.<br/>Commencez par en ajouter un !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fabrics.map((fabric) => (
        <div key={fabric.id} className="item-card">
          <div style={{ padding: '16px' }}>

            {/* En-tête : nom + nuancier */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: 'var(--brun)',
                  margin: 0,
                  marginBottom: '2px',
                }}>
                  {fabric.name}
                </h4>
                <p style={{ color: 'var(--brun-mid)', fontSize: '0.8rem', margin: 0, textTransform: 'capitalize' }}>
                  {fabric.type}
                </p>
              </div>

              {/* Nuancier avec surpiqûre */}
              <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: fabric.color,
                border: '2px solid var(--mauve-light)',
                borderRadius: '5px',
                flexShrink: 0,
                boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.3)',
                position: 'relative',
              }}>
                {/* Petit tiret de surpiqûre en coin */}
                <div style={{
                  position: 'absolute', inset: '3px',
                  border: '1px dashed rgba(255,255,255,0.4)',
                  borderRadius: '2px',
                  pointerEvents: 'none',
                }}/>
              </div>
            </div>

            {/* Détails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
              {[
                ['Dimensions', `${fabric.width.toFixed(0)} × ${fabric.height.toFixed(0)} cm`],
                ['Quantité',   `${fabric.quantity} m²`],
                ...(fabric.pattern ? [['Motif', fabric.pattern] as [string, string]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--brun-mid)' }}>{label}</span>
                  <span style={{ color: 'var(--brun)', fontWeight: '600' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            {fabric.notes && (
              <div style={{
                backgroundColor: 'var(--linen)',
                border: '1px solid var(--mauve-pale)',
                borderRadius: '5px',
                padding: '8px 10px',
                fontSize: '0.78rem',
                color: 'var(--brun-mid)',
                fontStyle: 'italic',
                marginBottom: '12px',
              }}>
                {fabric.notes}
              </div>
            )}

            {/* Bouton supprimer */}
            <button className="btn-danger" onClick={() => onDelete(fabric.id)}>
              🗑 Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
