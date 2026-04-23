'use client';

import { useState, useEffect, useRef } from 'react';
import { Fabric, Pattern } from '@/types';
import VisualizationCanvas from './VisualizationCanvas';

export default function PatternFitter() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [canFit, setCanFit] = useState<boolean | null>(null);
  const [rotations, setRotations] = useState({ horizontal: false, vertical: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Charger les données depuis localStorage
  useEffect(() => {
    const savedFabrics = localStorage.getItem('fabrics');
    const savedPatterns = localStorage.getItem('patterns');
    if (savedFabrics) setFabrics(JSON.parse(savedFabrics));
    if (savedPatterns) setPatterns(JSON.parse(savedPatterns));
  }, []);

  const checkFit = () => {
    if (!selectedFabric || !selectedPattern) {
      alert('Veuillez sélectionner un tissu et un patron');
      return;
    }

    const fabric = fabrics.find((f) => f.id === selectedFabric);
    const pattern = patterns.find((p) => p.id === selectedPattern);

    if (!fabric || !pattern) return;

    // Vérifier l'ajustement
    const horizontalFit = pattern.width <= fabric.width && pattern.height <= fabric.height;
    const verticalFit = pattern.width <= fabric.height && pattern.height <= fabric.width;

    setCanFit(horizontalFit || verticalFit);
    setRotations({
      horizontal: horizontalFit,
      vertical: verticalFit,
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">📐 Testeur de Patron</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de sélection */}
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg">
          <h4 className="font-bold text-lg mb-4">Sélectionner</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tissu
              </label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Sélectionner un tissu --</option>
                {fabrics.map((fabric) => (
                  <option key={fabric.id} value={fabric.id}>
                    {fabric.name} ({fabric.width.toFixed(0)} × {fabric.height.toFixed(0)} cm)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patron
              </label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Sélectionner un patron --</option>
                {patterns.map((pattern) => (
                  <option key={pattern.id} value={pattern.id}>
                    {pattern.name} ({pattern.width.toFixed(0)} × {pattern.height.toFixed(0)} cm)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={checkFit}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Vérifier l'ajustement
            </button>
          </div>

          {canFit !== null && (
            <div className={`mt-6 p-4 rounded-lg ${canFit ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
              <p className={`font-bold ${canFit ? 'text-green-800' : 'text-red-800'}`}>
                {canFit ? '✅ Le patron rentre!' : '❌ Le patron ne rentre pas'}
              </p>

              {canFit && (
                <div className="mt-3 text-sm text-gray-700">
                  <p className="font-medium mb-2">Orientations possibles:</p>
                  <ul className="space-y-1">
                    {rotations.horizontal && (
                      <li>✓ Horizontal (pas de rotation)</li>
                    )}
                    {rotations.vertical && (
                      <li>✓ Vertical (90° de rotation)</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-600">
                {selectedFabric && selectedPattern && (() => {
                  const fabric = fabrics.find((f) => f.id === selectedFabric);
                  const pattern = patterns.find((p) => p.id === selectedPattern);
                  return (
                    <>
                      <p>Tissu: {fabric?.width.toFixed(0)} × {fabric?.height.toFixed(0)} cm</p>
                      <p>Patron: {pattern?.width.toFixed(0)} × {pattern?.height.toFixed(0)} cm</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Visualisation 2D */}
        <div className="lg:col-span-2">
          {selectedFabric && selectedPattern && (
            <VisualizationCanvas
              fabric={fabrics.find((f) => f.id === selectedFabric)!}
              pattern={patterns.find((p) => p.id === selectedPattern)!}
              canFit={canFit}
              rotations={rotations}
            />
          )}
        </div>
      </div>
    </div>
  );
}
