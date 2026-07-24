# FinTrack — Backend API REST

Backend NestJS pour l'application **FinTrack** (gestion de finances personnelles).
Réalisé dans le cadre de l'examen final *API REST* — M. SOUMARE, Licence 2 GI, 2025-2026.

## Stack technique

- **NestJS 10** — framework backend modulaire
- **TypeORM** + **SQLite** — base de données relationnelle (aucun serveur externe requis, portable)
- **JWT** (`@nestjs/jwt` + `passport-jwt`) — authentification
- **RBAC** — autorisation par rôles (`user` / `admin`) via guards custom
- **class-validator** / **class-transformer** — validation des DTO
- **Swagger** (`@nestjs/swagger`) — documentation interactive des endpoints
- **API externe** : [open.er-api.com](https://open.er-api.com) — taux de change en temps réel (gratuite, sans clé)

## Installation

```bash
npm install
cp .env.example .env
npm run seed      # crée les catégories, un compte admin et un compte démo avec des transactions
npm run start:dev
```

L'API est servie sur `http://localhost:3000/api`.
Documentation Swagger interactive : `http://localhost:3000/api/docs`.

## Comptes créés par le seed

| Rôle  | Email                 | Mot de passe |
|-------|------------------------|--------------|
| admin | admin@fintrack.sn      | admin123     |
| user  | amadou@fintrack.sn     | demo1234     |

## Architecture

```
src/
  auth/            # register, login, stratégie JWT
  users/            # profil, CRUD admin, changement de rôle
  transactions/     # ressource principale : CRUD + stats dashboard
  categories/        # CRUD catégories (lecture pour tous, écriture admin)
  exchange-rate/     # consommation de l'API externe (conversion de devises)
  common/
    guards/          # JwtAuthGuard (global), RolesGuard (RBAC)
    decorators/      # @Roles(), @Public(), @CurrentUser()
    enums/           # Role
    filters/         # HttpExceptionFilter (réponses d'erreur uniformisées)
  database/
    seed.ts          # jeu de données initial
```

## Authentification & autorisation

- Toutes les routes sont protégées par JWT **par défaut** (guard global `JwtAuthGuard`).
- Les routes `POST /auth/register` et `POST /auth/login` sont explicitement publiques (`@Public()`).
- Le rôle (`user` ou `admin`) est encodé dans le token et vérifié par `RolesGuard` sur les routes marquées `@Roles(Role.ADMIN)`.
- Un utilisateur normal ne voit et ne modifie que **ses propres** transactions ; un admin peut tout consulter.

## Endpoints principaux

### Auth (publics)
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter, recevoir un `accessToken` |
| GET | `/api/auth/profile` | Vérifier le token / profil connecté |

### Users
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/api/users/me` | connecté | Mon profil |
| PATCH | `/api/users/me` | connecté | Modifier mon profil (nom, devise, budget mensuel...) |
| GET | `/api/users` | admin | Lister tous les utilisateurs |
| GET | `/api/users/:id` | admin | Détail d'un utilisateur |
| PATCH | `/api/users/:id/role` | admin | Changer le rôle d'un utilisateur |
| DELETE | `/api/users/:id` | admin | Supprimer un utilisateur |

### Transactions (ressource principale)
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/transactions` | Créer une transaction (revenu/dépense) |
| GET | `/api/transactions` | Lister mes transactions (filtres : `type`, `category`, `from`, `to`) |
| GET | `/api/transactions/stats/summary` | Totaux revenus/dépenses/solde + répartition par catégorie |
| GET | `/api/transactions/:id` | Détail |
| PATCH | `/api/transactions/:id` | Modifier |
| DELETE | `/api/transactions/:id` | Supprimer |

### Categories
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/api/categories` | connecté | Lister |
| POST | `/api/categories` | admin | Créer |
| PATCH | `/api/categories/:id` | admin | Modifier |
| DELETE | `/api/categories/:id` | admin | Supprimer |

### Exchange Rate (API externe)
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/exchange-rate/:base` | Taux de change pour une devise de base (ex: `XOF`, `EUR`, `USD`) |
| GET | `/api/exchange-rate?amount=&from=&to=` | Convertir un montant entre deux devises |

## Codes HTTP & gestion des erreurs

Toutes les erreurs passent par un filtre global (`HttpExceptionFilter`) et renvoient un format uniforme :

```json
{
  "statusCode": 400,
  "message": "Le mot de passe doit faire au moins 6 caractères.",
  "error": "BadRequestException",
  "path": "/api/auth/register",
  "timestamp": "2026-07-24T02:00:00.000Z"
}
```

- `400` — validation DTO échouée (class-validator)
- `401` — token absent, invalide ou expiré
- `403` — rôle insuffisant (RBAC) ou tentative d'accès à une ressource d'un autre utilisateur
- `404` — ressource introuvable
- `409` — conflit (ex : email déjà utilisé)

## Connexion avec le frontend FinTrack

Le frontend (React/Vite) actuellement en mode simulation (`AuthContext.tsx` avec des mocks) doit être branché sur ces endpoints :

- Remplacer les fonctions `login`/`register` mockées par des appels à `POST /api/auth/login` et `POST /api/auth/register`.
- Stocker le `accessToken` reçu et l'envoyer dans le header `Authorization: Bearer <token>` sur chaque requête.
- Remplacer les données mockées de `src/utils/data.ts` par des appels à `GET /api/transactions` et `GET /api/transactions/stats/summary`.
- Penser à définir `FRONTEND_URL` dans `.env` pour que CORS autorise l'origine du frontend (par défaut `http://localhost:5173`).

## Notes

- **Base de données** : SQLite est utilisé pour la simplicité (zéro configuration, un seul fichier `fintrack.sqlite`). Pour la production, il suffit de changer le `type` dans `app.module.ts` (ex : `postgres`) et d'ajuster les identifiants de connexion — TypeORM gère nativement plusieurs SGBD.
- **API externe** : `open.er-api.com` est gratuite et ne nécessite aucune clé. Le code inclut une gestion d'erreur si le service est injoignable ou si une devise est invalide.
- **Bonus non implémentés** (Redis, Prometheus/Grafana, CI/CD, tests automatisés, Docker, déploiement) : à ajouter selon le temps disponible avant la deadline — l'architecture modulaire actuelle s'y prête bien.
