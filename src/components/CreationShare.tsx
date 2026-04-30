'use client';

import { useState, useEffect, useRef } from 'react';
import { Creation, Fabric, Pattern } from '@/types';
import { loadFabrics, loadPatterns } from '@/utils/migrate';

function loadCreations(): Creation[] {
  try {
    const raw = JSON.parse(localStorage.getItem('creations') ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw as Creation[];
  } catch { return []; }
}

const STATUS_LABELS: Record<Creation['status'], string> = {
  en_cours: 'En cours',
  termine:  'Terminé',
};

const STATUS_COLORS: Record<Creation['status'], { bg: string; color: string; border: string }> = {
  en_cours: { bg: '#EAF4FF', color: '#2255AA', border: '#88AADD' },
  termine:  { bg: '#E8F5EC', color: '#2E7A46', border: '#80C894' },
};

const MAX_PHOTO_MB = 5;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target!.result as string);
    reader.onerror = () => reject(new Error(`Impossible de lire "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

interface FormState {
  name: string;
  status: Creation['status'];
  fabricName: string;
  patternName: string;
  tips: string;
  difficulties: string;
  notes: string;
  startedAt: string;
  finishedAt: string;
  photos: string[];
}

const emptyForm = (): FormState => ({
  name:        '',
  status:      'en_cours',
  fabricName:  '',
  patternName: '',
  tips:        '',
  difficulties:'',
  notes:       '',
  startedAt:   new Date().toISOString().slice(0, 10),
  finishedAt:  '',
  photos:      [],
});

export default function CreationShare() {
  const [creations,  setCreations]  = useState<Creation[]>([]);
  const [fabrics,    setFabrics]    = useState<Fabric[]>([]);
  const [patterns,   setPatterns]   = useState<Pattern[]>([]);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<Creation | null>(null);
  const [form,       setForm]       = useState<FormState>(emptyForm());
  const [photoError, setPhotoError] = useState('');
  const [preview,    setPreview]    = useState<{ photos: string[]; idx: number } | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCreations(loadCreations());
    setFabrics(loadFabrics());
    setPatterns(loadPatterns());
  }, []);

  useEffect(() => {
    localStorage.setItem('creations', JSON.stringify(creations));
  }, [creations]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setPhotoError('');
    setShowForm(true);
  };

  const openEdit = (c: Creation) => {
    setEditing(c);
    setForm({
      name:         c.name,
      status:       c.status,
      fabricName:   c.fabricName ?? '',
      patternName:  c.patternName ?? '',
      tips:         c.tips ?? '',
      difficulties: c.difficulties ?? '',
      notes:        c.notes ?? '',
      startedAt:    c.startedAt,
      finishedAt:   c.finishedAt ?? '',
      photos:       c.photos,
    });
    setPhotoError('');
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditing(null); };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const tooBig = files.filter(f => f.size > MAX_PHOTO_MB * 1024 * 1024);
    if (tooBig.length) {
      setPhotoError(`${tooBig.map(f => `"${f.name}"`).join(', ')} dépasse ${MAX_PHOTO_MB} Mo.`);
      e.target.value = '';
      return;
    }
    setPhotoError('');
    const dataUrls = await Promise.all(files.map(readFile));
    setForm(f => ({ ...f, photos: [...f.photos, ...dataUrls] }));
    e.target.value = '';
  };

  const removePhoto = (idx: number) =>
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload: Omit<Creation, 'id'> = {
      name:         form.name.trim(),
      status:       form.status,
      photos:       form.photos,
      fabricName:   form.fabricName.trim() || undefined,
      patternName:  form.patternName.trim() || undefined,
      tips:         form.tips.trim() || undefined,
      difficulties: form.difficulties.trim() || undefined,
      notes:        form.notes.trim() || undefined,
      startedAt:    form.startedAt,
      finishedAt:   form.finishedAt || undefined,
    };
    if (editing) {
      setCreations(prev => prev.map(c => c.id === editing.id ? { ...payload, id: editing.id } : c));
    } else {
      setCreations(prev => [...prev, { ...payload, id: Date.now().toString() }]);
    }
    cancelForm();
  };

  const deleteCreation = (id: string) =>
    setCreations(prev => prev.filter(c => c.id !== id));

  const setF = (k: keyof FormState, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: '28px 28px 32px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>
          Partage de créations
        </h3>
        <p style={{ color: 'var(--brun-mid)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          Documenter vos projets — tissus, patrons utilisés, astuces et difficultés rencontrées
        </p>
      </div>

      {/* Bouton ajouter */}
      {!showForm && (
        <div style={{ marginBottom: '24px' }}>
          <button onClick={openAdd} className="btn-sage">
            ＋ Partager une création
          </button>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div style={{
          backgroundColor: 'var(--linen)', border: '1.5px solid var(--mauve-pale)',
          borderRadius: '8px', padding: '24px', marginBottom: '28px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '5px', border: '1px dashed var(--mauve-pale)', borderRadius: '5px', pointerEvents: 'none', opacity: 0.5 }}/>
          <h4 style={{ fontFamily: 'Georgia, serif', color: 'var(--mauve)', fontWeight: 'bold', margin: '0 0 20px', fontSize: '1.05rem' }}>
            {editing ? `Modifier « ${editing.name} »` : 'Nouvelle création'}
          </h4>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>

            {/* Ligne 1 : nom + statut */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 240px' }}>
                <label className="field-label">Nom du projet *</label>
                <input className="field-input" value={form.name} onChange={e => setF('name', e.target.value)}
                  placeholder="Ex : Robe Cassandre printemps 2025" required />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label className="field-label">Statut</label>
                <select className="field-input" value={form.status}
                  onChange={e => setF('status', e.target.value as Creation['status'])}>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
            </div>

            {/* Ligne 2 : tissu + patron */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label className="field-label">Tissu utilisé</label>
                <input className="field-input" list="fabric-list" value={form.fabricName}
                  onChange={e => setF('fabricName', e.target.value)}
                  placeholder="Nom ou description du tissu" />
                <datalist id="fabric-list">
                  {fabrics.map(f => <option key={f.id} value={f.name} />)}
                </datalist>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label className="field-label">Patron utilisé</label>
                <input className="field-input" list="pattern-list" value={form.patternName}
                  onChange={e => setF('patternName', e.target.value)}
                  placeholder="Nom du patron" />
                <datalist id="pattern-list">
                  {patterns.map(p => <option key={p.id} value={p.name} />)}
                </datalist>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 160px' }}>
                <label className="field-label">Date de début</label>
                <input className="field-input" type="date" value={form.startedAt}
                  onChange={e => setF('startedAt', e.target.value)} />
              </div>
              {form.status === 'termine' && (
                <div style={{ flex: '1 1 160px' }}>
                  <label className="field-label">Date de fin</label>
                  <input className="field-input" type="date" value={form.finishedAt}
                    onChange={e => setF('finishedAt', e.target.value)} />
                </div>
              )}
            </div>

            {/* Photos */}
            <div>
              <label className="field-label">Photos du projet</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {form.photos.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={src} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid var(--mauve-pale)' }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#943030', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => photoRef.current?.click()}
                  style={{ width: '80px', height: '80px', borderRadius: '6px', border: '2px dashed var(--mauve-pale)', backgroundColor: 'white', color: 'var(--mauve)', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ＋
                </button>
                <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
              </div>
              {photoError && <p style={{ color: '#943030', fontSize: '0.78rem', marginTop: '6px' }}>⚠️ {photoError}</p>}
            </div>

            {/* Astuces + difficultés */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px' }}>
                <label className="field-label">Astuces pour la prochaine fois</label>
                <textarea className="field-input" rows={3} value={form.tips}
                  onChange={e => setF('tips', e.target.value)}
                  placeholder="Ce que j'ai appris, ce que je referai différemment…"
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ flex: '1 1 240px' }}>
                <label className="field-label">Difficultés rencontrées</label>
                <textarea className="field-input" rows={3} value={form.difficulties}
                  onChange={e => setF('difficulties', e.target.value)}
                  placeholder="Points délicats, coutures compliquées…"
                  style={{ resize: 'vertical' }} />
              </div>
            </div>

            {/* Notes libres */}
            <div>
              <label className="field-label">Notes libres</label>
              <textarea className="field-input" rows={2} value={form.notes}
                onChange={e => setF('notes', e.target.value)}
                placeholder="Impressions générales, ressenti sur le projet…"
                style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-couture">
                {editing ? '✓ Enregistrer' : '＋ Publier la création'}
              </button>
              <button type="button" onClick={cancelForm} style={{ padding: '8px 16px', borderRadius: '6px', border: '1.5px solid var(--mauve-pale)', backgroundColor: 'white', color: 'var(--brun-mid)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Galerie des créations */}
      {creations.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--brun-mid)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧶</div>
          <p>Aucune création partagée pour l'instant.<br/>Commencez par en ajouter une !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {creations.map(c => {
            const sc = STATUS_COLORS[c.status];
            return (
              <div key={c.id} style={{
                backgroundColor: 'white', border: '1.5px solid var(--mauve-pale)',
                borderRadius: '10px', overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(94,53,120,.08)',
              }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--mauve-pale)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--brun)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    {c.name}
                  </h4>
                  <span style={{ ...sc, fontSize: '0.72rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '10px', border: `1px solid ${sc.border}`, whiteSpace: 'nowrap' }}>
                    {STATUS_LABELS[c.status]}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', whiteSpace: 'nowrap' }}>
                    {c.startedAt}{c.finishedAt ? ` → ${c.finishedAt}` : ''}
                  </span>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                  {/* Photos */}
                  {c.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
                      {c.photos.map((src, i) => (
                        <img key={i} src={src} alt={`photo ${i + 1}`}
                          onClick={() => setPreview({ photos: c.photos, idx: i })}
                          style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '7px', border: '1.5px solid var(--mauve-pale)', cursor: 'pointer' }} />
                      ))}
                    </div>
                  )}

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {(c.fabricName || c.patternName) && (
                      <div style={{ backgroundColor: 'var(--linen)', border: '1px solid var(--mauve-pale)', borderRadius: '6px', padding: '10px 14px', fontSize: '0.82rem' }}>
                        {c.fabricName && (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: c.patternName ? '4px' : 0 }}>
                            <span style={{ color: 'var(--brun-mid)' }}>🧵 Tissu :</span>
                            <span style={{ color: 'var(--brun)', fontWeight: 600 }}>{c.fabricName}</span>
                          </div>
                        )}
                        {c.patternName && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: 'var(--brun-mid)' }}>📋 Patron :</span>
                            <span style={{ color: 'var(--brun)', fontWeight: 600 }}>{c.patternName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {c.tips && (
                      <div>
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mauve)', fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>
                          💡 Astuces
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--brun)', margin: 0, lineHeight: 1.55 }}>{c.tips}</p>
                      </div>
                    )}

                    {c.difficulties && (
                      <div>
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A3030', fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>
                          ⚠️ Difficultés
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--brun)', margin: 0, lineHeight: 1.55 }}>{c.difficulties}</p>
                      </div>
                    )}

                    {c.notes && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--brun-mid)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>{c.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--mauve-pale)', display: 'flex', gap: '8px', backgroundColor: 'var(--creme)' }}>
                  <button onClick={() => openEdit(c)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)', backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.8rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                  <button onClick={() => deleteCreation(c.id)} className="btn-danger" style={{ width: 'auto', padding: '6px 12px' }}>
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox photos */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(40,20,58,.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={preview.photos[preview.idx]} alt=""
              style={{ maxWidth: '90vw', maxHeight: '82vh', borderRadius: '10px', border: '2px solid var(--mauve-light)', display: 'block' }} />
            {preview.photos.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                {preview.photos.map((src, i) => (
                  <img key={i} src={src} alt="" onClick={() => setPreview({ ...preview, idx: i })}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: `2px solid ${i === preview.idx ? 'var(--mauve)' : 'transparent'}`, opacity: i === preview.idx ? 1 : 0.6 }} />
                ))}
              </div>
            )}
            <button onClick={() => setPreview(null)}
              style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--brun)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
