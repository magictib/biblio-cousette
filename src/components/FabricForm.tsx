'use client';

import { useState } from 'react';
import { Fabric } from '@/types';

interface FabricFormProps {
  onSubmit: (fabric: Omit<Fabric, 'id'>) => void;
}

export default function FabricForm({ onSubmit }: FabricFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    width: 150,
    height: 100,
    quantity: 1,
    type: 'coton',
    pattern: '',
    notes: '',
  });

  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir les pouces en cm si nécessaire
    const width = unit === 'inch' ? formData.width * 2.54 : formData.width;
    const height = unit === 'inch' ? formData.height * 2.54 : formData.height;

    onSubmit({
      ...formData,
      width,
      height,
    });

    // Réinitialiser le formulaire
    setFormData({
      name: '',
      color: '#000000',
      width: 150,
      height: 100,
      quantity: 1,
      type: 'coton',
      pattern: '',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-bold text-lg mb-4">Ajouter un nouveau tissu</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du tissu
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Lin Bleu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de tissu
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option>coton</option>
            <option>lin</option>
            <option>jersey</option>
            <option>soie</option>
            <option>laine</option>
            <option>autres</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Couleur
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motif
          </label>
          <input
            type="text"
            value={formData.pattern}
            onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Rayures"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimensions
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité (en m²)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
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
          placeholder="Notes supplémentaires"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
      >
        Ajouter le tissu
      </button>
    </form>
  );
}
