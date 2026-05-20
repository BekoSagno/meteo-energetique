# Déploiement GNE — Option A (Render / Railway)

## Backend API

### Variables d'environnement (dashboard cloud)

| Variable | Obligatoire | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | oui | `production` |
| `PORT` | non (fourni par la plateforme) | `3000` |
| `DATABASE_URL` | oui | URL PostgreSQL + PostGIS |
| `JWT_SECRET` | recommandé | chaîne aléatoire longue |
| `CORS_ORIGIN` | oui en prod | `https://votre-frontend.vercel.app` |

Copier le modèle depuis `backend/.env.example`.

### Commandes Render / Railway

- **Build** : `cd backend && npm install`
- **Start** : `cd backend && npm start`  
  (équivalent à `node src/index.js` — défini dans `package.json`)
- **Post-install** : `prisma generate` (automatique via `postinstall`)

### Base de données

1. Créer une instance **PostgreSQL avec PostGIS**.
2. Appliquer le schéma : `cd backend && npx prisma db push` (ou `prisma migrate deploy` si migrations versionnées).
3. Données de démo : `npm run db:seed` (une fois, en local ou via job one-shot).

### Santé

`GET https://votre-api.onrender.com/api/health`

### Signalements

`POST /api/reports` — **anonyme**, corps JSON :

```json
{ "reportType": "TOTAL_DARKNESS", "lat": 9.558, "lng": -13.647 }
```

Aucun OTP ni JWT requis.

---

## Compte Git / push

Associez le dépôt GitHub au compte **amedbekosagno989@gmail.com** (paramètres GitHub → email principal).

En local (une fois) :

```powershell
git config user.email "amedbekosagno989@gmail.com"
git config user.name "Votre Nom"
```

Puis créez le dépôt sur GitHub et :

```powershell
git remote add origin https://github.com/VOTRE_USER/meteo-energetique.git
git push -u origin main
```
