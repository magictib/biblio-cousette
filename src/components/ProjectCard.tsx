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

const statusConfig: Record<string, { label: string; icon: string; bg: string; color: string; border: string }> = {
  planning:  { label: 'Planning',  icon: '📋', bg: '#EBF1FA', color: '#3B5EA6', border: '#A8BEE0' },
  brodage:   { label: 'Brodage',   icon: '🧵', bg: '#FAF3E0', color: '#8A6A10', border: '#D4B86A' },
  decoupe:   { label: 'Découpe',   icon: '✂️', bg: '#FBF0E8', color: '#944E1E', border: '#D49070' },
  couture:   { label: 'Couture',   icon: '🪡', bg: 'var(--mauve-pale)', color: 'var(--mauve)', border: 'var(--mauve-light)' },
  finition:  { label: 'Finition',  icon: '✨', bg: '#FAE8F0', color: '#944060', border: '#D4809C' },
  complete:  { label: 'Complète',  icon: '✅', bg: '#E8F5EC', color: '#2E7A46', border: '#80C894' },
};

export default function ProjectCard({ project, fabricName, patternName, onUpdate, onDelete }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(project.status);
  const cfg = statusConfig[project.status] ?? statusConfig.planning;

  const handleStatusChange = () => {
    onUpdate(project.id, { status: newStatus as Project['status'] });
    setIsEditing(false);
  };

  const handleAddPhoto = () => {
    const url = prompt('URL de la photo :');
    if (url) onUpdate(project.id, { photos: [...project.photos, url] });
  };

  const handleRemovePhoto = (index: number) =>
    onUpdate(project.id, { photos: project.photos.filter((_, i) => i !== index) });

  return (
    /* item-card sans overflow:hidden pour que la surpiqûre ::before soit visible */
    <div className="item-card" style={{ overflow: 'visible' }}>

      {/* ── Galerie photo ──────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--linen)',
        height: '180px',
        overflow: 'hidden',
        borderRadius: '7px 7px 0 0',
        borderBottom: '1px solid var(--mauve-pale)',
      }}>
        {project.photos.length > 0 ? (
          <div style={{ display: 'flex', height: '100%' }}>
            {project.photos.map((photo, idx) => (
              <div key={idx} style={{ flex: 1, position: 'relative' }} className="group">
                <img
                  src={photo}
                  alt={`${project.name} — photo ${idx + 1}`}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(122,79,92,.85)', color: 'white',
                    border: 'none', borderRadius: '4px',
                    padding: '2px 7px', fontSize: '0.75rem',
                    cursor: 'pointer', opacity: 0,
                  }}
                  className="group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--brun-mid)',
            fontSize: '0.85rem', fontStyle: 'italic',
          }}>
            <span style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📷</span>
            Pas encore de photo
          </div>
        )}

        {/* Bouton ajouter photo */}
        <button
          onClick={handleAddPhoto}
          style={{
            position: 'absolute', bottom: '8px', right: '8px',
            backgroundColor: 'var(--mauve)', color: 'var(--creme)',
            border: 'none', borderRadius: '5px',
            padding: '4px 10px', fontSize: '0.78rem',
            cursor: 'pointer', fontFamily: 'Georgia, serif',
          }}
        >
          + Photo
        </button>
      </div>

      {/* ── Contenu ────────────────────────────────────────────────── */}
      <div style={{ padding: '16px' }}>

        {/* Titre */}
        <h4 style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: 'var(--brun)',
          margin: '0 0 12px',
        }}>
          {project.name}
        </h4>

        {/* Statut */}
        <div style={{ marginBottom: '12px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Project['status'])}
                style={{
                  flex: 1, padding: '6px 10px',
                  border: '1.5px solid var(--mauve-light)',
                  borderRadius: '6px', fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem', color: 'var(--brun)',
                  backgroundColor: 'var(--creme)',
                }}
              >
                {Object.entries(statusConfig).map(([key, s]) => (
                  <option key={key} value={key}>{s.icon} {s.label}</option>
                ))}
              </select>
              <button onClick={handleStatusChange}
                style={{ padding: '6px 10px', backgroundColor: 'var(--sage)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                ✓
              </button>
              <button onClick={() => { setIsEditing(false); setNewStatus(project.status); }}
                style={{ padding: '6px 10px', backgroundColor: 'var(--brun-mid)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: '100%', padding: '7px 12px',
                backgroundColor: cfg.bg, color: cfg.color,
                border: `2px solid ${cfg.border}`, borderRadius: '6px',
                fontFamily: 'Georgia, serif', fontSize: '0.88rem',
                fontWeight: 'bold', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          )}
        </div>

        {/* Détails tissu / patron / date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
          {[
            ['Tissu',  fabricName],
            ['Patron', patternName],
            ['Créé',   new Date(project.createdAt).toLocaleDateString('fr-FR')],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
              <span style={{ color: 'var(--brun-mid)' }}>{label}</span>
              <span style={{ color: 'var(--brun)', fontWeight: '600' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {project.notes && (
          <div style={{
            backgroundColor: 'var(--linen)',
            border: '1px solid var(--mauve-pale)',
            borderRadius: '5px',
            padding: '8px 10px',
            fontSize: '0.78rem',
            color: 'var(--brun-mid)',
            fontStyle: 'italic',
            marginBottom: '12px',
          }}>
            {project.notes}
          </div>
        )}

        {/* Supprimer */}
        <button
          className="btn-danger"
          onClick={() => { if (confirm('Supprimer ce projet ?')) onDelete(project.id); }}
        >
          🗑 Supprimer le projet
        </button>
      </div>
    </div>
  );
}
