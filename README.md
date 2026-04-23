# Biblio Cousette 👗✂️

Une application web moderne pour gérer votre collection de tissu et patrons de couture, avec visualisation 2D pour tester l'ajustement des patrons sur votre tissu et suivre vos projets créatifs.

## Fonctionnalités principales

✅ **Inventaire de Tissu**
- Enregistrez vos tissus avec dimensions, couleur, type et motif
- Support des unités cm et pouces
- Notes et photos associées

✅ **Inventaire de Patron**
- Ajoutez vos patrons avec dimensions et niveau de difficulté
- Catégorisez par type de vêtement
- Notes détaillées

✅ **Testeur de Patron (Feature phare)**
- Sélectionnez un tissu et un patron
- Visualisation 2D interactive avec canvas
- Vérification automatique d'ajustement (horizontal et vertical)
- Indication des orientations possibles

✅ **Galerie de Projets**
- Créez un projet en sélectionnant tissu + patron
- Suivi d'avancement par étape :
  - 📋 Planning
  - 🧵 Brodage
  - ✂️ Découpe
  - 🪡 Couture
  - ✨ Finition
  - ✅ Complète
- Galerie de photos pour chaque projet
- Notes et historique

## Technologies

- **Frontend**: Next.js 16+ avec App Router
- **Style**: Tailwind CSS 4
- **Language**: TypeScript
- **Storage**: localStorage (mode local) / Firebase (optionnel)
- **Visualisation**: Canvas HTML5 2D
- **Deployment**: Vercel

## Installation

### Prérequis
- Node.js 18+ et npm

### Développement local

```bash
# Cloner le projet
git clone <repo-url>
cd biblio-cousette

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir l'application.

## Utilisation

1. **Ajouter un tissu** : Allez dans "Inventaire" → "Tissu" → "Ajouter"
2. **Ajouter un patron** : Allez dans "Inventaire" → "Patron" → "Ajouter"
3. **Tester l'ajustement** : Allez dans "Testeur de Patron", sélectionnez un tissu et un patron, puis "Vérifier l'ajustement"
4. **Créer un projet** : Allez dans "Mes Projets" → "Nouveau Projet"
5. **Suivre l'avancement** : Cliquez sur le badge d'étape pour changer le statut
6. **Ajouter des photos** : Cliquez sur "📷 Ajouter" dans la galerie du projet

## Configuration

### Firebase (optionnel)

Pour utiliser Firebase au lieu de localStorage :

1. Créez un projet Firebase
2. Copiez vos credentials dans `.env.local`
3. Modifiez l'app pour utiliser l'authentification et la base de données Firebase

`.env.example`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Déploiement

### Vercel (recommandé)

```bash
# Connexion à Vercel
npm i -g vercel
vercel

# Ou en connectant votre repo GitHub sur https://vercel.com
```

### Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Page d'accueil avec tabs
│   └── globals.css      # Styles globaux
├── components/
│   ├── Inventory.tsx           # Gestion inventaire
│   ├── FabricForm.tsx          # Formulaire tissu
│   ├── PatternForm.tsx         # Formulaire patron
│   ├── FabricList.tsx          # Affichage tissus
│   ├── PatternList.tsx         # Affichage patrons
│   ├── PatternFitter.tsx       # Testeur principal
│   ├── VisualizationCanvas.tsx # Visualisation 2D
│   ├── ProjectGallery.tsx      # Galerie projets
│   ├── ProjectForm.tsx         # Nouveau projet
│   └── ProjectCard.tsx         # Card projet
└── types/
    └── index.ts         # Types TypeScript
```

## Données stockées

Toutes les données sont actuellement stockées dans `localStorage` :
- `fabrics` - Liste des tissus
- `patterns` - Liste des patrons
- `projects` - Liste des projets

Les données persistent même après fermeture du navigateur.

## Fonctionnalités futures

- [ ] Authentification utilisateur (Firebase)
- [ ] Synchronisation multi-appareils
- [ ] Export/Import en CSV/JSON
- [ ] Calculs plus avancés (coutures, marges)
- [ ] Suggestions d'ajustement (rotation, placement optimisé)
- [ ] Galerie communautaire
- [ ] Wishlist de tissus et patrons
- [ ] Intégration boutiques en ligne

## Contribution

Les contributions sont bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT

## Auteur

Créé par la communauté des couturiers créatifs 🧵✨

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
