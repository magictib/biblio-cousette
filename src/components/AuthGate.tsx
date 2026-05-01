'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth';

type Mode = 'login' | 'signup';

export default function AuthGate() {
  const [mode,     setMode]     = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
      if (password.length < 6)  { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(username, password);
      } else {
        await signUp(username, password);
      }
    } catch (err) {
      const msg = String(err).replace('FirebaseError: Firebase: ', '').replace('Error: ', '');
      if (msg.includes('wrong-password') || msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
    setPassword('');
    setConfirm('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, var(--creme) 0%, var(--mauve-pale) 100%)',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)',
        borderRadius: '14px', padding: '36px 32px', position: 'relative',
        boxShadow: '0 8px 40px rgba(94,53,120,.15)',
      }}>
        {/* Cadre pointillé décoratif */}
        <div style={{ position: 'absolute', inset: '8px', border: '1.5px dashed var(--mauve-pale)', borderRadius: '9px', pointerEvents: 'none', opacity: 0.5 }} />

        {/* Logo / titre */}
        <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🧵</div>
          <h1 style={{
            fontFamily: 'Georgia, serif', color: 'var(--mauve)',
            fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 4px',
          }}>
            Biblio-Cousette
          </h1>
          <p style={{ color: 'var(--brun-mid)', fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre profil'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 1 }}>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--brun-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px', fontFamily: 'Georgia, serif' }}>
              Identifiant
            </label>
            <input
              className="field-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="votre_identifiant"
              autoComplete="username"
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {mode === 'signup' && (
              <p style={{ fontSize: '0.68rem', color: 'var(--brun-mid)', margin: '4px 0 0', fontStyle: 'italic' }}>
                Lettres minuscules, chiffres, _, ., - (min. 3 caractères)
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--brun-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px', fontFamily: 'Georgia, serif' }}>
              Mot de passe
            </label>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--brun-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px', fontFamily: 'Georgia, serif' }}>
                Confirmer le mot de passe
              </label>
              <input
                className="field-input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#FAE8E8', border: '1px solid #D48080',
              borderRadius: '6px', padding: '8px 12px',
              fontSize: '0.82rem', color: '#943030',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-couture"
            style={{
              width: '100%', justifyContent: 'center', fontSize: '0.95rem',
              padding: '11px', marginTop: '4px',
              opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? '⏳ Chargement…'
              : mode === 'login' ? '→ Se connecter' : '✦ Créer mon profil'}
          </button>
        </form>

        {/* Lien switch mode */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--brun-mid)', position: 'relative', zIndex: 1 }}>
          {mode === 'login' ? 'Pas encore de profil ?' : 'Déjà un profil ?'}
          {' '}
          <button
            onClick={switchMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mauve)', fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '0.82rem', padding: 0, textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'En créer un' : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  );
}
