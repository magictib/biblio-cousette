'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern, Project } from '@/types';
import ProjectForm from './ProjectForm';
import ProjectCard from './ProjectCard';

export default function ProjectGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Charger les données
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedFabrics = localStorage.getItem('fabrics');
    const savedPatterns = localStorage.getItem('patterns');

    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedFabrics) setFabrics(JSON.parse(savedFabrics));
    if (savedPatterns) setPatterns(JSON.parse(savedPatterns));
  }, []);

  // Sauvegarder les projets
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
    setShowForm(false);
  };

  const updateProject = (id: string, updatedData: Partial<Project>) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const getFabricName = (fabricId: string) => {
    return fabrics.find((f) => f.id === fabricId)?.name || 'Tissu inconnu';
  };

  const getPatternName = (patternId: string) => {
    return patterns.find((p) => p.id === patternId)?.name || 'Patron inconnu';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">📸 Mes Projets</h3>
        <p className="text-gray-600 mb-6">
          Suivez vos projets de couture avec des photos et un historique d'avancement
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          {showForm ? '✖️ Annuler' : '➕ Nouveau Projet'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <ProjectForm
            fabrics={fabrics}
            patterns={patterns}
            onSubmit={addProject}
          />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            Aucun projet créé. Lancez votre première création!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
