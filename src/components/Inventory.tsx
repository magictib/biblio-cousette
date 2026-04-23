'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern } from '@/types';
import FabricForm from './FabricForm';
import PatternForm from './PatternForm';
import FabricList from './FabricList';
import PatternList from './PatternList';

export default function Inventory() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [activeTab, setActiveTab] = useState<'fabrics' | 'patterns'>('fabrics');
  const [showForm, setShowForm] = useState(false);

  // Charger depuis localStorage
  useEffect(() => {
    const savedFabrics = localStorage.getItem('fabrics');
    const savedPatterns = localStorage.getItem('patterns');
    if (savedFabrics) setFabrics(JSON.parse(savedFabrics));
    if (savedPatterns) setPatterns(JSON.parse(savedPatterns));
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('fabrics', JSON.stringify(fabrics));
  }, [fabrics]);

  useEffect(() => {
    localStorage.setItem('patterns', JSON.stringify(patterns));
  }, [patterns]);

  const addFabric = (fabric: Omit<Fabric, 'id'>) => {
    const newFabric: Fabric = {
      ...fabric,
      id: Date.now().toString(),
    };
    setFabrics([...fabrics, newFabric]);
  };

  const deleteFabric = (id: string) => {
    setFabrics(fabrics.filter((f) => f.id !== id));
  };

  const addPattern = (pattern: Omit<Pattern, 'id'>) => {
    const newPattern: Pattern = {
      ...pattern,
      id: Date.now().toString(),
    };
    setPatterns([...patterns, newPattern]);
  };

  const deletePattern = (id: string) => {
    setPatterns(patterns.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 Inventaire</h3>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('fabrics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'fabrics'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🧵 Tissu ({fabrics.length})
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'patterns'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 Patron ({patterns.length})
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          {showForm ? '✖️ Annuler' : '➕ Ajouter'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          {activeTab === 'fabrics' ? (
            <FabricForm
              onSubmit={(fabric) => {
                addFabric(fabric);
                setShowForm(false);
              }}
            />
          ) : (
            <PatternForm
              onSubmit={(pattern) => {
                addPattern(pattern);
                setShowForm(false);
              }}
            />
          )}
        </div>
      )}

      <div>
        {activeTab === 'fabrics' ? (
          <FabricList fabrics={fabrics} onDelete={deleteFabric} />
        ) : (
          <PatternList patterns={patterns} onDelete={deletePattern} />
        )}
      </div>
    </div>
  );
}
