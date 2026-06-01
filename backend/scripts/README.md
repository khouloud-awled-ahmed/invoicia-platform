# Scripts d'Initialisation de la Base de Données

## Création des Collections MongoDB

Ce script permet de créer toutes les collections nécessaires à l'application dans la base de données MongoDB `DB_INVOCIA`.

### Utilisation

```bash
# Depuis le dossier backend
npm run create-collections
```

### Prérequis

1. **MongoDB doit être démarré et accessible**
   - Localement : `mongodb://localhost:27017`
   - Ou via MongoDB Atlas (cloud)

2. **Configuration de la connexion**
   - Le script utilise la variable d'environnement `DB_URI` du fichier `.env`
   - Si `DB_URI` n'est pas définie, il utilise par défaut : `mongodb://localhost:27017/DB_INVOCIA`
   - Le script s'assure automatiquement que la base de données est `DB_INVOCIA`

### Collections créées

Le script crée les collections suivantes avec leurs index :

- **users** : Utilisateurs de l'application
- **tenants** : Organisations (multi-tenant)
- **clients** : Clients
- **suppliers** : Fournisseurs
- **invoices** : Factures
- **creditnotes** : Avoirs
- **projects** : Projets
- **craentries** : Entrées de CRA (Compte Rendu d'Activité)
- **expenses** : Dépenses
- **employees** : Employés
- **accountingentries** : Écritures comptables

### Fonctionnement

- Le script vérifie si chaque collection existe déjà
- Si une collection existe, elle est conservée (pas de suppression)
- Les index sont créés pour chaque collection selon la configuration des schémas
- Les index existants ne sont pas recréés

### Exemple de sortie

```
🔗 Connexion à MongoDB : mongodb://localhost:27017/DB_INVOCIA
✅ Connexion à MongoDB réussie

📦 Création des collections et index...

✅ Collection 'users' créée
   ✅ Index 'email_1' créé sur 'users'
   ✅ Index 'tenantId_1' créé sur 'users'
✅ Collection 'tenants' créée
   ✅ Index 'siret_1' créé sur 'tenants'
...

✅ Toutes les collections ont été initialisées avec succès !

📋 Collections disponibles dans la base de données :
   - users
   - tenants
   - clients
   ...
```

### Résolution de problèmes

Si le script échoue :

1. **Vérifier que MongoDB est démarré** :
   ```powershell
   Get-Service -Name MongoDB
   ```

2. **Vérifier la connexion** :
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```

3. **Vérifier le fichier .env** :
   ```powershell
   Get-Content .env | Select-String DB_URI
   ```

4. **Tester avec MongoDB Compass** :
   - Ouvrir MongoDB Compass
   - Se connecter avec : `mongodb://localhost:27017`
   - Vérifier que la base `DB_INVOCIA` existe ou peut être créée

