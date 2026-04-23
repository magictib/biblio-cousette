'use client';

import { useState } from 'react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  fabricName: string;
  patternName: string;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  fabricName,
  patternName,
  onUpdate,
  onDelete,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(project.status);

  const statusIcons = {
    planning: '📋',
    brodage: '🧵',
    decoupe: '✂️',
    couture: '🪡',
    finition: '✨',
    complete: '✅',
  };

  const statusLabels = {
    planning: 'Planning',
    brodage: 'Brodage',
    decoupe: 'Découpe',
    couture: 'Couture',
    finition: 'Finition',
    complete: 'Complète',
  };

  const statusColors = {
    planning: 'bg-blue-100 text-blue-800 border-blue-300',
    brodage: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    decoupe: 'bg-orange-100 text-orange-800 border-orange-300',
    couture: 'bg-purple-100 text-purple-800 border-purple-300',
    finition: 'bg-pink-100 text-pink-800 border-pink-300',
    complete: 'bg-green-100 text-green-800 border-green-300',
  };

  const handleStatusChange = () => {
    onUpdate(project.id, { status: newStatus });
    setIsEditing(false);
  };

  const handleAddPhoto = () => {
    const url = prompt('Entrez l\'URL de la photo:');
    if (url) {
      onUpdate(project.id, {
        photos: [...project.photos, url],
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    onUpdate(project.id, {
      photos: project.photos.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Gallery */}
      <div className="relative bg-gray-100 h-48 overflow-hidden">
        {project.photos.length > 0 ? (
          <div className="flex">
            {project.photos.map((photo, idx) => (
              <div
                key={idx}
                className="relative flex-1 bg-gray-200 group"
              >
                <img
                  src={photo}
                  alt={`${project.name} - Photo ${idx + 1}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <p>Pas de photo</p>
          </div>
        )}
        <button
          onClick={handleAddPhoto}
          className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          📷 Ajouter
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-lg text-gray-900 mb-2">{project.name}</h4>

        {/* Status */}
        <div className="mb-3">
          {isEditing ? (
            <div className="flex gap-2 mb-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="planning">📋 Planning</option>
                <option value="brodage">🧵 Brodage</option>
                <option value="decoupe">✂️ Découpe</option>
                <option value="couture">🪡 Couture</option>
                <option value="finition">✨ Finition</option>
                <option value="complete">✅ Complète</option>
              </select>
              <button
                onClick={handleStatusChange}
                className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewStatus(project.status);
                }}
                className="px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={`w-full px-3 py-2 rounded border-2 font-medium text-sm cursor-pointer hover:opacity-80 ${
                statusColors[project.status]
              }`}
            >
              {statusIcons[project.status]} {statusLabels[project.status]}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <div className="flex justify-between">
            <span>Tissu:</span>
            <span className="font-medium text-gray-900">{fabricName}</span>
          </div>
          <div className="flex justify-between">
            <span>Patron:</span>
            <span className="font-medium text-gray-900">{patternName}</span>
          </div>
          <div className="flex justify-between">
            <span>Créé:</span>
            <span className="font-medium text-gray-900">
              {new Date(project.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Notes */}
        {project.notes && (
          <div className="bg-gray-50 p-2 rounded mb-4 text-xs text-gray-600">
            {project.notes}
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={() => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
              onDelete(project.id);
            }
          }}
          className="w-full px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}
