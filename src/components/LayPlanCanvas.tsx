'use client';

import { useEffect, useRef } from 'react';

export interface PatternPiece {
  name: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  onFold: boolean;
  grainLine?: 'vertical' | 'horizontal' | 'bias' | 'any';
  needsMatching?: boolean;
  areaCm2?: number;
  shape?: 'rectangle' | 'trapeze' | 'triangle' | 'curved' | 'irregular';
}

export interface FabricConstraints {
  hasNap: boolean;         // velours, jersey directionnel, fourrure synth…
  patternRepeatH: number;  // rapport horizontal en cm  (0 = pas de contrainte)
  patternRepeatV: number;  // rapport vertical en cm
}

export interface PlacedPiece {
  name: string;
  x: number; y: number;
  w: number; h: number;   // dimensions réelles
  ew: number; eh: number; // dimensions effectives (avec marge raccord)
  colorIdx: number;
  areaCm2?: number;
  shape?: string;
  grainLine?: string;
  needsMatching: boolean;
}

/** Strip Packing NFDH avec gestion des raccords de motifs */
export function computeLayPlan(
  pieces: PatternPiece[],
  fabricWidthCm: number,
  seamMarginCm = 1.5,
  constraints: FabricConstraints = { hasNap: false, patternRepeatH: 0, patternRepeatV: 0 },
): { placed: PlacedPiece[]; totalLengthCm: number; warnings: string[]; totalPiecesAreaCm2: number } {
  const { patternRepeatH: RH, patternRepeatV: RV } = constraints;
  const warnings: string[] = [];

  const expanded: {
    name: string; w: number; h: number; ew: number; eh: number;
    originalIdx: number; areaCm2?: number; shape?: string;
    grainLine?: string; needsMatching: boolean;
  }[] = [];

  pieces.forEach((p, idx) => {
    const w = p.onFold ? p.widthCm * 2 : p.widthCm;
    const h = p.heightCm;
    const matching = !!p.needsMatching;
    // Dimensions effectives : arrondies au rapport supérieur pour le raccord
    const ew = (matching && RH > 0) ? Math.ceil(w / RH) * RH : w;
    const eh = (matching && RV > 0) ? Math.ceil(h / RV) * RV : h;
    const estimatedArea = p.areaCm2 ?? (p.widthCm * p.heightCm * 0.85);

    if (ew > fabricWidthCm) {
      warnings.push(`"${p.name}" (${ew.toFixed(0)} cm) dépasse la laize (${fabricWidthCm.toFixed(0)} cm).`);
    }
    for (let q = 0; q < Math.max(1, p.quantity); q++) {
      expanded.push({ name: p.name, w, h, ew, eh, originalIdx: idx, areaCm2: estimatedArea, shape: p.shape, grainLine: p.grainLine, needsMatching: matching });
    }
  });

  expanded.sort((a, b) => b.eh - a.eh);

  const placed: PlacedPiece[] = [];
  let shelfX = 0, shelfY = 0, shelfEH = 0;

  expanded.forEach(ep => {
    if (ep.ew > fabricWidthCm) return;
    if (shelfX + ep.ew > fabricWidthCm) {
      shelfY += shelfEH + seamMarginCm;
      shelfX = 0;
      shelfEH = 0;
    }
    placed.push({ name: ep.name, x: shelfX, y: shelfY, w: ep.w, h: ep.h, ew: ep.ew, eh: ep.eh, colorIdx: ep.originalIdx, areaCm2: ep.areaCm2, shape: ep.shape, grainLine: ep.grainLine, needsMatching: ep.needsMatching });
    shelfX += ep.ew + seamMarginCm;
    shelfEH = Math.max(shelfEH, ep.eh);
  });

  const totalLengthCm = shelfY + shelfEH + seamMarginCm * 2;
  const totalPiecesAreaCm2 = placed.reduce((sum, p) => sum + (p.areaCm2 ?? p.w * p.h), 0);
  return { placed, totalLengthCm, warnings, totalPiecesAreaCm2 };
}

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

function drawShape(ctx: CanvasRenderingContext2D, shape: string | undefined, px: number, py: number, pw: number, ph: number) {
  ctx.beginPath();
  switch (shape) {
    case 'trapeze':
      ctx.moveTo(px + pw * 0.12, py); ctx.lineTo(px + pw * 0.88, py);
      ctx.lineTo(px + pw, py + ph); ctx.lineTo(px, py + ph); ctx.closePath(); break;
    case 'triangle':
      ctx.moveTo(px + pw / 2, py); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px, py + ph); ctx.closePath(); break;
    case 'curved':
      ctx.moveTo(px + pw * 0.25, py);
      ctx.quadraticCurveTo(px + pw / 2, py + ph * 0.12, px + pw * 0.75, py);
      ctx.lineTo(px + pw, py + ph); ctx.lineTo(px, py + ph); ctx.closePath(); break;
    default:
      ctx.rect(px, py, pw, ph); break;
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const hl = 7;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6));
  ctx.closePath(); ctx.fill();
}

