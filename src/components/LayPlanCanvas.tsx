'use client';

import { useEffect, useRef } from 'react';

export interface PatternPiece {
  name: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  onFold: boolean;   // si vrai : doubler la largeur (couper sur le pli = demi-pièce)
}

export interface PlacedPiece {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  colorIdx: number;
}

/** Algorithme de Strip Packing (Next Fit Decreasing Height) */
export function computeLayPlan(
  pieces: PatternPiece[],
  fabricWidthCm: number,
  seamMarginCm = 1.5
): { placed: PlacedPiece[]; totalLengthCm: number; warnings: string[] } {
  const warnings: string[] = [];
  const expanded: { name: string; w: number; h: number; originalIdx: number }[] = [];

  pieces.forEach((p, idx) => {
    const w = p.onFold ? p.widthCm * 2 : p.widthCm;
    if (w > fabricWidthCm) {
      warnings.push(`"${p.name}" (${w.toFixed(0)} cm) dépasse la laize du tissu (${fabricWidthCm.toFixed(0)} cm).`);
    }
    for (let q = 0; q < Math.max(1, p.quantity); q++) {
      expanded.push({ name: p.name, w, h: p.heightCm, originalIdx: idx });
    }
  });

  /* Trier par hauteur décroissante */
  expanded.sort((a, b) => b.h - a.h);

  const placed: PlacedPiece[] = [];
  let shelfX = 0, shelfY = 0, shelfH = 0;

  expanded.forEach((ep) => {
    if (ep.w > fabricWidthCm) return; // trop large, on saute
    if (shelfX + ep.w > fabricWidthCm) {
      /* Nouvelle rangée */
      shelfY += shelfH + seamMarginCm;
      shelfX  = 0;
      shelfH  = 0;
    }
    placed.push({ name: ep.name, x: shelfX, y: shelfY, w: ep.w, h: ep.h, colorIdx: ep.originalIdx });
    shelfX += ep.w + seamMarginCm;
    shelfH  = Math.max(shelfH, ep.h);
  });

  const totalLengthCm = shelfY + shelfH + seamMarginCm * 2;
  return { placed, totalLengthCm, warnings };
}

/* Palette de couleurs couture */
const PALETTE = [
  { bg: 'rgba(196,136,154,.42)', border: '#7A4F5C' },
  { bg: 'rgba(160,192,144,.42)', border: '#5A7A4F' },
  { bg: 'rgba(184,135,42,.38)',  border: '#9A7020' },
  { bg: 'rgba(100,149,200,.40)', border: '#4A6A9C' },
  { bg: 'rgba(200,120,100,.40)', border: '#9C5040' },
  { bg: 'rgba(160,120,200,.40)', border: '#7A4A9C' },
  { bg: 'rgba(80,160,160,.40)',  border: '#3A8080' },
  { bg: 'rgba(220,160,80,.40)',  border: '#A07030' },
];

interface LayPlanCanvasProps {
  pieces: PatternPiece[];
  fabricWidthCm: number;
  fabricColor?: string;
}

