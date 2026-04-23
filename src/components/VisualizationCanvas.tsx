'use client';

import { useEffect, useRef } from 'react';
import { Fabric, Pattern } from '@/types';

interface VisualizationCanvasProps {
  fabric: Fabric;
  pattern: Pattern;
  canFit: boolean | null;
  rotations: { horizontal: boolean; vertical: boolean };
}

export default function VisualizationCanvas({
  fabric,
  pattern,
  canFit,
  rotations,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions du canvas
    const canvasWidth = 500;
    const canvasHeight = 500;
    const padding = 20;
    const maxWidth = canvasWidth - padding * 2;
    const maxHeight = canvasHeight - padding * 2;

    // Échelle pour faire tenir le tissu dans le canvas
    const scaleX = maxWidth / fabric.width;
    const scaleY = maxHeight / fabric.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledFabricWidth = fabric.width * scale;
    const scaledFabricHeight = fabric.height * scale;

    const fabricX = (canvasWidth - scaledFabricWidth) / 2;
    const fabricY = (canvasHeight - scaledFabricHeight) / 2;

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grille légère
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (canvasWidth / 10) * i;
      const y = (canvasHeight / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Dessiner le tissu
    ctx.fillStyle = fabric.color;
    ctx.fillRect(fabricX, fabricY, scaledFabricWidth, scaledFabricHeight);

    // Bordure du tissu
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(fabricX, fabricY, scaledFabricWidth, scaledFabricHeight);

    // Motif si disponible (simple texture)
    if (fabric.pattern) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let x = fabricX; x < fabricX + scaledFabricWidth; x += 20) {
        for (let y = fabricY; y < fabricY + scaledFabricHeight; y += 20) {
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }

    // Dessiner le patron si possible
    if (canFit) {
      const scaledPatternWidth = pattern.width * scale;
      const scaledPatternHeight = pattern.height * scale;

      // Positionner le patron au centre du tissu
      let patternX = fabricX + (scaledFabricWidth - scaledPatternWidth) / 2;
      let patternY = fabricY + (scaledFabricHeight - scaledPatternHeight) / 2;

      // Vérifier quelle orientation utiliser
      let patternW = scaledPatternWidth;
      let patternH = scaledPatternHeight;

      if (rotations.horizontal && !rotations.vertical) {
        // Horizontal uniquement
      } else if (rotations.vertical && !rotations.horizontal) {
        // Vertical uniquement - rotation de 90°
        patternW = scaledPatternHeight;
        patternH = scaledPatternWidth;
        patternX = fabricX + (scaledFabricWidth - patternW) / 2;
        patternY = fabricY + (scaledFabricHeight - patternH) / 2;
      }

      // Patron avec couleur semi-transparente
      ctx.fillStyle = '#a78bfa';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(patternX, patternY, patternW, patternH);
      ctx.globalAlpha = 1;

      // Bordure du patron
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(patternX, patternY, patternW, patternH);
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';

    // Label tissu
    ctx.fillText(
      `Tissu: ${fabric.width.toFixed(0)} × ${fabric.height.toFixed(0)} cm`,
      canvasWidth / 2,
      canvasHeight - 10
    );

    // Label patron si ajusté
    if (canFit && rotations) {
      ctx.font = '11px Arial';
      ctx.fillStyle = '#7c3aed';
      const orientations = [];
      if (rotations.horizontal) orientations.push('H');
      if (rotations.vertical) orientations.push('V');
      ctx.fillText(
        `Patron (${orientations.join('/')}): ${pattern.width.toFixed(0)} × ${pattern.height.toFixed(0)} cm`,
        canvasWidth / 2,
        20
      );
    }
  }, [fabric, pattern, canFit, rotations]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h4 className="font-bold text-lg mb-4">Visualisation 2D</h4>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="border-2 border-gray-300 rounded-lg bg-white shadow-md"
        />
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center">
        {canFit ? (
          <span className="text-green-700">
            ✅ Le patron peut être placé sur le tissu
          </span>
        ) : canFit === false ? (
          <span className="text-red-700">
            ❌ Le patron est trop grand pour ce tissu
          </span>
        ) : (
          <span className="text-gray-500">
            Sélectionnez un tissu et un patron pour voir la visualisation
          </span>
        )}
      </p>
    </div>
  );
}
