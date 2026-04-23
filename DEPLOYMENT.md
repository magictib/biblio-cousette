# Guide de Déploiement - Biblio Cousette

## 🚀 Déploiement sur Vercel (Recommandé)

### Prérequis
- Compte Vercel (gratuit sur https://vercel.com)
- Repository GitHub avec votre code
- Node.js 18+ localement

### Étapes de Déploiement

#### 1. Préparation du Code

```bash
# Vérifier que tout compile
npm run build

# S'assurer que tout est commité
git add .
git commit -m "feat: Biblio Cousette v1.0.0"
git push origin main
```

#### 2. Connexion à Vercel

**Option A: Via GitHub (Recommandé)**
1. Allez sur https://vercel.com/new
2. Cliquez "Import Git Repository"
3. Connectez votre compte GitHub
4. Sélectionnez le repository `biblio-cousette`
5. Vercel détecte automatiquement Next.js
6. Cliquez "Deploy"

**Option B: CLI Vercel**

```bash
# Installer Vercel CLI
npm i -g vercel

# Connexion Vercel
vercel login

# Déployer
vercel
```

#### 3. Configuration Vercel

- **Framework Preset**: Next.js (auto-détecté)
- **Root Directory**: `./` (défaut)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 4. Variables d'Environnement (Optionnel)

Si vous utilisez Firebase:

1. Allez dans Settings → Environment Variables
2. Ajoutez les variables de `.env.example`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   ...
   ```
3. Redéployez

### URL de Déploiement

Après déploiement, votre app sera accessible à:
```
https://biblio-cousette.vercel.app
```
ou
```
https://<votre-username>.vercel.app
```

---

## 📦 Déploiement Docker (Alternative)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

### Construire et Lancer

```bash
# Build
docker build -t biblio-cousette .

# Lancer localement
docker run -p 3000:3000 biblio-cousette

# Ou déployer sur un service cloud (Railway, Render, etc.)
```

---

## 🌐 Déploiement sur Netlify (Alternative)

### Étapes

1. Allez sur https://netlify.com
2. Connectez votre repository GitHub
3. Configurez le build:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Déployez

**Note**: Netlify supporte mieux les sites statiques. Pour Next.js, préférez Vercel.

---

## 🔐 Configuration SSL/HTTPS

Vercel configure automatiquement:
- ✅ Certificat SSL gratuit
- ✅ HTTPS forcé
- ✅ Domaine personnalisé supporté

Pour un domaine personnalisé:
1. Settings → Domains
2. Ajoutez votre domaine
3. Configurez les DNS records
4. Vercel génère le certificat SSL auto

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```bash
# Dans package.json, les packages suivants sont optionnels:
npm install @vercel/analytics
npm install @vercel/web-vitals
```

Puis dans `src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({children}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Logs & Debugging

- **Vercel Dashboard**: Fonction Logs pour voir runtime logs
- **Build Logs**: Visibles lors du build/redeploy

---

## 🔄 Continuous Deployment (CD)

### GitHub Actions Automatique

Vercel redéploie automatiquement quand vous:
- Poussez vers `main` (production)
- Ouvrez une Pull Request (preview)

Pour désactiver ou configurer:
- Settings → Git Integrations → Vercel

### Déploiement Staging

```bash
# Créer une branche staging
git checkout -b staging
git push origin staging

# Sur Vercel, vous pouvez configurer:
# - main → production.biblio-cousette.vercel.app
# - staging → staging.biblio-cousette.vercel.app
```

---

## 📈 Performance Optimization

### Actuellement Activé
- ✅ Image optimization (Next.js)
- ✅ Code splitting automatique
- ✅ Minification CSS/JS
- ✅ Prerendering pages statiques

### Améliorations Futures
- [ ] Service Worker pour offline support
- [ ] Caching stratégies
- [ ] Compression Gzip/Brotli
- [ ] CDN edge caching

---

## 🐛 Troubleshooting Déploiement

### Build Fails
```bash
# Tester localement d'abord
npm run build

# Si erreur, vérifier:
# - Tous les imports sont corrects
# - Pas de dépendances manquantes
# - TypeScript compile sans erreurs
npm run lint
```

### Pages Blanches
- Vérifier que le build a réussi
- Vérifier les logs Vercel
- Vider le cache du navigateur (Ctrl+Shift+Del)

### localStorage Vide Après Deploy
- Les données localStorage sont côté client
- Elles ne se synchro pas d'appareils
- Solution: Ajouter Firebase/Backend

### Rate Limiting
- Vercel: Pas de limitation par défaut
- Fonctions Edge: 10 secondes max
- Stockage: Limité au navigateur (localStorage)

---

## 🔐 Sécurité

### Recommandations

1. **Données Sensibles**
   - NE PAS stocker les mots de passe en localStorage
   - Utiliser `httpOnly` cookies pour tokens

2. **CORS**
   - Actuellement localhost uniquement
   - À configurer si API externe

3. **HTTPS**
   - Automatique sur Vercel
   - Obligatoire en production

4. **Variables d'Environnement**
   - `NEXT_PUBLIC_*` = visibles côté client
   - Sans prefix = serveur seulement
   - Jamais commit `.env.local`

---

## ✅ Checklist Pré-Déploiement

- [ ] `npm run build` réussit localement
- [ ] `npm run lint` sans erreurs
- [ ] Testé sur `npm start` (production)
- [ ] Tous les secrets en `.env.local`
- [ ] Git history propre
- [ ] README.md à jour
- [ ] Pas de console errors/warnings
- [ ] localStorage test sur chrome/firefox
- [ ] Responsive design check
- [ ] Performance audit (Lighthouse)

---

## 📞 Support Déploiement

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs/deployment
- **Community**: https://github.com/vercel/next.js/discussions

---

**Dernier déploiement**: 23 Avril 2026
**Version**: 1.0.0 ✅ Production Ready
