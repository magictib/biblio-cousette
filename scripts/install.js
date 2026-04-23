#!/usr/bin/env node

/**
 * Installation script pour Biblio Cousette
 * Lance npm install et configure l'application
 */

const { exec } = require('child_process');

console.log('🧵 Installation de Biblio Cousette...\n');

exec('npm install', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors de l\'installation:', error.message);
    process.exit(1);
  }

  console.log('✅ Dépendances installées avec succès!\n');
  console.log('📝 Prochaines étapes:');
  console.log('  1. npm run dev    - Lancer le serveur de développement');
  console.log('  2. npm run build  - Construire l\'application pour la production');
  console.log('  3. npm run lint   - Vérifier la qualité du code\n');
  console.log('🌐 Pour en savoir plus, consultez le README.md');
});
