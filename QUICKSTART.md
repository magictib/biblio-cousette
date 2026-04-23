# 🚀 Démarrage Rapide - Biblio Cousette

## Installation & Lancement (2 minutes)

### Prérequis
- Node.js 18+ (télécharger: https://nodejs.org)
- npm (inclus avec Node.js)

### 1️⃣ Installation

```bash
# Clone le projet (ou zip téléchargé)
cd biblio-cousette

# Installe les dépendances
npm install
```

### 2️⃣ Lancer l'application

```bash
# Démarre le serveur développement
npm run dev
```

### 3️⃣ Ouvrir dans le navigateur

L'app est maintenant accessible à:
```
http://localhost:3000
```

---

## ✨ Utilisation Rapide

### 📦 Ajouter un Tissu
1. Cliquez sur **"📦 Inventaire"** → **"Ajouter"**
2. Remplissez le formulaire (nom, couleur, dimensions)
3. Cliquez **"Ajouter le tissu"**

### 📋 Ajouter un Patron
1. Allez à l'onglet **"Patron"** 
2. Cliquez **"Ajouter"**
3. Entrez les détails (nom, type, dimensions)
4. Cliquez **"Ajouter le patron"**

### 📐 Tester l'Ajustement
1. Allez à **"Testeur de Patron"**
2. Sélectionnez un **tissu** et un **patron**
3. Cliquez **"Vérifier l'ajustement"**
4. 🎨 Voyez la visualisation 2D!

### 📸 Créer un Projet
1. Allez à **"Mes Projets"** → **"Nouveau Projet"**
2. Sélectionnez le tissu + patron
3. Définissez l'étape initiale
4. Créez le projet!

### 📷 Ajouter des Photos
1. Dans votre projet, cliquez **"📷 Ajouter"**
2. Entrez l'URL d'une image
3. Regardez votre galerie se remplir!

### ✓ Suivre l'Avancement
1. Cliquez sur le badge **d'étape** du projet
2. Changez vers: Planning → Brodage → Découpe → Couture → Finition → Complète

---

## 💾 Données

Toutes vos données sont sauvegardées **automatiquement** dans le navigateur (localStorage).

- ✅ Pas de compte nécessaire
- ✅ Données persistentes (même après fermeture)
- ✅ Privé (pas d'envoi à un serveur)
- ❌ Limité à un appareil/navigateur

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev          # Serveur avec hot reload

# Production
npm run build        # Construire pour production
npm start            # Serveur production

# Qualité du code
npm run lint         # Vérifier erreurs TypeScript/ESLint

# Nettoyage
rm -rf .next        # Supprimer cache build
npm cache clean     # Nettoyer cache npm
```

---

## 📱 Unités

L'app supporte **centimètres (cm)** et **pouces (inch)**:
- 1 pouce = 2.54 cm
- Changez l'unité dans les formulaires

---

## 🎨 Customization

### Changer les couleurs
Éditez `src/app/globals.css`:
```css
@theme inline {
  --color-primary: #purple-600;
  --color-secondary: #blue-600;
}
```

### Ajouter des champs
1. Éditez le type dans `src/types/index.ts`
2. Ajoutez le champ dans le formulaire
3. Sauvegardez dans localStorage

---

## 🚨 Problèmes Courants

### "L'app ne charge pas" 
→ Vérifiez que le serveur tourne (`npm run dev`)  
→ Ouvrez http://localhost:3000 (pas http://0.0.0.0:3000)

### "Mes données ont disparu"
→ localStorage est limité au navigateur  
→ Si vous avez vidé le cache → les données sont perdues  
→ Solution: Exportez vos données régulièrement (feature future)

### "npm: command not found"
→ Node.js n'est pas installé  
→ Téléchargez depuis https://nodejs.org  
→ Redémarrez votre terminal après installation

### "Erreur de build"
```bash
# Nettoyer et reconstruire
rm -rf node_modules
npm cache clean --force
npm install
npm run build
```

---

## 🌐 Déployer en Ligne

### Sur Vercel (5 clics)
1. Poussez votre code sur GitHub
2. Allez sur https://vercel.com/new
3. Importez votre repo
4. Cliquez "Deploy"
5. 🎉 Votre app est en ligne!

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails.

---

## 📚 Documentation Complète

- **Usage Guide**: [README.md](./README.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Code Guidelines**: [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

## ❓ Questions / Bugs

1. Vérifiez la console (F12 → Console)
2. Regardez les logs du serveur (`npm run dev`)
3. Consultez [README.md](./README.md)
4. Ouvrez une issue sur GitHub

---

## 🎯 Prochaines Étapes

- [ ] Ajouter vos premiers tissus
- [ ] Ajouter vos premiers patrons
- [ ] Tester la visualisation 2D
- [ ] Créer votre premier projet
- [ ] Ajouter des photos
- [ ] Partager votre retour! 💌

---

**Happy Creating!** 🧵✨

Made with ❤️ by la communauté des couturiers créatifs
