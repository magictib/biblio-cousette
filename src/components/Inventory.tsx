'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern } from '@/types';
import { loadFabrics, loadPatterns } from '@/utils/migrate';
import FabricForm from './FabricForm';
import PatternForm from './PatternForm';
import FabricList from './FabricList';
import PatternList from './PatternList';

export default function Inventory() {
  const [fabrics,        setFabrics]        = useState<Fabric[]>([]);
  const [patterns,       setPatterns]       = useState<Pattern[]>([]);
  const [activeTab,      setActiveTab]      = useState<'fabrics' | 'patterns'>('fabrics');
  const [showForm,       setShowForm]       = useState(false);
  const [editingFabric,  setEditingFabric]  = useState<Fabric  | null>(null);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);

  useEffect(() => {
    setFabrics(loadFabrics());
    setPatterns(loadPatterns());
  }, []);

  useEffect(() => { localStorage.setItem('fabrics',  JSON.stringify(fabrics));  }, [fabrics]);
  useEffect(() => { localStorage.setItem('patterns', JSON.stringify(patterns)); }, [patterns]);

  /* ── Tissus ──────────────────────────────────────────────────── */
  const handleFabricSubmit = (data: Omit<Fabric, 'id'>) => {
    if (editingFabric) {
      setFabrics(prev => prev.map(f => f.id === editingFabric.id ? { ...data, id: editingFabric.id } : f));
      setEditingFabric(null);
    } else {
      setFabrics(prev => [...prev, { ...data, id: Date.now().toString() }]);
    }
    setShowForm(false);
  };

  const startEditFabric = (fabric: Fabric) => {
    setEditingFabric(fabric);
    setEditingPattern(null);
    setActiveTab('fabrics');
    setShowForm(true);
  };

  const deleteFabric = (id: string) => {
    setFabrics(prev => prev.filter(f => f.id !== id));
    if (editingFabric?.id === id) { setEditingFabric(null); setShowForm(false); }
  };

  /* ── Patrons ─────────────────────────────────────────────────── */
  const handlePatternSubmit = (data: Omit<Pattern, 'id'>) => {
    if (editingPattern) {
      setPatterns(prev => prev.map(p =>
        p.id === editingPattern.id
          ? { ...data, id: editingPattern.id, pdfFiles: data.pdfFiles ?? p.pdfFiles, primaryPdfIndex: data.primaryPdfIndex ?? p.primaryPdfIndex ?? 0 }
          : p
      ));
      setEditingPattern(null);
    } else {
      setPatterns(prev => [...prev, { ...data, id: Date.now().toString() }]);
    }
    setShowForm(false);
  };

  const handleSetPrimaryPdf = (id: string, index: number) => {
    setPatterns(prev => prev.map(p => p.id === id ? { ...p, primaryPdfIndex: index } : p));
  };

  const startEditPattern = (pattern: Pattern) => {
    setEditingPattern(pattern);
    setEditingFabric(null);
    setActiveTab('patterns');
    setShowForm(true);
  };

  const deletePattern = (id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
    if (editingPattern?.id === id) { setEditingPattern(null); setShowForm(false); }
  };

  /* ── Bouton Ajouter : réinitialise l'édition en cours ───────── */
  const handleToggleAdd = () => {
    if (showForm && !editingFabric && !editingPattern) {
      setShowForm(false);
    } else {
      setEditingFabric(null);
      setEditingPattern(null);
      setShowForm(true);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingFabric(null);
    setEditingPattern(null);
  };

  const isEditing = editingFabric !== null || editingPattern !== null;
  const showAddButton = !isEditing;

  return (
    <div style={{ padding: '28px 28px 32px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Inventaire
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Gérez vos tissus et vos patrons
        </p>
      </div>

      {/* ── Onglets ───────────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--mauve-light)', marginBottom: '24px', display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
        <button onClick={() => { setActiveTab('fabrics');  cancelForm(); }} className={`swatch-tab${activeTab === 'fabrics'  ? ' active' : ''}`}>
          🧵 Tissus<span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.7 }}>({fabrics.length})</span>
        </button>
        <button onClick={() => { setActiveTab('patterns'); cancelForm(); }} className={`swatch-tab${activeTab === 'patterns' ? ' active' : ''}`}>
          📋 Patrons<span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.7 }}>({patterns.length})</span>
        </button>
      </div>

      {/* ── Bouton Ajouter ────────────────────────────────────────── */}
      {showAddButton && (
        <div style={{ marginBottom: '24px' }}>
          <button onClick={handleToggleAdd} className={showForm ? 'btn-couture' : 'btn-sage'}>
            {showForm ? '✖ Annuler' : '＋ Ajouter'}
          </button>
        </div>
      )}

      {/* ── Formulaire (ajout ou édition) ─────────────────────────── */}
      {showForm && (
        <div style={{
          backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)',
          borderRadius: '8px', padding: '24px', marginBottom: '24px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '5px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.5 }}/>
          {activeTab === 'fabrics' ? (
            <FabricForm
              key={editingFabric?.id ?? 'new-fabric'}
              initialValues={editingFabric ?? undefined}
              onSubmit={handleFabricSubmit}
              onCancel={cancelForm}
            />
          ) : (
            <PatternForm
              key={editingPattern?.id ?? 'new-pattern'}
              initialValues={editingPattern ?? undefined}
              onSubmit={handlePatternSubmit}
              onCancel={cancelForm}
            />
          )}
        </div>
      )}

      {/* ── Listes ────────────────────────────────────────────────── */}
      {activeTab === 'fabrics'
        ? <FabricList  fabrics={fabrics}   onDelete={deleteFabric}  onEdit={startEditFabric}  />
        : <PatternList patterns={patterns} onDelete={deletePattern} onEdit={startEditPattern} onSetPrimaryPdf={handleSetPrimaryPdf} />
      }
    </div>
  );
}
