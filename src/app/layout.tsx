import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Biblio Cousette - Gestion de Collection de Tissu et Patrons",
  description: "Organisez votre collection de tissu et patrons de couture, et testez l'ajustement des patrons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-purple-50 to-blue-50">
        <nav className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-purple-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">✂️</div>
                <h1 className="text-xl font-bold text-purple-600">Biblio Cousette</h1>
              </div>
              <div className="text-sm text-gray-600">
                <span>Gestion de tissu et patrons</span>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center py-4 mt-12">
          <p>© 2026 Biblio Cousette - Organisez votre passion créative</p>
        </footer>
      </body>
    </html>
  );
}