export default function LayPlanCanvas({ pieces, fabricWidthCm, fabricColor = '#EDD9E0' }: LayPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { placed, totalLengthCm, warnings } = computeLayPlan(pieces, fabricWidthCm);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CW = 560;
    const scale = CW / fabricWidthCm;
    const CH = Math.max(200, Math.round(totalLengthCm * scale) + 40);

    canvas.width  = CW;
    canvas.height = CH;

    /* Fond */
    ctx.fillStyle = '#FDFAF2';
    ctx.fillRect(0, 0, CW, CH);

    /* Tissu */
    ctx.fillStyle = fabricColor;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, CW, Math.round(totalLengthCm * scale));
    ctx.globalAlpha = 1;

    /* Grille cm (tous les 10 cm) */
    ctx.strokeStyle = 'rgba(196,136,154,.18)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CW; x += 10 * scale) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
    }
    for (let y = 0; y < CH; y += 10 * scale) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
    }

    /* Bordure lisières */
    ctx.strokeStyle = '#7A4F5C';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CW, Math.round(totalLengthCm * scale));

    /* Pièces */
    placed.forEach((p) => {
      const col = PALETTE[p.colorIdx % PALETTE.length];
      const px = Math.round(p.x * scale);
      const py = Math.round(p.y * scale);
      const pw = Math.round(p.w * scale);
      const ph = Math.round(p.h * scale);

      /* Fond pièce */
      ctx.fillStyle = col.bg;
      ctx.fillRect(px, py, pw, ph);

      /* Bordure solide */
      ctx.strokeStyle = col.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, py, pw, ph);

      /* Ligne de coupe (tirets intérieurs) */
      ctx.strokeStyle = col.border;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.setLineDash([]);

      /* Label */
      const fontSize = Math.max(9, Math.min(13, pw / 6));
      ctx.fillStyle = col.border;
      ctx.font = `bold ${fontSize}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      /* Tronquer le label si trop grand */
      const label = p.w < 15 ? p.name.charAt(0) : p.name;
      const maxLabelW = pw - 8;
      let displayLabel = label;
      while (ctx.measureText(displayLabel).width > maxLabelW && displayLabel.length > 1) {
        displayLabel = displayLabel.slice(0, -1);
      }
      if (displayLabel !== label) displayLabel += '…';

      if (ph > 14) {
        ctx.fillText(displayLabel, px + pw / 2, py + ph / 2);
      }

      /* Dimensions */
      if (pw > 40 && ph > 26) {
        ctx.font = `${Math.max(8, fontSize - 2)}px Georgia, serif`;
        ctx.fillStyle = col.border;
        ctx.globalAlpha = 0.7;
        ctx.fillText(`${p.w.toFixed(0)}×${p.h.toFixed(0)}`, px + pw / 2, py + ph / 2 + fontSize);
        ctx.globalAlpha = 1;
      }
    });

    /* Règle verticale (longueur) */
    ctx.fillStyle = 'rgba(61,36,24,.55)';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let cm = 0; cm <= totalLengthCm; cm += 20) {
      const y = Math.round(cm * scale);
      ctx.beginPath(); ctx.moveTo(CW - 18, y); ctx.lineTo(CW, y);
      ctx.strokeStyle = 'rgba(61,36,24,.4)'; ctx.lineWidth = 0.8; ctx.stroke();
      if (cm > 0) ctx.fillText(`${cm}`, CW - 20, y);
    }

    /* Légende en bas */
    ctx.font = '11px Georgia, serif';
    ctx.fillStyle = '#3D2418';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `Laize ${fabricWidthCm.toFixed(0)} cm   ·   Métrage estimé : ${(totalLengthCm / 100).toFixed(2)} m`,
      CW / 2, CH - 4
    );

  }, [placed, totalLengthCm, fabricWidthCm, fabricColor]);

  return (
    <div>
      {warnings.length > 0 && (
        <div style={{ backgroundColor: '#FAF0E0', border: '1px solid #D4B86A', borderRadius: '7px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.82rem', color: '#7A5A10' }}>
          ⚠️ {warnings.join(' ')}
        </div>
      )}

      {/* Résumé */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: 'var(--mauve-pale)', border: '1px solid var(--mauve-light)', borderRadius: '7px', padding: '8px 16px' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--brun-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Métrage estimé</p>
          <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: 'var(--mauve)' }}>
            {(totalLengthCm / 100).toFixed(2)} m
          </p>
        </div>
        <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '7px', padding: '8px 16px' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#3A6A40', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Laize</p>
          <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#2E7A46' }}>
            {fabricWidthCm.toFixed(0)} cm
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--linen)', border: '1px solid var(--mauve-pale)', borderRadius: '7px', padding: '8px 16px' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--brun-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pièces placées</p>
          <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: 'var(--brun)' }}>
            {placed.length}
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <canvas ref={canvasRef} style={{ border: '2px solid var(--mauve-light)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}/>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontStyle: 'italic', marginTop: '8px', textAlign: 'center' }}>
        Placement par rectangles englobants — le métrage réel peut varier selon la forme exacte des pièces.
      </p>
    </div>
  );
}
