'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern } from '@/types';
import { loadFabrics, loadPatterns } from '@/utils/migrate';
import FabricForm from './FabricForm';
import PatternForm from './PatternForm';
import FabricList from './FabricList';
import PatternList from './PatternList';

export default function Inventory() {
  const [fabrics,     setFabrics]     = useState<Fabric[]>([]);
  const [patterns,    setPatterns]    = useState<Pattern[]>([]);
  const [activeTab,   setActiveTab]   = useState<'fabrics' | 'patterns'>('fabrics');
  const [showForm,    setShowForm]    = useState(false);

  /* Chargement avec migration automatique de l'ancien format */
  useEffect(() => {
    setFabrics(loadFabrics());
    setPatterns(loadPatterns());
  }, []);

  useEffect(() => { localStorage.setItem('fabrics',  JSON.stringify(fabrics));  }, [fabrics]);
  useEffect(() => { localStorage.setItem('patterns', JSON.stringify(patterns)); }, [patterns]);

  const addFabric    = (f: Omit<Fabric, 'id'>)  => setFabrics([...fabrics,   { ...f,  id: Date.now().toString() }]);
  const deleteFabric = (id: string)              => setFabrics(fabrics.filter(f => f.id !== id));
  const addPattern   = (p: Omit<Pattern, 'id'>) => setPatterns([...patterns,  { ...p,  id: Date.now().toString() }]);
  const deletePattern= (id: string)             => setPatterns(patterns.filter(p => p.id !== id));

  return (
    <div style={{ padding: '28px 28px 32px' }}>

      {/* Titre */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Inventaire
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Gérez vos tissus et vos patrons
        </p>
      </div>

      {/* ── Onglets étiquettes ─────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--mauve-light)', marginBottom: '24px', display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
        <button
          onClick={() => setActiveTab('fabrics')}
          className={`swatch-tab${activeTab === 'fabrics' ? ' active' : ''}`}
        >
          🧵 Tissus
          <span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.7 }}>({fabrics.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`swatch-tab${activeTab === 'patterns' ? ' active' : ''}`}
        >
          📋 Patrons
          <span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.7 }}>({patterns.length})</span>
        </button>
      </div>

      {/* Bouton ajouter */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => setShowForm(v => !v)} className={showForm ? 'btn-couture' : 'btn-sage'}>
          {showForm ? '✖ Annuler' : '＋ Ajouter'}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{
          backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)',
          borderRadius: '8px', padding: '24px', marginBottom: '24px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '5px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.5 }}/>
          {activeTab === 'fabrics' ? (
            <FabricForm  onSubmit={f => { addFabric(f);  setShowForm(false); }} />
          ) : (
            <PatternForm onSubmit={p => { addPattern(p); setShowForm(false); }} />
          )}
        </div>
      )}

      {/* Liste */}
      {activeTab === 'fabrics'
        ? <FabricList  fabrics={fabrics}   onDelete={deleteFabric}  />
        : <PatternList patterns={patterns} onDelete={deletePattern} />
      }
    </div>
  );
}
