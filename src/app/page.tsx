'use client';

import { useState } from 'react';
import Inventory from '@/components/Inventory';
import ProjectGallery from '@/components/ProjectGallery';
import LayPlanTool from '@/components/LayPlanTool';
import CreationShare from '@/components/CreationShare';
import AuthGate from '@/components/AuthGate';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';

type Tab = 'inventory' | 'projects' | 'layplan' | 'partage';

const navItems: { id: Tab; label: string; sublabel: string; mobileLabel: string }[] = [
  { id: 'inventory', label: 'Inventaire',  sublabel: 'Tissus & Patrons',      mobileLabel: 'Inventaire' },
  { id: 'layplan',   label: 'Placement',   sublabel: 'Découpe & disposition', mobileLabel: 'Placement'  },
  { id: 'projects',  label: 'Projets',     sublabel: 'Ma galerie',            mobileLabel: 'Projets'    },
  { id: 'partage',   label: 'Partage',     sublabel: 'Mes créations',         mobileLabel: 'Partage'    },
];

function SewingButton({ active }: { active: boolean }) {
  const bg     = active ? 'var(--mauve)'            : 'var(--creme)';
  const border = active ? 'var(--brun)'             : 'var(--mauve-light)';
  const hole   = active ? 'rgba(253,250,242,.85)'   : 'var(--mauve-light)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      style={{ filter: active ? 'drop-shadow(0 1px 4px rgba(122,79,92,.45))' : 'none' }}>
      <circle cx="12" cy="12" r="11" fill={bg} stroke={border} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke={active ? 'rgba(61,36,24,.08)' : 'transparent'} strokeWidth="1"/>
      <circle cx="8.2"  cy="8.2"  r="1.9" fill={hole}/>
      <circle cx="15.8" cy="8.2"  r="1.9" fill={hole}/>
      <circle cx="8.2"  cy="15.8" r="1.9" fill={hole}/>
      <circle cx="15.8" cy="15.8" r="1.9" fill={hole}/>
      {active && (
        <g stroke="rgba(253,250,242,.45)" strokeWidth="1">
          <line x1="8.2" y1="8.2"  x2="15.8" y2="15.8"/>
          <line x1="15.8" y1="8.2" x2="8.2"  y2="15.8"/>
        </g>
      )}
    </svg>
  );
}

function NavIcon({ id, active }: { id: Tab; active: boolean }) {
  const col = active ? 'var(--mauve)' : 'var(--brun-mid)';
  if (id === 'inventory') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
  if (id === 'layplan') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="8" height="10" rx="1"/>
      <rect x="13" y="3" width="8" height="6" rx="1"/>
      <rect x="13" y="13" width="8" height="8" rx="1"/>
      <rect x="3" y="17" width="8" height="4" rx="1"/>
    </svg>
  );
  if (id === 'partage') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

export default function Home() {
  const { authUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--creme)' }}>
        <div style={{ textAlign: 'center', color: 'var(--mauve)', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🧵</div>
          <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (!authUser) return <AuthGate />;

  const { uid, username } = authUser;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px' }}>

      {/* ── Bandeau profil ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '12px', marginBottom: '16px',
        padding: '8px 16px', backgroundColor: 'var(--mauve-pale)',
        border: '1.5px solid var(--mauve-light)', borderRadius: '9px',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--mauve)', fontFamily: 'Georgia, serif' }}>
          🧶 <strong>{username}</strong>
        </span>
        <button
          onClick={() => signOut()}
          style={{
            padding: '4px 12px', borderRadius: '6px', border: '1.5px solid var(--mauve-light)',
            backgroundColor: 'var(--creme)', color: 'var(--brun-mid)',
            cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.78rem',
          }}
        >
          Déconnexion
        </button>
      </div>

      {/* ── Navigation mobile ─────────────────────────────────────── */}
      <nav className="md:hidden" style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex', gap: '6px', padding: '10px',
          backgroundColor: 'var(--creme)', border: '1.5px solid var(--mauve-light)',
          borderRadius: '10px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '4px', border: '1px dashed var(--mauve-light)', borderRadius: '6px', opacity: 0.35, pointerEvents: 'none' }}/>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === item.id ? 'var(--mauve)' : 'transparent',
                color: activeTab === item.id ? 'var(--creme)' : 'var(--brun-mid)',
                fontFamily: 'Georgia, serif', fontSize: '0.75rem',
                fontWeight: activeTab === item.id ? 'bold' : 'normal',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              }}>
              <NavIcon id={item.id} active={activeTab === item.id} />
              {item.mobileLabel}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Layout desktop : sidebar + contenu ────────────────────── */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        <aside className="hidden md:block" style={{ width: '210px', flexShrink: 0, position: 'sticky', top: '88px' }}>
          <p style={{ color: 'var(--brun-mid)', fontSize: '0.67rem', letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: '18px', paddingLeft: '38px', fontFamily: 'Georgia, serif' }}>
            Sections
          </p>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '12px', top: '12px', bottom: '12px', width: '2px',
              background: 'linear-gradient(180deg, var(--mauve-pale) 0%, var(--mauve-light) 25%, var(--mauve) 50%, var(--mauve-light) 75%, var(--mauve-pale) 100%)',
              borderRadius: '2px',
            }}/>

            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginBottom: '22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                    <SewingButton active={isActive} />
                  </div>
                  <div style={{
                    flex: 1, padding: '8px 12px', borderRadius: '7px',
                    backgroundColor: isActive ? 'var(--mauve-pale)' : 'transparent',
                    border: isActive ? '1.5px solid var(--mauve-light)' : '1.5px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: isActive ? 'var(--mauve)' : 'var(--brun-mid)', fontFamily: 'Georgia, serif', fontWeight: isActive ? 'bold' : 'normal', fontSize: '0.95rem' }}>
                      <NavIcon id={item.id} active={isActive} />
                      {item.label}
                    </div>
                    <div style={{ color: 'var(--brun-mid)', fontSize: '0.7rem', opacity: 0.7, marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                      {item.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '12px', paddingLeft: '4px', opacity: 0.45 }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="28" r="14" fill="var(--mauve-pale)" stroke="var(--mauve-light)" strokeWidth="1.5"/>
              <ellipse cx="24" cy="28" rx="7" ry="14" fill="none" stroke="var(--mauve-light)" strokeWidth="1" opacity="0.6"/>
              <ellipse cx="24" cy="28" rx="14" ry="7" fill="none" stroke="var(--mauve-light)" strokeWidth="1" opacity="0.6"/>
              <path d="M24 14 C28 8 36 6 38 2" stroke="var(--mauve-light)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div className="card-stitched">
            {activeTab === 'inventory' && <Inventory uid={uid} />}
            {activeTab === 'layplan'   && <LayPlanTool uid={uid} />}
            {activeTab === 'projects'  && <ProjectGallery uid={uid} />}
            {activeTab === 'partage'   && <CreationShare uid={uid} username={username} />}
          </div>
        </main>
      </div>
    </div>
  );
}
