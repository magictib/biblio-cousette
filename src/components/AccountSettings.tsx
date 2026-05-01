'use client';

import { useState } from 'react';
import { type User } from 'firebase/auth';
import { changeUsername, changePassword } from '@/lib/auth';

interface Props {
  user: User;
  username: string;
  onUsernameChanged: (newUsername: string) => void;
  onClose: () => void;
}

type Section = 'username' | 'password';

export default function AccountSettings({ user, username, onUsernameChanged, onClose }: Props) {
  const [section,     setSection]     = useState<Section>('username');

  // Changer identifiant
  const [newUsername, setNewUsername] = useState('');
  const [pwForUser,   setPwForUser]   = useState('');

  // Changer mot de passe
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => {
    setError(''); setSuccess('');
    setNewUsername(''); setPwForUser('');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newUsername.trim()) return;
    setLoading(true);
    try {
      await changeUsername(user, username, pwForUser, newUsername.trim());
      setSuccess(`Identifiant changé en « ${newUsername.trim().toLowerCase()} »`);
      onUsernameChanged(newUsername.trim().toLowerCase());
      setPwForUser(''); setNewUsername('');
    } catch (err) {
      setError(String(err).replace('FirebaseError: Firebase: ', '').replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPw !== confirmPw) { setError('Les nouveaux mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await changePassword(user, username, currentPw, newPw);
      setSuccess('Mot de passe modifié avec succès.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setError(String(err).replace('FirebaseError: Firebase: ', '').replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(61,36,24,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: 'var(--creme)', border: '2px solid var(--mauve-light)',
        borderRadius: '12px', width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 40px rgba(61,36,24,.2)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: '6px', border: '1.5px dashed var(--mauve-pale)', borderRadius: '8px', pointerEvents: 'none', opacity: 0.4 }} />

        {/* En-tête */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid var(--mauve-pale)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', color: 'var(--mauve)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
              Mon compte
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--brun-mid)', margin: '2px 0 0', fontStyle: 'italic' }}>
              🧶 {username}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--brun-mid)', lineHeight: 1 }}>✕</button>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--mauve-pale)', position: 'relative', zIndex: 1 }}>
          {([['username', "Identifiant"], ['password', 'Mot de passe']] as [Section, string][]).map(([id, label]) => (
            <button key={id} onClick={() => { setSection(id); reset(); }}
              style={{
                flex: 1, padding: '11px', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                backgroundColor: section === id ? 'var(--mauve-pale)' : 'transparent',
                color: section === id ? 'var(--mauve)' : 'var(--brun-mid)',
                fontWeight: section === id ? 'bold' : 'normal',
                borderBottom: section === id ? '2px solid var(--mauve)' : '2px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>

          {/* Feedback */}
          {error && (
            <div style={{ backgroundColor: '#FAE8E8', border: '1px solid #D48080', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#943030' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: '#E8F5EC', border: '1px solid #80C894', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#2E7A46' }}>
              ✅ {success}
            </div>
          )}

          {/* ── Changer identifiant ─────────────────────────────── */}
          {section === 'username' && (
            <form onSubmit={handleChangeUsername} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="field-label">Nouvel identifiant</label>
                <input className="field-input" type="text" value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="nouveau_identifiant"
                  autoComplete="username"
                  required style={{ width: '100%', boxSizing: 'border-box' }} />
                <p style={{ fontSize: '0.68rem', color: 'var(--brun-mid)', margin: '4px 0 0', fontStyle: 'italic' }}>
                  Lettres minuscules, chiffres, _, ., - (min. 3 caractères)
                </p>
              </div>
              <div>
                <label className="field-label">Mot de passe actuel (confirmation)</label>
                <input className="field-input" type="password" value={pwForUser}
                  onChange={e => setPwForUser(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  required style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" className="btn-couture" disabled={loading}
                style={{ justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Modification…' : '✓ Changer l\'identifiant'}
              </button>
            </form>
          )}

          {/* ── Changer mot de passe ────────────────────────────── */}
          {section === 'password' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="field-label">Mot de passe actuel</label>
                <input className="field-input" type="password" value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  required style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label className="field-label">Nouveau mot de passe</label>
                <input className="field-input" type="password" value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  required style={{ width: '100%', boxSizing: 'border-box' }} />
                <p style={{ fontSize: '0.68rem', color: 'var(--brun-mid)', margin: '4px 0 0', fontStyle: 'italic' }}>
                  Minimum 6 caractères
                </p>
              </div>
              <div>
                <label className="field-label">Confirmer le nouveau mot de passe</label>
                <input className="field-input" type="password" value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  required style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" className="btn-couture" disabled={loading}
                style={{ justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Modification…' : '✓ Changer le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
