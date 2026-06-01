# Guide de Démarrage du Backend

## Problème Actuel
Le backend NestJS n'est pas accessible. Les erreurs indiquent que le serveur n'est pas démarré sur le port 3000.

## Solution : Démarrer le Backend

### 1. Vérifier que MongoDB est démarré
Le backend nécessite MongoDB pour fonctionner.

**Windows :**
- Vérifiez que MongoDB est installé et en cours d'exécution
- Par défaut, MongoDB écoute sur `mongodb://localhost:27017`

**Alternative :** Utilisez MongoDB Atlas (cloud) et configurez `DB_URI` dans `.env`

### 2. Configurer les variables d'environnement

Créez ou vérifiez le fichier `backend/.env` :

```env
# Port du backend (par défaut: 3000)
PORT=3000

# URI de connexion MongoDB
DB_URI=mongodb://localhost:27017/invoicia

# JWT Secret (générer une clé aléatoire)
JWT_SECRET=votre_secret_jwt_tres_securise

# Autres variables si nécessaire
```

### 3. Installer les dépendances (si nécessaire)

```bash
cd backend
npm install
```

### 4. Démarrer le backend

**Mode développement (avec rechargement automatique) :**
```bash
cd backend
npm run start:dev
```

**Mode production :**
```bash
cd backend
npm run build
npm run start:prod
```

### 5. Vérifier que le backend est démarré

Vous devriez voir dans la console :
```
═══════════════════════════════════════════════════════════
🚀 Application is running on: http://localhost:3000/api
═══════════════════════════════════════════════════════════
✅ MongoDB connected successfully
```

### 6. Tester la connexion

Ouvrez votre navigateur et allez sur :
- http://localhost:3000/api (devrait afficher une réponse JSON)

Ou testez avec curl :
```bash
curl http://localhost:3000/api
```

## Dépannage

### Erreur : "MongoDB n'est pas accessible"
- Vérifiez que MongoDB est démarré
- Vérifiez la variable `DB_URI` dans `.env`
- Testez la connexion : `mongosh mongodb://localhost:27017/invoicia`

### Erreur : "Port 3000 already in use"
- Changez le port dans `.env` : `PORT=3001`
- Ou arrêtez le processus qui utilise le port 3000

### Erreur : "Cannot find module"
- Exécutez `npm install` dans le dossier `backend`
- Vérifiez que `node_modules` existe

## Architecture

- **Frontend** : Port 3002 (Vite)
- **Backend** : Port 3000 (NestJS)
- **Proxy** : Vite redirige `/api` vers `http://localhost:3000`

Les requêtes du frontend vers `/api/*` sont automatiquement redirigées vers le backend.
