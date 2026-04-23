'use client';

import { Pattern } from '@/types';

interface PatternListProps {
  patterns: Pattern[];
  onDelete: (id: string) => void;
}

export default function PatternList({ patterns, onDelete }: PatternListProps) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun patron ajouté. Commencez par en ajouter un!</p>
      </div>
    );
  }

  const difficultyBadge = (level: string) => {
    const colors = {
      facile: 'bg-green-100 text-green-800',
      moyen: 'bg-yellow-100 text-yellow-800',
      difficile: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.moyen;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patterns.map((pattern) => (
        <div
          key={pattern.id}
          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{pattern.name}</h4>
                <p className="text-sm text-gray-600">{pattern.clothingType}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyBadge(pattern.difficulty)}`}>
                {pattern.difficulty}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">{pattern.width.toFixed(0)} × {pattern.height.toFixed(0)} cm</span>
              </div>
            </div>

            {pattern.notes && (
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3">
                {pattern.notes}
              </p>
            )}

            <button
              onClick={() => onDelete(pattern.id)}
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