interface LayPlanCanvasProps {
  pieces: PatternPiece[];
  fabricWidthCm: number;
  fabricColor?: string;
  constraints?: FabricConstraints;
}

export default function LayPlanCanvas({ pieces, fabricWidthCm, fabricColor = '#EDD9E0', constraints }: LayPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cons = constraints ?? { hasNap: false, patternRepeatH: 0, patternRepeatV: 0 };

  const { placed, totalLengthCm, warnings, totalPiecesAreaCm2 } = computeLayPlan(pieces, fabricWidthCm, 1.5, cons);
  const totalFabricAreaCm2 = fabricWidthCm * totalLengthCm;
  const efficiency = totalFabricAreaCm2 > 0 ? Math.round((totalPiecesAreaCm2 / totalFabricAreaCm2) * 100) : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CW = 560;
    const scale = CW / fabricWidthCm;
    const fabricH = Math.max(60, Math.round(totalLengthCm * scale));
    const CH = fabricH + 40;

    canvas.width = CW;
    canvas.height = CH;

    // Fond
    ctx.fillStyle = '#FDFAF2';
    ctx.fillRect(0, 0, CW, CH);

    // Tissu
    ctx.fillStyle = fabricColor;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, CW, fabricH);
    ctx.globalAlpha = 1;

    const { patternRepeatH: RH, patternRepeatV: RV, hasNap } = cons;

    // Grille de rapport de motif
    if (RV > 0) {
      ctx.strokeStyle = 'rgba(80,40,140,.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      for (let y = RV * scale; y < fabricH; y += RV * scale) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (RH > 0) {
      ctx.strokeStyle = 'rgba(80,40,140,.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      for (let x = RH * scale; x < CW; x += RH * scale) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, fabricH); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Flèches sens du poil
    if (hasNap) {
      ctx.strokeStyle = 'rgba(80,40,140,.22)';
      ctx.fillStyle = 'rgba(80,40,140,.22)';
      const spacing = 55;
      const aLen = 22;
      for (let x = spacing / 2; x < CW - 10; x += spacing) {
        const my = fabricH / 2;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, my - aLen / 2); ctx.lineTo(x, my + aLen / 2); ctx.stroke();
        const hl = 5;
        ctx.beginPath();
        ctx.moveTo(x, my + aLen / 2);
        ctx.lineTo(x - hl * 0.6, my + aLen / 2 - hl);
        ctx.lineTo(x + hl * 0.6, my + aLen / 2 - hl);
        ctx.closePath(); ctx.fill();
      }
    }

    // Grille de fond (tous les 10 cm)
    ctx.strokeStyle = 'rgba(196,136,154,.18)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CW; x += 10 * scale) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
    }
    for (let y = 0; y < CH; y += 10 * scale) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
    }

    // Bordure tissu
    ctx.strokeStyle = '#7A4F5C';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(0, 0, CW, fabricH);

    // Pièces
    placed.forEach(p => {
      const col = PALETTE[p.colorIdx % PALETTE.length];
      const px = Math.round(p.x * scale);
      const py = Math.round(p.y * scale);
      const pw = Math.round(p.w * scale);
      const ph = Math.round(p.h * scale);
      const pew = Math.round(p.ew * scale);
      const peh = Math.round(p.eh * scale);

      // Zone de gaspillage raccord (hachurée)
      if (p.needsMatching && (pew > pw || peh > ph)) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = col.border;
        const step = 6;
        if (peh > ph) {
          for (let hy = ph; hy < peh; hy += step) ctx.fillRect(px, py + hy, pew, step * 0.5);
        }
        if (pew > pw) {
          for (let hy = 0; hy < ph; hy += step) ctx.fillRect(px + pw, py + hy, pew - pw, step * 0.5);
        }
        ctx.restore();
      }

      // Fond pièce
      ctx.fillStyle = col.bg;
      drawShape(ctx, p.shape, px, py, pw, ph);
      ctx.fill();

      // Contour
      ctx.strokeStyle = col.border;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      drawShape(ctx, p.shape, px, py, pw, ph);
      ctx.stroke();

      // Ligne de coupe (tirets intérieurs)
      ctx.strokeStyle = col.border;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.setLineDash([]);

      // Droit fil (flèche)
      if (p.grainLine && p.grainLine !== 'any' && pw > 32 && ph > 32) {
        const m = 12, cx = px + pw / 2, cy = py + ph / 2;
        switch (p.grainLine) {
          case 'vertical':   drawArrow(ctx, cx, py + m, cx, py + ph - m, col.border); break;
          case 'horizontal': drawArrow(ctx, px + m, cy, px + pw - m, cy, col.border); break;
          case 'bias':       drawArrow(ctx, px + m, py + m, px + pw - m, py + ph - m, col.border); break;
        }
      }

      // Étiquette
      const cx = px + pw / 2;
      const fontSize = Math.max(9, Math.min(13, pw / 6));
      ctx.fillStyle = col.border;
      ctx.font = `bold ${fontSize}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let lbl = p.name;
      while (ctx.measureText(lbl).width > pw - 8 && lbl.length > 1) lbl = lbl.slice(0, -1);
      if (lbl !== p.name) lbl += '…';
      if (ph > 14) ctx.fillText(lbl, cx, py + ph / 2);
      if (pw > 40 && ph > 26) {
        ctx.font = `${Math.max(8, fontSize - 2)}px Georgia, serif`;
        ctx.globalAlpha = 0.7;
        ctx.fillText(`${p.w.toFixed(0)}×${p.h.toFixed(0)}`, cx, py + ph / 2 + fontSize);
        ctx.globalAlpha = 1;
      }
    });

    // Règle verticale
    ctx.fillStyle = 'rgba(61,36,24,.55)';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let cm = 0; cm <= totalLengthCm; cm += 20) {
      const y = Math.round(cm * scale);
      ctx.strokeStyle = 'rgba(61,36,24,.4)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(CW - 18, y); ctx.lineTo(CW, y); ctx.stroke();
      if (cm > 0) ctx.fillText(`${cm}`, CW - 20, y);
    }

    ctx.font = '11px Georgia, serif';
    ctx.fillStyle = '#3D2418';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `Laize ${fabricWidthCm.toFixed(0)} cm   ·   Métrage estimé : ${(totalLengthCm / 100).toFixed(2)} m   ·   Efficacité : ${efficiency} %`,
      CW / 2, CH - 4,
    );
  }, [placed, totalLengthCm, fabricWidthCm, fabricColor, efficiency, cons]);

  const hasRepeat = cons.patternRepeatH > 0 || cons.patternRepeatV > 0;

  return (
    <div>
      {warnings.length > 0 && (
        <div style={{ backgroundColor: '#FAF0E0', border: '1px solid #D4B86A', borderRadius: '7px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.82rem', color: '#7A5A10' }}>
          ⚠️ {warnings.join(' ')}
        </div>
      )}

      {/* Statistiques */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <StatCard label="Métrage estimé" value={`${(totalLengthCm / 100).toFixed(2)} m`} bg="var(--mauve-pale)" border="var(--mauve-light)" color="var(--mauve)" labelColor="var(--brun-mid)" />
        <StatCard label="Laize" value={`${fabricWidthCm.toFixed(0)} cm`} bg="#E8F5EC" border="#80C894" color="#2E7A46" labelColor="#3A6A40" />
        <StatCard label="Pièces placées" value={String(placed.length)} bg="var(--linen)" border="var(--mauve-pale)" color="var(--brun)" labelColor="var(--brun-mid)" />
        <StatCard label="Efficacité tissu"
          value={`${efficiency} %`}
          bg={efficiency >= 70 ? '#E8F5EC' : efficiency >= 50 ? '#FFF8EC' : '#FAE8E8'}
          border={efficiency >= 70 ? '#80C894' : efficiency >= 50 ? '#E8C97A' : '#D48080'}
          color={efficiency >= 70 ? '#2E7A46' : efficiency >= 50 ? '#7A5A10' : '#943030'}
          labelColor={efficiency >= 70 ? '#3A6A40' : efficiency >= 50 ? '#8A6A10' : '#943030'}
        />
      </div>

      {/* Légende contraintes */}
      {(cons.hasNap || hasRepeat) && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {cons.hasNap && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', backgroundColor: 'rgba(80,40,140,.1)', border: '1px solid rgba(80,40,140,.3)', borderRadius: '10px', fontSize: '0.74rem', color: 'var(--brun-mid)' }}>
              ↓ Sens du poil actif
            </span>
          )}
          {hasRepeat && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', backgroundColor: 'rgba(80,40,140,.1)', border: '1px solid rgba(80,40,140,.3)', borderRadius: '10px', fontSize: '0.74rem', color: 'var(--brun-mid)' }}>
              ⊞ Raccord
              {cons.patternRepeatH > 0 && ` H : ${cons.patternRepeatH} cm`}
              {cons.patternRepeatH > 0 && cons.patternRepeatV > 0 && ' /'}
              {cons.patternRepeatV > 0 && ` V : ${cons.patternRepeatV} cm`}
            </span>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <canvas ref={canvasRef} style={{ border: '2px solid var(--mauve-light)', borderRadius: '8px', display: 'block', maxWidth: '100%' }} />
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontStyle: 'italic', marginTop: '8px', textAlign: 'center' }}>
        Formes approximatives — le métrage réel peut varier.
        {hasRepeat && ' Les zones hachurées représentent le gaspillage dû aux raccords.'}
      </p>
    </div>
  );
}

function StatCard({ label, value, bg, border, color, labelColor }: {
  label: string; value: string; bg: string; border: string; color: string; labelColor: string;
}) {
  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '7px', padding: '8px 14px' }}>
      <p style={{ margin: 0, fontSize: '0.72rem', color: labelColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'Georgia, serif', color }}>{value}</p>
    </div>
  );
}
