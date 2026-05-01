'use client';

import { useState, useEffect } from 'react';
import { Fabric, Pattern } from '@/types';
import { loadFabricsDB, saveFabricDB, deleteFabricDB, loadPatternsDB, savePatternDB, deletePatternDB } from '@/lib/db';
import FabricForm from './FabricForm';
import PatternForm from './PatternForm';
import FabricList from './FabricList';
import PatternList from './PatternList';

interface Props { uid: string }

export default function Inventory({ uid }: Props) {
  const [fabrics,        setFabrics]        = useState<Fabric[]>([]);
  const [patterns,       setPatterns]       = useState<Pattern[]>([]);
  const [activeTab,      setActiveTab]      = useState<'fabrics' | 'patterns'>('fabrics');
  const [showForm,       setShowForm]       = useState(false);
  const [editingFabric,  setEditingFabric]  = useState<Fabric  | null>(null);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState('');

  /* ── Chargement initial depuis Firestore ─────────────────────── */
  useEffect(() => {
    Promise.all([loadFabricsDB(uid), loadPatternsDB(uid)])
      .then(([f, p]) => { setFabrics(f); setPatterns(p); })
      .catch(err => console.error('Erreur chargement', err));
  }, [uid]);

  /* ── Tissus ──────────────────────────────────────────────────── */
  const handleFabricSubmit = async (data: Omit<Fabric, 'id'>) => {
    setSaving(true); setSaveError('');
    try {
      if (editingFabric) {
        const updated = await saveFabricDB(uid, { ...data, id: editingFabric.id });
        setFabrics(prev => prev.map(f => f.id === editingFabric.id ? updated : f));
        setEditingFabric(null);
      } else {
        const created = await saveFabricDB(uid, { ...data, id: Date.now().toString() });
        setFabrics(prev => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    } finally {
      setSaving(false);
    }
  };

  const startEditFabric = (fabric: Fabric) => {
    setEditingFabric(fabric); setEditingPattern(null);
    setActiveTab('fabrics'); setShowForm(true);
  };

  const deleteFabric = async (id: string) => {
    try {
      await deleteFabricDB(uid, id);
      setFabrics(prev => prev.filter(f => f.id !== id));
      if (editingFabric?.id === id) { setEditingFabric(null); setShowForm(false); }
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    }
  };

  /* ── Patrons ─────────────────────────────────────────────────── */
  const handlePatternSubmit = async (data: Omit<Pattern, 'id'>) => {
    setSaving(true); setSaveError('');
    try {
      if (editingPattern) {
        const merged: Pattern = {
          ...data,
          id: editingPattern.id,
          pdfFiles: data.pdfFiles ?? editingPattern.pdfFiles,
          primaryPdfIndex: data.primaryPdfIndex ?? editingPattern.primaryPdfIndex ?? 0,
        };
        const updated = await savePatternDB(uid, merged);
        setPatterns(prev => prev.map(p => p.id === editingPattern.id ? updated : p));
        setEditingPattern(null);
      } else {
        const created = await savePatternDB(uid, { ...data, id: Date.now().toString() });
        setPatterns(prev => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimaryPdf = async (id: string, index: number) => {
    const pattern = patterns.find(p => p.id === id);
    if (!pattern) return;
    const updated = await savePatternDB(uid, { ...pattern, primaryPdfIndex: index });
    setPatterns(prev => prev.map(p => p.id === id ? updated : p));
  };

  const startEditPattern = (pattern: Pattern) => {
    setEditingPattern(pattern); setEditingFabric(null);
    setActiveTab('patterns'); setShowForm(true);
  };

  const deletePattern = async (id: string) => {
    try {
      await deletePatternDB(uid, id);
      setPatterns(prev => prev.filter(p => p.id !== id));
      if (editingPattern?.id === id) { setEditingPattern(null); setShowForm(false); }
    } catch (err) {
      setSaveError(String(err).replace('Error: ', ''));
    }
  };

  const handleToggleAdd = () => {
    if (showForm && !editingFabric && !editingPattern) { setShowForm(false); }
    else { setEditingFabric(null); setEditingPattern(null); setShowForm(true); }
  };

  const cancelForm = () => {
    setShowForm(false); setEditingFabric(null); setEditingPattern(null); setSaveError('');
  };

  const isEditing    = editingFabric !== null || editingPattern !== null;
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

      {/* ── Erreur de sauvegarde ─────────────────────────────────── */}
      {saveError && (
        <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#943030' }}>
          ⚠️ {saveError}
          <button onClick={() => setSaveError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: '#943030' }}>✕</button>
        </div>
      )}

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
          <button onClick={handleToggleAdd} className={showForm ? 'btn-couture' : 'btn-sage'} disabled={saving}>
            {showForm ? '✖ Annuler' : '＋ Ajouter'}
          </button>
        </div>
      )}

      {/* ── Indicateur de sauvegarde ─────────────────────────────── */}
      {saving && (
        <div style={{ backgroundColor: 'var(--mauve-pale)', border: '1px solid var(--mauve-light)', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--mauve)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          Enregistrement (photos/PDFs en cours d&apos;envoi)…
        </div>
      )}

      {/* ── Formulaire ────────────────────────────────────────────── */}
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
