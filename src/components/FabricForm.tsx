'use client';

import { useState, useRef } from 'react';
import { Fabric } from '@/types';

interface FabricFormProps {
  onSubmit: (fabric: Omit<Fabric, 'id'>) => void;
}

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.src = dataUrl;
  });
}

const FABRIC_TYPES = ['coton', 'lin', 'jersey', 'soie', 'laine', 'viscose', 'dentelle', 'velours', 'satin', 'mousseline', 'tweed', 'chambray', 'canvas', 'autres'];

export default function FabricForm({ onSubmit }: FabricFormProps) {
  const [name,           setName]           = useState('');
  const [color,          setColor]          = useState('#C4889A');
  const [colorName,      setColorName]      = useState('');
  const [detectingColor, setDetectingColor] = useState(false);
  const [type,           setType]           = useState('');
  const [pattern,        setPattern]        = useState('');
  const [notes,          setNotes]          = useState('');
  const [unit,           setUnit]           = useState<'cm' | 'inch'>('cm');

  const [width,        setWidth]        = useState<string>('140');
  const [lengthMeters, setLengthMeters] = useState<string>('2');
  const [scrapWidthCm, setScrapWidthCm] = useState<string>('');
  const [scrapLenCm,   setScrapLenCm]   = useState<string>('');

  const [isScrap,       setIsScrap]       = useState(false);
  const [estimatedArea, setEstimatedArea] = useState<string>('');
  const [estimating,    setEstimating]    = useState(false);
  const [estimateMsg,   setEstimateMsg]   = useState('');

  const [photos,    setPhotos]    = useState<string[]>([]);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const detectColor = async (imageDataUrl: string) => {
    setDetectingColor(true);
    try {
      const res  = await fetch('/api/detect-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl }),
      });
      const data = await res.json() as { hex?: string; name?: string; error?: string };
      if (data.hex) {
        setColor(data.hex);
        setColorName(data.name ?? '');
      }
    } catch {
      /* silencieux — la couleur reste inchangée */
    } finally {
      setDetectingColor(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let firstPhoto = true;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const compressed = await compressImage(ev.target!.result as string);
        setPhotos(prev => {
          if (firstPhoto && prev.length === 0) detectColor(compressed);
          return [...prev, compressed];
        });
      };
      reader.readAsDataURL(file);
      firstPhoto = false;
    }
    e.target.value = '';
  };

  const estimateFromPhoto = async () => {
    if (photos.length === 0) return;
    setEstimating(true);
    setEstimateMsg('');
    try {
      const res  = await fetch('/api/estimate-scrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: photos[0] }),
      });
      const data = await res.json();
      if (data.error) {
        setEstimateMsg(`Erreur : ${data.error}`);
      } else {
        setEstimatedArea(String(Math.round(data.area_cm2)));
        setEstimateMsg(data.note ?? '');
      }
    } catch {
      setEstimateMsg('Erreur réseau — saisissez la surface manuellement.');
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let w = parseFloat(width) || 0;
    let l = 0;
    if (unit === 'inch') w *= 2.54;

    if (isScrap) {
      const wCm = parseFloat(scrapWidthCm) || 0;
      const lCm = parseFloat(scrapLenCm)   || 0;
      w = wCm;
      l = +(lCm / 100).toFixed(3);
    } else {
      l = parseFloat(lengthMeters) || 0;
    }

    onSubmit({
      name, color, type: type || 'coton',
      width: w,
      length: l,
      pattern:       pattern       || undefined,
      notes:         notes         || undefined,
      photos,
      isScrap,
      estimatedArea: estimatedArea ? parseFloat(estimatedArea) : undefined,
    });

    setName(''); setColor('#C4889A'); setColorName(''); setType(''); setPattern(''); setNotes('');
    setWidth('140'); setLengthMeters('2'); setScrapWidthCm(''); setScrapLenCm('');
    setIsScrap(false); setPhotos([]); setEstimatedArea(''); setEstimateMsg('');
  };

  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' } as const;

  return (
    <form onSubmit={handleSubmit}>
      <h4 style={{ color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px' }}>
        Ajouter un tissu
      </h4>

      {/* ── Infos de base ──────────────────────────────────────────── */}
      <div style={{ ...row2, marginBottom: '14px' }}>
        <div>
          <label className="field-label">Nom *</label>
          <input className="field-input" required value={name}
            onChange={e => setName(e.target.value)} placeholder="Ex : Lin bleu ardoise" />
        </div>

        {/* Type — combobox libre */}
        <div>
          <label className="field-label">Type</label>
          <input
            className="field-input"
            list="fabric-types-list"
            value={type}
            onChange={e => setType(e.target.value)}
            placeholder="Ex : coton, lin, jersey…"
          />
          <datalist id="fabric-types-list">
            {FABRIC_TYPES.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>

        {/* Couleur + détection auto */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">
            Couleur
            {detectingColor && (
              <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--mauve)', fontStyle: 'italic' }}>
                ⏳ Détection en cours…
              </span>
            )}
            {colorName && !detectingColor && (
              <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic' }}>
                — {colorName} (détecté automatiquement)
              </span>
            )}
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={color} onChange={e => { setColor(e.target.value); setColorName(''); }}
              style={{ width: '44px', height: '38px', border: '1.5px solid var(--mauve-pale)', borderRadius: '6px', padding: '2px', cursor: 'pointer' }} />
            <input className="field-input" type="text" value={color}
              onChange={e => { setColor(e.target.value); setColorName(''); }} style={{ flex: 1 }}
              placeholder="#RRGGBB" />
            {photos.length > 0 && !detectingColor && (
              <button type="button" onClick={() => detectColor(photos[0])}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)',
                  backgroundColor: 'var(--mauve-pale)', color: 'var(--mauve)',
                  cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap',
                }}>
                🎨 Détecter
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="field-label">Motif</label>
          <input className="field-input" value={pattern}
            onChange={e => setPattern(e.target.value)} placeholder="Rayures, fleurs…" />
        </div>
      </div>

      {/* ── Toggle chute ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsScrap(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          width: '100%', padding: '12px 16px', marginBottom: '16px',
          backgroundColor: isScrap ? 'var(--mauve-pale)' : 'var(--linen)',
          border: `1.5px solid ${isScrap ? 'var(--mauve-light)' : 'var(--mauve-pale)'}`,
          borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s',
        }}
      >
        <span style={{
          display: 'inline-block', width: '44px', height: '24px', borderRadius: '12px',
          backgroundColor: isScrap ? 'var(--mauve)' : '#ccc',
          position: 'relative', flexShrink: 0, transition: 'background-color 0.2s',
        }}>
          <span style={{
            position: 'absolute', top: '3px',
            left: isScrap ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            backgroundColor: 'white', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          }}/>
        </span>
        <span>
          <span style={{ display: 'block', fontFamily: 'Georgia, serif', fontWeight: 'bold', color: isScrap ? 'var(--mauve)' : 'var(--brun-mid)', fontSize: '0.9rem' }}>
            ✂️ Chute de tissu
          </span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--brun-mid)', opacity: 0.8 }}>
            Morceau irrégulier sans métrage précis
          </span>
        </span>
      </button>

      {/* ── Dimensions ─────────────────────────────────────────────── */}
      {!isScrap ? (
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label">Métrage</label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {(['cm', 'inch'] as const).map(u => (
              <button key={u} type="button" onClick={() => setUnit(u)}
                style={{
                  padding: '4px 14px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif',
                  backgroundColor: unit === u ? 'var(--mauve)' : 'var(--mauve-pale)',
                  color: unit === u ? 'var(--creme)' : 'var(--brun-mid)',
                }}>
                {u === 'cm' ? 'cm' : 'pouces'}
              </button>
            ))}
          </div>
          <div style={row2}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>
                Largeur de laize ({unit === 'cm' ? 'cm' : 'pouces'})
              </label>
              <input className="field-input" type="number" min="1" step="1" required
                value={width} onChange={e => setWidth(e.target.value)} placeholder={unit === 'cm' ? '140' : '55'} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Métrage (mètres)</label>
              <input className="field-input" type="number" min="0.1" step="0.1" required
                value={lengthMeters} onChange={e => setLengthMeters(e.target.value)} placeholder="2.5" />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label">Dimensions approximatives (optionnel)</label>
          <div style={row2}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Largeur (cm)</label>
              <input className="field-input" type="number" min="1" step="1"
                value={scrapWidthCm} onChange={e => setScrapWidthCm(e.target.value)} placeholder="30" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>Longueur (cm)</label>
              <input className="field-input" type="number" min="1" step="1"
                value={scrapLenCm} onChange={e => setScrapLenCm(e.target.value)} placeholder="50" />
            </div>
          </div>
        </div>
      )}

      {/* ── Photos ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <label className="field-label">
          {isScrap ? 'Photo de la chute' : 'Photos du tissu'}
          {photos.length === 0 && (
            <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--brun-mid)', fontStyle: 'italic', fontWeight: 'normal' }}>
              La couleur sera détectée automatiquement
            </span>
          )}
        </label>

        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {photos.map((p, idx) => (
              <div key={idx} style={{ position: 'relative', width: '72px', height: '72px' }}>
                <img src={p} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid var(--mauve-pale)' }} />
                <button type="button" onClick={() => setPhotos(pr => pr.filter((_, i) => i !== idx))}
                  style={{
                    position: 'absolute', top: '-7px', right: '-7px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: 'var(--mauve)', color: 'white',
                    border: 'none', cursor: 'pointer', fontSize: '0.65rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <input type="file" accept="image/*" multiple ref={fileInputRef}
          onChange={handlePhotoUpload} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px', border: '1.5px dashed var(--mauve-light)',
            borderRadius: '7px', backgroundColor: 'var(--linen)',
            color: 'var(--mauve)', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '0.85rem',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
          📷 {photos.length === 0 ? 'Ajouter une photo' : 'Ajouter d\'autres photos'}
        </button>
      </div>

      {/* ── Estimation surface (chute + photo) ─────────────────────── */}
      {isScrap && photos.length > 0 && (
        <div style={{
          padding: '14px 16px', marginBottom: '16px',
          backgroundColor: 'var(--linen)',
          border: '1.5px solid var(--mauve-pale)', borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={estimateFromPhoto} disabled={estimating}
              className="btn-couture" style={{ fontSize: '0.85rem', opacity: estimating ? 0.7 : 1 }}>
              {estimating ? '⏳ Analyse…' : '🔍 Estimer la surface'}
            </button>
            {estimatedArea && !estimating && (
              <span style={{ color: 'var(--sage)', fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ≈ {parseInt(estimatedArea).toLocaleString('fr-FR')} cm²
                <span style={{ fontSize: '0.75rem', color: 'var(--brun-mid)', fontWeight: 'normal', marginLeft: '6px' }}>
                  ({(parseInt(estimatedArea) / 10000).toFixed(3)} m²)
                </span>
              </span>
            )}
          </div>
          {estimateMsg && (
            <p style={{ fontSize: '0.78rem', color: 'var(--brun-mid)', fontStyle: 'italic', margin: '8px 0 0' }}>
              {estimateMsg}
            </p>
          )}
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--brun-mid)' }}>
              Surface estimée (cm²) — modifiable
            </label>
            <input className="field-input" type="number" min="1"
              value={estimatedArea} onChange={e => setEstimatedArea(e.target.value)}
              placeholder="Surface en cm²" style={{ marginTop: '4px' }} />
          </div>
        </div>
      )}

      {/* ── Notes ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <label className="field-label">Notes</label>
        <textarea className="field-input" value={notes} onChange={e => setNotes(e.target.value)}
          rows={3} style={{ resize: 'vertical' }}
          placeholder="Origine, lavage, remarques…" />
      </div>

      <button type="submit" className="btn-sage" style={{ width: '100%', justifyContent: 'center' }}>
        ＋ Ajouter le tissu
      </button>
    </form>
  );
}
