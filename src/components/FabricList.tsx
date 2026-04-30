'use client';

import { Fabric } from '@/types';

interface FabricListProps {
  fabrics:  Fabric[];
  onDelete: (id: string) => void;
  onEdit:   (fabric: Fabric) => void;
}

export default function FabricList({ fabrics, onDelete, onEdit }: FabricListProps) {
  if (fabrics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧵</div>
        <p>Aucun tissu pour l&apos;instant.<br/>Commencez par en ajouter un !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fabrics.map((fabric) => {
        const lengthCm = Math.round(fabric.length * 100);

        return (
          <div key={fabric.id} className="item-card">

            {/* ── Photo principale ────────────────────────────────── */}
            {fabric.photos.length > 0 ? (
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden', borderRadius: '7px 7px 0 0', borderBottom: '1px solid var(--mauve-pale)' }}>
                <img
                  src={fabric.photos[0]}
                  alt={fabric.name}
                  style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                />
                {/* Badge chute */}
                {fabric.isScrap && (
                  <span style={{
                    position: 'absolute', top: '8px', left: '8px',
                    backgroundColor: 'var(--mauve)', color: 'var(--creme)',
                    fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px',
                    borderRadius: '10px', fontFamily: 'Georgia, serif',
                  }}>
                    ✂️ Chute
                  </span>
                )}
                {fabric.photos.length > 1 && (
                  <span style={{
                    position: 'absolute', bottom: '6px', right: '8px',
                    backgroundColor: 'rgba(61,36,24,.6)', color: 'white',
                    fontSize: '0.7rem', padding: '2px 7px', borderRadius: '8px',
                  }}>
                    +{fabric.photos.length - 1} photo{fabric.photos.length > 2 ? 's' : ''}
                  </span>
                )}
              </div>
            ) : (
              /* Bandeau couleur si pas de photo */
              <div style={{
                height: '10px',
                backgroundColor: fabric.color,
                borderRadius: '7px 7px 0 0',
                borderBottom: '1px solid var(--mauve-pale)',
              }}>
                {fabric.isScrap && (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--mauve)', color: 'var(--creme)',
                    fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 7px',
                    borderRadius: '0 0 6px 0', fontFamily: 'Georgia, serif',
                    lineHeight: '1.6',
                  }}>
                    ✂️ Chute
                  </span>
                )}
              </div>
            )}

            <div style={{ padding: '14px' }}>

              {/* En-tête */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '1rem', color: 'var(--brun)', margin: 0, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fabric.name}
                  </h4>
                  <p style={{ color: 'var(--brun-mid)', fontSize: '0.78rem', margin: 0, textTransform: 'capitalize' }}>
                    {fabric.type}
                  </p>
                </div>

                {/* Nuancier */}
                {fabric.photos.length === 0 && (
                  <div style={{
                    width: '40px', height: '40px', flexShrink: 0, marginLeft: '8px',
                    backgroundColor: fabric.color,
                    border: '2px solid var(--mauve-light)', borderRadius: '5px',
                    position: 'relative', boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.3)',
                  }}>
                    <div style={{ position: 'absolute', inset: '3px', border: '1px dashed rgba(255,255,255,.4)', borderRadius: '2px', pointerEvents: 'none' }}/>
                  </div>
                )}
              </div>

              {/* Dimensions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                {fabric.isScrap ? (
                  <>
                    {(fabric.width > 0 || lengthCm > 0) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--brun-mid)' }}>Dimensions approx.</span>
                        <span style={{ color: 'var(--brun)', fontWeight: 600 }}>
                          {fabric.width > 0 ? `${fabric.width.toFixed(0)} cm` : '?'} × {lengthCm > 0 ? `${lengthCm} cm` : '?'}
                        </span>
                      </div>
                    )}
                    {fabric.estimatedArea && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--brun-mid)' }}>Surface estimée</span>
                        <span style={{ color: 'var(--sage)', fontWeight: 700 }}>
                          ≈ {fabric.estimatedArea.toLocaleString('fr-FR')} cm²
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--brun-mid)' }}>Laize</span>
                      <span style={{ color: 'var(--brun)', fontWeight: 600 }}>{fabric.width.toFixed(0)} cm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--brun-mid)' }}>Métrage</span>
                      <span style={{ color: 'var(--brun)', fontWeight: 600 }}>{fabric.length.toFixed(2)} m</span>
                    </div>
                  </>
                )}

                {fabric.pattern && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--brun-mid)' }}>Motif</span>
                    <span style={{ color: 'var(--brun)', fontWeight: 600 }}>{fabric.pattern}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {fabric.notes && (
                <div style={{ backgroundColor: 'var(--linen)', border: '1px solid var(--mauve-pale)', borderRadius: '5px', padding: '7px 10px', fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', marginBottom: '10px' }}>
                  {fabric.notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onEdit(fabric)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)', backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.8rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
                <button className="btn-danger" onClick={() => onDelete(fabric.id)}>
                  🗑 Supprimer
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
