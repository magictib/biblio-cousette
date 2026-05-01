'use client';

import { useState, useEffect } from 'react';
import { getGeminiKey, setGeminiKey } from '@/utils/gemini';

export default function ApiKeySetup() {
  const [key,     setKey]     = useState('');
  const [saved,   setSaved]   = useState(false);
  const [hasKey,  setHasKey]  = useState(false);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    const k = getGeminiKey();
    setHasKey(!!k);
    if (!k) setOpen(true);
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    setGeminiKey(key.trim());
    setHasKey(true);
    setSaved(true);
    setOpen(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = () => {
    localStorage.removeItem('gemini_api_key');
    setHasKey(false);
    setKey('');
    setOpen(true);
  };

  if (!open) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '8px' }}>
        {saved && (
          <span style={{ fontSize: '0.75rem', color: 'var(--sage)', fontStyle: 'italic' }}>✅ Clé enregistrée</span>
        )}
        <button onClick={() => setOpen(true)}
          style={{
            fontSize: '0.72rem', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            border: `1.5px solid ${hasKey ? 'var(--sage)' : 'var(--mauve-light)'}`,
            backgroundColor: hasKey ? '#E8F5EC' : 'var(--mauve-pale)',
            color: hasKey ? '#2E7A46' : 'var(--mauve)',
            fontFamily: 'Georgia, serif',
          }}>
          {hasKey ? '🔑 Clé configurée' : '⚠️ Configurer la clé'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--mauve-pale)', border: '1.5px solid var(--mauve-light)',
      borderRadius: '10px', padding: '16px 20px', marginBottom: '16px',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-light)', borderRadius: '7px', pointerEvents: 'none', opacity: 0.35 }}/>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', fontWeight: 'bold', color: 'var(--mauve)', fontSize: '0.95rem' }}>
            🔑 Clé Google Gemini
          </p>
          <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: 'var(--brun-mid)', lineHeight: 1.5 }}>
            Obtenez une clé gratuite sur{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
              style={{ color: 'var(--mauve)', fontWeight: 'bold' }}>
              aistudio.google.com
            </a>
            {' '}(compte Google requis).
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="field-input"
              placeholder="AIzaSy..."
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={{ flex: '1 1 240px', fontSize: '0.85rem' }}
            />
            <button onClick={handleSave} className="btn-sage"
              style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}>
              Enregistrer
            </button>
            {hasKey && (
              <button onClick={handleRemove}
                style={{
                  padding: '7px 12px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)',
                  backgroundColor: 'transparent', color: 'var(--brun-mid)',
                  cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.8rem',
                }}>
                Supprimer
              </button>
            )}
          </div>
        </div>
        {hasKey && (
          <button onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brun-mid)', fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
