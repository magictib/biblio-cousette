'use client';

import { useState } from 'react';
import { Fabric, Pattern, Project } from '@/types';

interface ProjectFormProps {
  fabrics: Fabric[];
  patterns: Pattern[];
  onSubmit: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export default function ProjectForm({ fabrics, patterns, onSubmit }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    fabricId: '',
    patternId: '',
    status: 'planning' as const,
    photos: [] as string[],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.fabricId || !formData.patternId) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    onSubmit({
      name: formData.name,
      fabricId: formData.fabricId,
      patternId: formData.patternId,
      status: formData.status,
      photos: formData.photos,
      notes: formData.notes,
    });

    setFormData({
      name: '',
      fabricId: '',
      patternId: '',
      status: 'planning',
      photos: [],
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-bold text-lg mb-4">Créer un nouveau projet</h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du projet
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Robe d'été bleue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tissu
          </label>
          <select
            required
            value={formData.fabricId}
            onChange={(e) => setFormData({ ...formData, fabricId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Sélectionner --</option>
            {fabrics.map((fabric) => (
              <option key={fabric.id} value={fabric.id}>
                {fabric.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patron
          </label>
          <select
            required
            value={formData.patternId}
            onChange={(e) => setFormData({ ...formData, patternId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Sélectionner --</option>
            {patterns.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Étape initiale
          </label>
          <div className="flex flex-wrap gap-2">
            {['planning', 'brodage', 'decoupe', 'couture', 'finition', 'complete'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status: status as any })}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  formData.status === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'planning' && '📋 Planning'}
                {status === 'brodage' && '🧵 Brodage'}
                {status === 'decoupe' && '✂️ Découpe'}
                {status === 'couture' && '🪡 Couture'}
                {status === 'finition' && '✨ Finition'}
                {status === 'complete' && '✅ Complète'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes du projet
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Notes, ajustements, observations..."
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
      >
        Créer le projet
      </button>
    </form>
  );
}
