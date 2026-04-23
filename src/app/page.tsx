'use client';

import { useState } from 'react';
import Inventory from '@/components/Inventory';
import PatternFitter from '@/components/PatternFitter';
import ProjectGallery from '@/components/ProjectGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'fitter' | 'projects'>('inventory');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue dans Biblio Cousette</h2>
        <p className="text-gray-600">
          Gérez votre collection de tissu et patrons, trouvez les meilleures combinaisons
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'inventory'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📦 Inventaire
        </button>
        <button
          onClick={() => setActiveTab('fitter')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'fitter'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📐 Testeur de Patron
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'projects'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📸 Mes Projets
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'fitter' && <PatternFitter />}
        {activeTab === 'projects' && <ProjectGallery />}
      </div>
    </div>
  );
}
