# FinTrack 💰

> Application de gestion des finances personnelles — React + TypeScript + Tailwind CSS

![FinTrack Dashboard Preview](https://via.placeholder.com/800x400/0f172a/22c55e?text=FinTrack+Dashboard)

## 🚀 Démo en ligne

- **Déploiement** : [https://fintrack-app.vercel.app](https://fintrack-app.vercel.app)
- **Dépôt GitHub** : [https://github.com/votre-username/fintrack](https://github.com/votre-username/fintrack)

---

## 📋 Description

**FinTrack** est une application frontend complète de gestion des finances personnelles qui permet aux utilisateurs de :

- Suivre leurs **revenus** et **dépenses** en temps réel
- Visualiser leur **solde total** et leur **taux d'épargne**
- Analyser leurs dépenses par **catégorie** via des graphiques interactifs
- Définir et suivre des **objectifs budgétaires**
- Consulter l'**historique** de leurs transactions

## 🏗️ Architecture du projet

```
fintrack/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── layout/         # Layout, Sidebar, Header
│   │   ├── ui/             # Boutons, Inputs, Cards
│   │   ├── auth/           # Composants d'authentification
│   │   ├── dashboard/      # Composants du tableau de bord
│   │   └── landing/        # Composants Landing Page
│   ├── context/
│   │   └── AuthContext.tsx # Contexte d'authentification
│   ├── pages/
│   │   ├── LandingPage.tsx # Page d'accueil
│   │   ├── AuthPage.tsx    # Login / Inscription / Reset
│   │   └── DashboardPage.tsx # Tableau de bord
│   ├── types/
│   │   └── index.ts        # Types TypeScript
│   ├── utils/
│   │   └── data.ts         # Données mock & utilitaires
│   ├── App.tsx             # Routing principal
│   ├── main.tsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🛠️ Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.2 | Framework UI |
| TypeScript | 5.2 | Typage statique |
| Tailwind CSS | 3.4 | Styles utilitaires |
| Vite | 5.1 | Bundler & dev server |
| React Router | 6.22 | Navigation SPA |
| Recharts | 2.12 | Graphiques interactifs |
| Lucide React | 0.383 | Icônes |

## 🖥️ Pages développées

### 1. Landing Page (`/`)
- Navbar responsive avec menu mobile
- Section Hero avec aperçu du dashboard
- Statistiques clés (50k+ utilisateurs, 98% satisfaction)
- Grille des fonctionnalités (6 features)
- Section témoignages
- Bannière CTA
- Footer

### 2. Page d'authentification (`/auth`)
- **Connexion** : email + mot de passe
- **Inscription** : nom + email + mot de passe + confirmation
- **Réinitialisation** : envoi d'email de reset avec confirmation
- Toggle password visible/caché
- Validation des formulaires
- Gestion des erreurs
- Loading states
- Panel décoratif avec statistiques (desktop)

### 3. Dashboard (`/dashboard`)
- Sidebar de navigation avec profil utilisateur
- Header avec barre de recherche & notifications
- 4 cartes de statistiques (Solde, Revenus, Dépenses, Épargne)
- Graphique d'évolution (AreaChart 6 mois)
- Graphique de répartition (PieChart catégories)
- Graphique par catégorie (BarChart)
- Liste des transactions récentes
- Suivi du budget avec barres de progression

## ⚡ Installation & Démarrage

```bash
# Cloner le projet
git clone https://github.com/votre-username/fintrack.git
cd fintrack

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

L'application sera disponible sur `http://localhost:5173`

## 🌿 GitFlow — Stratégie de branches

Ce projet utilise la méthodologie **GitFlow** pour la gestion des branches :

### Structure des branches

```
main                    # Production — code stable et déployé
└── develop             # Développement — intégration des features
    ├── feature/landing-page        # Feature branches
    ├── feature/auth-system
    ├── feature/dashboard-ui
    ├── feature/charts-integration
    └── feature/transaction-list
```

### Conventions de nommage

```
feature/nom-de-la-fonctionnalite   # Nouvelles fonctionnalités
bugfix/description-du-bug           # Corrections de bugs
hotfix/description-urgente          # Fixes urgents en production
release/v1.0.0                      # Préparation d'une release
```

### Workflow de collaboration

```bash
# 1. Partir toujours de develop
git checkout develop
git pull origin develop

# 2. Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# 3. Développer et committer
git add .
git commit -m "feat: ajout du composant StatCard"

# 4. Push la branche
git push origin feature/ma-fonctionnalite

# 5. Créer une Pull Request vers develop sur GitHub
# (via l'interface GitHub)

# 6. Review par au moins 1 coéquipier
# 7. Merge après approbation

# 8. Pour une release
git checkout -b release/v1.0.0
git merge develop
# Après tests :
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
```

### Convention de commits (Conventional Commits)

```
feat: nouvelle fonctionnalité
fix: correction de bug
style: changements CSS/styling
refactor: refactoring sans changement fonctionnel
docs: documentation
test: ajout de tests
chore: tâches de maintenance
```

### Exemples de commits

```bash
git commit -m "feat: add authentication page with login/register tabs"
git commit -m "feat: integrate Recharts for dashboard visualizations"
git commit -m "fix: mobile sidebar not closing on nav click"
git commit -m "style: improve card hover animations"
git commit -m "refactor: extract TransactionRow into separate component"
git commit -m "docs: update README with GitFlow instructions"
```

## 🚀 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Production
vercel --prod
```

**Configuration Vercel :**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Netlify

```bash
# Build
npm run build

# Déployer le dossier dist/ via Netlify Drop
# ou via Netlify CLI :
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Important :** Ajouter un fichier `public/_redirects` :
```
/* /index.html 200
```

### GitHub Pages

Décommenter et configurer dans `vite.config.ts` :
```ts
base: '/fintrack/',
```

Puis utiliser GitHub Actions (`.github/workflows/deploy.yml` inclus).

## 🎨 Design System

### Palette de couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Brand Green | `#22c55e` | Couleur principale, CTA |
| Dark 950 | `#020617` | Background principal |
| Dark 900 | `#0f172a` | Cards, sidebar |
| Dark 800 | `#1e293b` | Inputs, éléments UI |
| Dark 400 | `#94a3b8` | Texte secondaire |

### Typographie
- **Police principale** : Plus Jakarta Sans (Google Fonts)
- **Police monospace** : JetBrains Mono
- **Tailles** : 12px → 72px avec échelle harmonieuse

## 👥 Équipe

| Membre | Rôle | Branches |
|--------|------|----------|
| Prénom NOM | Lead Dev / Landing Page | feature/landing-page |
| Prénom NOM | Auth & Routing | feature/auth-system |
| Prénom NOM | Dashboard UI | feature/dashboard-ui |
| Prénom NOM | Charts & Data | feature/charts-integration |

## 📄 Licence

Ce projet est réalisé dans le cadre d'un projet académique.

---

*Projet réalisé avec ❤️ — Gestion des Finances Personnelles*
