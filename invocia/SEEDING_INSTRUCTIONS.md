# 🌱 Instructions de Seeding de la Base de Données

## 📋 Vue d'ensemble

Ce script crée les utilisateurs initiaux nécessaires pour démarrer l'application :
- **Super Admin** : `admin@invocia.io` / `admin123`
- **Client Test** : `client@test.com` / `client123` (avec tenant "Entreprise Test SAS")

## 🚀 Exécution

### Option 1 : Via npm script (Recommandé)
```bash
cd backend
npm run seed
```

### Option 2 : Directement avec ts-node
```bash
cd backend
npx ts-node -r tsconfig-paths/register src/scripts/seed-database.ts
```

## ✅ Résultat Attendu

Le script :
1. ✅ Vérifie si les utilisateurs existent déjà
2. ✅ Crée le Super Admin si absent
3. ✅ Crée le Tenant "Entreprise Test SAS" si absent
4. ✅ Crée l'utilisateur Client Test si absent
5. ✅ Affiche un récapitulatif avec les identifiants

## 🔐 Identifiants Créés

### Super Admin (Plateforme)
- **Email** : `admin@invocia.io`
- **Password** : `admin123`
- **Role** : `PLATFORM_ADMIN`
- **Tenant** : Aucun (Super Admin)

### Client Test (Tenant)
- **Email** : `client@test.com`
- **Password** : `client123`
- **Role** : `COMPANY_ADMIN`
- **Company** : Entreprise Test SAS
- **SIRET** : 12345678901234
- **Modules** : billing, hr, accounting, banking

## ⚠️ Notes Importantes

1. **Idempotence** : Le script peut être exécuté plusieurs fois sans créer de doublons
2. **Mots de passe** : Les mots de passe sont hashés avec bcrypt (10 rounds)
3. **Base de données** : Assurez-vous que MongoDB est démarré et accessible
4. **Variables d'environnement** : Le script utilise la configuration NestJS (`.env`)

## 🔧 Dépannage

### Erreur : "Cannot find module"
```bash
# Installer les dépendances
cd backend
npm install
```

### Erreur : "MongoDB connection failed"
- Vérifiez que MongoDB est démarré
- Vérifiez les variables `MONGODB_URI` dans `.env`

### Erreur : "JWT_SECRET must be defined"
- Ajoutez `JWT_SECRET=your-secret-key` dans `backend/.env`

## 📝 Logs

Le script affiche :
- ✅ Succès de création
- ℹ️  Information si l'utilisateur existe déjà
- ❌ Erreurs éventuelles

---

**Après le seeding, vous pouvez vous connecter avec les identifiants ci-dessus !** 🎉
