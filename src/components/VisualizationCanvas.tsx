'use client';

import { useEffect, useRef } from 'react';
import { Fabric, Pattern } from '@/types';

interface VisualizationCanvasProps {
  fabric: Fabric;
  pattern: Pattern;
  canFit: boolean | null;
  rotations: { horizontal: boolean; vertical: boolean };
}

export default function VisualizationCanvas({ fabric, pattern, canFit, rotations }: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CW = 500, CH = 500, PAD = 20;
    const maxW = CW - PAD * 2;
    const maxH = CH - PAD * 2;

    /* length est en mètres → convertir en cm pour le canvas */
    const fabricW = fabric.width;
    const fabricH = fabric.length * 100;

    const scale = Math.min(maxW / fabricW, maxH / fabricH);
    const sfw   = fabricW * scale;
    const sfh   = fabricH * scale;
    const fx    = (CW - sfw) / 2;
    const fy    = (CH - sfh) / 2;

    /* Fond */
    ctx.fillStyle = '#FDFAF2';
    ctx.fillRect(0, 0, CW, CH);

    /* Grille papier patron */
    ctx.strokeStyle = 'rgba(196,136,154,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (CW / 10) * i, y = (CH / 10) * i;
      ctx.beginPath(); ctx.moveTo(x, 0);  ctx.lineTo(x, CH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y);  ctx.lineTo(CW, y); ctx.stroke();
    }

    /* Tissu */
    ctx.fillStyle = fabric.color;
    ctx.fillRect(fx, fy, sfw, sfh);

    /* Bordure tissu */
    ctx.strokeStyle = 'var(--mauve, #7A4F5C)';
    ctx.lineWidth = 2;
    ctx.strokeRect(fx, fy, sfw, sfh);

    /* Motif (hachures légères) */
    if (fabric.pattern) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let x = fx; x < fx + sfw; x += 16)
        for (let y = fy; y < fy + sfh; y += 16)
          ctx.fillRect(x, y, 8, 8);
    }

    /* Patron si ajusté */
    if (canFit) {
      let pw = pattern.width * scale;
      let ph = pattern.height * scale;

      if (rotations.vertical && !rotations.horizontal) {
        [pw, ph] = [ph, pw];
      }

      const px = fx + (sfw - pw) / 2;
      const py = fy + (sfh - ph) / 2;

      ctx.fillStyle = 'rgba(196,136,154,0.45)';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(px, py, pw, ph);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#7A4F5C';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(px, py, pw, ph);
      ctx.setLineDash([]);
    }

    /* Labels */
    ctx.fillStyle = '#3D2418';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Tissu : ${fabricW.toFixed(0)} cm × ${fabricH.toFixed(0)} cm`,
      CW / 2, CH - 8
    );

    if (canFit) {
      ctx.font = '11px Georgia, serif';
      ctx.fillStyle = '#7A4F5C';
      const ori = [rotations.horizontal && 'sans rotation', rotations.vertical && '90°'].filter(Boolean).join(' / ');
      ctx.fillText(
        `Patron ${pattern.width.toFixed(0)} × ${pattern.height.toFixed(0)} cm — ${ori}`,
        CW / 2, 18
      );
    }
  }, [fabric, pattern, canFit, rotations]);

  return (
    <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '20px' }}>
      <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', margin: '0 0 16px' }}>
        Visualisation 2D
      </h4>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas ref={canvasRef} width={500} height={500}
          style={{ border: '2px solid var(--mauve-light)', borderRadius: '8px', backgroundColor: 'var(--creme)', boxShadow: '0 2px 8px rgba(122,79,92,.1)' }} />
      </div>
      <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'Georgia, serif',
        color: canFit ? '#2E7A46' : canFit === false ? '#943030' : 'var(--brun-mid)' }}>
        {canFit
          ? '✅ Le patron peut être placé sur ce tissu'
          : canFit === false
          ? '❌ Le patron est trop grand pour ce tissu'
          : 'Sélectionnez un tissu et un patron pour voir la visualisation'}
      </p>
    </div>
  );
}
