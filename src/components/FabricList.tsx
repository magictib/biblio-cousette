'use client';

import { Fabric } from '@/types';

interface FabricListProps {
  fabrics: Fabric[];
  onDelete: (id: string) => void;
}

export default function FabricList({ fabrics, onDelete }: FabricListProps) {
  if (fabrics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun tissu ajouté. Commencez par en ajouter un!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fabrics.map((fabric) => (
        <div
          key={fabric.id}
          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{fabric.name}</h4>
                <p className="text-sm text-gray-600">{fabric.type}</p>
              </div>
              <div
                className="w-12 h-12 border-2 border-gray-300 rounded"
                style={{ backgroundColor: fabric.color }}
              />
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">{fabric.width.toFixed(0)} × {fabric.height.toFixed(0)} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantité:</span>
                <span className="font-medium">{fabric.quantity} m²</span>
              </div>
              {fabric.pattern && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Motif:</span>
                  <span className="font-medium">{fabric.pattern}</span>
                </div>
              )}
            </div>

            {fabric.notes && (
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3">
                {fabric.notes}
              </p>
            )}

            <button
              onClick={() => onDelete(fabric.id)}
              className="w-full px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
