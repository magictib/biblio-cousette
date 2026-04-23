'use client';

import { useState } from 'react';
import { Pattern } from '@/types';

interface PatternFormProps {
  onSubmit: (pattern: Omit<Pattern, 'id'>) => void;
}

export default function PatternForm({ onSubmit }: PatternFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    clothingType: 'robe',
    width: 60,
    height: 80,
    difficulty: 'moyen' as const,
    notes: '',
  });

  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const width = unit === 'inch' ? formData.width * 2.54 : formData.width;
    const height = unit === 'inch' ? formData.height * 2.54 : formData.height;

    onSubmit({
      ...formData,
      width,
      height,
    });

    setFormData({
      name: '',
      clothingType: 'robe',
      width: 60,
      height: 80,
      difficulty: 'moyen',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-bold text-lg mb-4">Ajouter un nouveau patron</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du patron
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Robe d'été simple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de vêtement
          </label>
          <select
            value={formData.clothingType}
            onChange={(e) => setFormData({ ...formData, clothingType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option>robe</option>
            <option>t-shirt</option>
            <option>pantalon</option>
            <option>jupe</option>
            <option>veste</option>
            <option>autres</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulté
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimensions du patron
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded ${unit === 'cm' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setUnit('inch')}
              className={`px-3 py-1 rounded ${unit === 'inch' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            >
              pouces
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
              placeholder="Largeur"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
              placeholder="Hauteur"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Notes sur le patron"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
      >
        Ajouter le patron
      </button>
    </form>
  );
}
