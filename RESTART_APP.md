# Guide de Redémarrage de l'Application

## ✅ État Actuel
- ✅ Code compilé sans erreurs
- ✅ Logger NestJS configuré dans tous les services
- ✅ Gestion d'erreurs améliorée
- ✅ Modèle User ajouté dans ProjectsModule

## 🚀 Redémarrage Complet

### 1. Arrêter les processus en cours

**Backend (Terminal 1) :**
- Appuyez sur `Ctrl+C` dans le terminal où le backend tourne
- Attendez que le processus s'arrête complètement

**Frontend (Terminal 2) :**
- Appuyez sur `Ctrl+C` dans le terminal où Vite tourne
- Attendez que le processus s'arrête complètement

### 2. Vérifier que MongoDB est démarré

```bash
# Windows (si MongoDB est installé localement)
# Vérifiez dans les services Windows ou via :
mongosh mongodb://localhost:27017/invoicia
```

### 3. Redémarrer le Backend

```bash
cd backend
npm run start:dev
```

**Vous devriez voir :**
```
✅ MongoDB connected successfully
🚀 Application is running on: http://localhost:3000/api
```

### 4. Redémarrer le Frontend

**Dans un nouveau terminal :**
```bash
cd c:\Users\smlou\Downloads\invocia
npm run dev
```

**Vous devriez voir :**
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:3002/
```

### 5. Vérifier que tout fonctionne

1. Ouvrez http://localhost:3002 dans votre navigateur
2. Connectez-vous avec vos identifiants
3. Testez la création d'un collaborateur dans le module RH
4. Vérifiez les logs dans les terminaux pour confirmer qu'il n'y a pas d'erreurs

## 🔍 En cas de problème

### Backend ne démarre pas
- Vérifiez que MongoDB est démarré
- Vérifiez le fichier `backend/.env` existe et contient les bonnes valeurs
- Regardez les logs d'erreur dans le terminal

### Frontend ne démarre pas
- Vérifiez que le port 3002 n'est pas déjà utilisé
- Supprimez `node_modules` et `package-lock.json` puis `npm install`

### Erreurs de connexion
- Vérifiez que le backend tourne sur le port 3000
- Vérifiez que le proxy Vite est bien configuré dans `vite.config.ts`

## 📝 Commandes Rapides

**Backend seul :**
```bash
cd backend && npm run start:dev
```

**Frontend seul :**
```bash
npm run dev
```

**Les deux (dans des terminaux séparés) :**
```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
npm run dev
```
