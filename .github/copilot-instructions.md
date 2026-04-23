# Biblio Cousette - Instructions Copilot

## Project Overview

**Biblio Cousette** est une application web Next.js pour gérer une collection de tissu et de patrons de couture avec visualisation 2D de l'ajustement et suivi de projets créatifs.

### Key Features
- 📦 **Inventaire de Tissu** : Gestion complète avec dimensions, couleur, type, motif
- 📋 **Inventaire de Patron** : Catalogage des patrons par type et difficulté
- 📐 **Testeur de Patron** : Visualisation 2D interactive avec vérification d'ajustement
- 📸 **Galerie de Projets** : Suivi d'avancement et galerie photo
- 🔄 **Multi-unités** : Support cm et pouces
- 💾 **Stockage Local** : localStorage (Firebase optionnel)

## Technology Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS 4
- **Storage**: localStorage (Firebase-ready)
- **Build**: Turbopack
- **Deployment**: Vercel

## Project Structure

```
biblio-cousette/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with nav/footer
│   │   ├── page.tsx            # Main dashboard with tabs
│   │   └── globals.css         # Global Tailwind styles
│   ├── components/             # React components
│   │   ├── Inventory.tsx       # Main inventory container
│   │   ├── FabricForm.tsx      # Add fabric form
│   │   ├── PatternForm.tsx     # Add pattern form
│   │   ├── FabricList.tsx      # Display fabrics grid
│   │   ├── PatternList.tsx     # Display patterns grid
│   │   ├── PatternFitter.tsx   # Pattern fitting tool
│   │   ├── VisualizationCanvas.tsx # 2D canvas visualization
│   │   ├── ProjectGallery.tsx  # Projects management
│   │   ├── ProjectForm.tsx     # Create new project
│   │   └── ProjectCard.tsx     # Single project card
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── public/                     # Static assets
├── package.json               # Dependencies
├── tsconfig.json             # TS configuration
├── tailwind.config.ts        # Tailwind configuration
├── next.config.ts            # Next.js configuration
├── .env.example              # Environment variables template
└── README.md                 # User documentation
```

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Setup
- Copy `.env.example` to `.env.local` if using Firebase
- No environment variables required for localStorage mode

## Key Components

### Data Models (src/types/index.ts)
- `Fabric`: Tissu avec dimensions, couleur, motif, quantité
- `Pattern`: Patron avec dimensions, type, difficulté
- `Project`: Projet liant tissu+patron avec suivi d'avancement
- `FittingResult`: Résultat de vérification d'ajustement

### State Management
- Uses React hooks (useState, useEffect)
- localStorage persistence
- Client-side only (no server-side state)

### Storage Schema
```typescript
localStorage.fabrics = JSON.stringify(Fabric[])
localStorage.patterns = JSON.stringify(Pattern[])
localStorage.projects = JSON.stringify(Project[])
```

## Deployment

### Quick Deploy to Vercel
```bash
# Option 1: Push to GitHub and link on Vercel dashboard
git push origin main

# Option 2: Direct deploy
npm i -g vercel
vercel
```

### Build Output
- Next build creates `.next/` folder
- Static pages prerendered as HTML
- Ready for serverless deployment

## Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js config
- **Styling**: Tailwind CSS with custom color scheme
- **Naming**: camelCase for variables/functions, PascalCase for components
- **File Organization**: Separate concerns (components, types, utils)

## Common Tasks

### Adding a New Feature
1. Create component in `src/components/`
2. Import and use in page or parent component
3. Add types to `src/types/index.ts` if needed
4. Test with `npm run dev`
5. Build and commit

### Modifying Data Structure
1. Update type in `src/types/index.ts`
2. Update localStorage keys if needed
3. Migration scripts may be needed for existing data
4. Test with browser DevTools

### Deployment Checklist
- [ ] Code changes committed
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Test locally with `npm start`
- [ ] Push to main branch
- [ ] Vercel auto-deploys

## Firebase Integration (Future)

To enable Firebase:
1. Set environment variables in `.env.local`
2. Create `lib/firebase.ts` with Firebase config
3. Implement `useAuth()` hook
4. Replace localStorage with Firestore calls
5. Add authentication in layout

## Performance Considerations

- Memoize components if needed with `React.memo()`
- Use `useCallback()` for event handlers
- Canvas rendering optimized for ~500x500px
- No heavy computations on main thread

## Troubleshooting

### npm install fails
- Delete `node_modules/` and `package-lock.json`
- Run `npm cache clean --force`
- Try again: `npm install`

### Build fails
- Check TypeScript: `npm run lint`
- Clear cache: `rm -rf .next`
- Rebuild: `npm run build`

### localStorage not persisting
- Check if localStorage is enabled in browser
- Clear browser cache and try again
- Check for private/incognito mode

## Future Enhancements

- [ ] Firebase backend & authentication
- [ ] User accounts & multi-device sync
- [ ] CSV/JSON export-import
- [ ] Advanced fitting algorithms
- [ ] Community pattern library
- [ ] Wishlist & shopping integration
- [ ] Print-friendly PDF export
- [ ] Mobile app (React Native)

## Contact & Support

For questions or issues:
- Check README.md for user guide
- Review code comments for implementation details
- Check commit history for feature timeline
- Test locally before deploying changes

---

**Last Updated**: April 23, 2026  
**Status**: ✅ Production Ready (v1.0.0)
