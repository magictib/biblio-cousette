import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Biblio Cousette",
  description: "Ma bibliothèque de couture — tissus, patrons & projets",
};

function NeedleLogo() {
  return (
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Corps de l'aiguille */}
      <path d="M17 41 L14 15 L17 5 L20 15 Z" fill="#D0CCD8" stroke="#9A8FA8" strokeWidth="0.8"/>
      {/* Chas (trou) */}
      <ellipse cx="17" cy="13" rx="2.6" ry="3.4" fill="white" stroke="#9A8FA8" strokeWidth="0.9"/>
      {/* Pointe */}
      <path d="M15.5 39 L17 42 L18.5 39 Z" fill="#B0ACB8"/>
      {/* Fil passé dans le chas, qui descend en courbe */}
      <path
        d="M17 13 C24 11 28 20 22 30 C18 37 20 40 17 42"
        stroke="#C4889A"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Second brin du fil — légère ondulation */}
      <path
        d="M17 13 C11 9 8 18 14 26"
        stroke="#C4889A"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="2 3"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {/* ── En-tête ───────────────────────────────────────────────── */}
        <header style={{
          backgroundColor: "var(--creme)",
          borderBottom: "2px solid var(--mauve-light)",
          boxShadow: "0 2px 10px rgba(122, 79, 92, 0.1)",
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "68px",
            }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <NeedleLogo />
                <div>
                  <h1 style={{
                    color: "var(--mauve)",
                    fontFamily: "Georgia, serif",
                    fontSize: "1.45rem",
                    fontWeight: "bold",
                    lineHeight: 1.1,
                    margin: 0,
                  }}>
                    Biblio Cousette
                  </h1>
                  <p style={{
                    color: "var(--brun-mid)",
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    margin: 0,
                    marginTop: "2px",
                  }}>
                    Ma bibliothèque de couture
                  </p>
                </div>
              </div>

              {/* Décoration fil-tirets centrée */}
              <div style={{
                flex: 1,
                margin: "0 32px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }} className="hidden md:flex">
                <span style={{ color: "var(--mauve-light)", fontSize: "1.1rem" }}>✂️</span>
                <div style={{
                  flex: 1,
                  height: "2px",
                  background: "repeating-linear-gradient(90deg, var(--mauve-light) 0px, var(--mauve-light) 8px, transparent 8px, transparent 14px)",
                  opacity: 0.5,
                }} />
                <span style={{ color: "var(--mauve-light)", fontSize: "1.1rem" }}>🪡</span>
                <div style={{
                  flex: 1,
                  height: "2px",
                  background: "repeating-linear-gradient(90deg, var(--mauve-light) 0px, var(--mauve-light) 8px, transparent 8px, transparent 14px)",
                  opacity: 0.5,
                }} />
                <span style={{ color: "var(--mauve-light)", fontSize: "1.1rem" }}>✨</span>
              </div>

              {/* Tagline droite */}
              <p style={{
                color: "var(--brun-mid)",
                fontSize: "0.8rem",
                fontStyle: "italic",
                fontFamily: "Georgia, serif",
              }} className="hidden lg:block">
                Couper · Coudre · Créer
              </p>
            </div>
          </div>

          {/* Ligne de surpiqûre bas de l'en-tête */}
          <div style={{
            height: "5px",
            background: "repeating-linear-gradient(90deg, var(--mauve) 0px, var(--mauve) 10px, transparent 10px, transparent 18px)",
            opacity: 0.45,
          }} />
        </header>

        {/* ── Contenu principal ──────────────────────────────────────── */}
        <main style={{ minHeight: "100vh" }}>
          {children}
        </main>

        {/* ── Pied de page ──────────────────────────────────────────── */}
        <footer style={{
          backgroundColor: "var(--brun)",
          color: "var(--linen)",
          textAlign: "center",
          padding: "20px 24px",
          marginTop: "48px",
        }}>
          {/* Ligne de surpiqûre haut du footer */}
          <div style={{
            height: "3px",
            background: "repeating-linear-gradient(90deg, var(--mauve-light) 0px, var(--mauve-light) 8px, transparent 8px, transparent 14px)",
            opacity: 0.35,
            marginBottom: "14px",
          }} />
          <p style={{ fontSize: "0.85rem", fontFamily: "Georgia, serif", margin: 0 }}>
            © 2026 Biblio Cousette — Organisez votre passion créative
          </p>
        </footer>
      </body>
    </html>
  );
}
