'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern, Project } from '@/types';
import { loadFabricsDB, loadPatternsDB, loadProjectsDB, saveProjectDB, deleteProjectDB } from '@/lib/db';
import ProjectForm from './ProjectForm';
import ProjectCard from './ProjectCard';

interface Props { uid: string }

export default function ProjectGallery({ uid }: Props) {
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [fabrics,   setFabrics]   = useState<Fabric[]>([]);
  const [patterns,  setPatterns]  = useState<Pattern[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    Promise.all([
      loadProjectsDB(uid),
      loadFabricsDB(uid),
      loadPatternsDB(uid),
    ]).then(([p, f, pat]) => {
      setProjects(p);
      setFabrics(f);
      setPatterns(pat);
    }).catch(console.error);
  }, [uid]);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    setSaving(true); setSaveError('');
    try {
      const created = await saveProjectDB(uid, {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      setProjects(prev => [...prev, created]);
      setShowForm(false);
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    } finally {
      setSaving(false);
    }
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    try {
      const updated = await saveProjectDB(uid, { ...project, ...updatedData });
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteProjectDB(uid, id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    }
  };

  const getFabricName  = (id: string) => fabrics.find(f => f.id === id)?.name  ?? 'Tissu inconnu';
  const getPatternName = (id: string) => patterns.find(p => p.id === id)?.name ?? 'Patron inconnu';

  return (
    <div style={{ padding: '28px 28px 32px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Mes Projets
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Suivez vos projets de couture avec photos et historique d&apos;avancement
        </p>
      </div>

      {saveError && (
        <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#943030' }}>
          ⚠️ {saveError}
          <button onClick={() => setSaveError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: '#943030' }}>✕</button>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => setShowForm(v => !v)} className={showForm ? 'btn-couture' : 'btn-sage'} disabled={saving}>
          {showForm ? '✖ Annuler' : '➕ Nouveau projet'}
        </button>
      </div>

      {saving && (
        <div style={{ backgroundColor: 'var(--mauve-pale)', border: '1px solid var(--mauve-light)', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--mauve)' }}>
          ⏳ Enregistrement en cours…
        </div>
      )}

      {showForm && (
        <div style={{ backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
          <ProjectForm fabrics={fabrics} patterns={patterns} onSubmit={addProject} />
        </div>
      )}

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📸</div>
          <p>Aucun projet créé. Lancez votre première création !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              fabricName={getFabricName(project.fabricId)}
              patternName={getPatternName(project.patternId)}
              onUpdate={updateProject}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
