# Kit de Bienvenue Dev — Invocia

Documentation d’onboarding pour les nouveaux développeurs. Ce fichier décrit l’architecture, la philosophie et les accès de test du projet.

---

## 1. Présentation du Projet

**Type :** SaaS ERP/CRM **Multi-tenant** (architecture **monolithe modulaire**).

| Élément | Détail |
|--------|--------|
| **Stack** | **NestJS** (Backend), **React** (Frontend), **MongoDB** (Base de données) |
| **Philosophie** | **« Zéro Mock »** : toute donnée est réelle, en base. Pas de fixtures mockées pour le flux métier. |
| **Architecture** | **« Architecture Lego »** : modules activables par **Feature Flags** par tenant. Le produit s’adapte au pack souscrit. |

---

## 2. Architecture des Modules (Feature Flags)

Le **menu applicatif est dynamique** : il dépend des **Feature Flags** du tenant, stockés dans **`company.moduleFlags`** (objet clé/valeur par module). Seuls les modules activés pour la société sont affichés et utilisables.

### Modules disponibles (`moduleFlags`)

| Clé | Description |
|-----|-------------|
| `module_clients` | Clients (obligatoire si facturation) |
| `module_crm` | CRM |
| `module_invoicing` | Facturation (Factur-X, e-invoicing) |
| `module_suppliers` | Fournisseurs |
| `module_projects` | Projets |
| `module_staffing` | Staffing |
| `module_cra` | Comptes-rendus d’activité |
| `module_accounting` | Comptabilité |
| `module_payments` | Paiements |
| `module_banking` | **Banking** (source de vérité bancaire) |
| `module_hr` | **RH / Paie** |
| `module_cvtech` | CV Tech |
| `module_ged` | **GED** (Gestion Électronique des Documents) |
| `module_signature` | Signature électronique |

**Règle métier :** si `module_invoicing` est activé, `module_clients` est automatiquement forcé à `true`.

---

## 3. Le Système IA (AI Lab)

Nous **n’utilisons pas d’API externe payante** pour tout le parsing. L’approche est la suivante :

- **Concept :** **UniversalDocumentParserService** (backend). On **apprend** des formats (PDF, Word, CSV) via le **Lab** (templates, règles), puis l’**exécution est locale** (pas d’appel OpenAI/autre pour le flux standard).
- **Types de documents gérés :** relevés bancaires (BANK), factures (INVOICE), CV (CV). Les templates de parsing sont stockés et réutilisés.
- **Résultat d’analyse :** `SUCCESS`, `UNKNOWN_FORMAT` ou `LEARNING_NEEDED` selon que le document correspond à un template connu ou doit être appris.

---

## 4. Comptes de Test (Environnement DEV / LOCAL)

Après un `npm run seed` côté backend, vous pouvez vous connecter immédiatement avec les comptes suivants.

### Super Admin (Vue Plateforme)

| Champ | Valeur |
|-------|--------|
| **Login** | `admin@invocia.io` |
| **Mot de passe** | `admin123` |
| **Rôle** | `PLATFORM_ADMIN` |
| **Tenant** | Aucun (vue plateforme) |

### Client Test (Vue Tenant / Utilisateur)

| Champ | Valeur |
|-------|--------|
| **Login** | `client@test.com` |
| **Mot de passe** | `client123` |
| **Rôle** | `COMPANY_ADMIN` |
| **Société** | **Entreprise Test SAS** |

Ce compte est lié à un tenant avec des modules déjà présents (billing, hr, accounting, banking). Idéal pour tester les écrans par module.

---

## 5. Commandes Utiles

### Démarrer le projet

- **Frontend** (à la racine du dépôt) :
  ```bash
  npm run dev
  ```
- **Backend** (API NestJS) :
  ```bash
  cd backend
  npm run start:dev
  ```

### Données initiales (comptes de test)

- **Seed de la base** (création Super Admin + Client Test + tenant « Entreprise Test SAS ») :
  ```bash
  cd backend
  npm run seed
  ```

### Autres scripts backend (depuis `backend/`)

| Script | Description |
|--------|-------------|
| `npm run build` | Compilation NestJS |
| `npm run start` | Démarrage sans watch |
| `npm run create-admin-user` | Création d’un admin (script dédié) |
| `npm run create-test-client` | Création du client de test |

### Reset de la base de données

Il n’y a **pas de script dédié** “reset DB” dans le projet. Pour repartir proprement :

1. **Option recommandée :** supprimer ou vider la base MongoDB utilisée par l’app (nom définı dans la config, ex. `mongosh` → `use invocia` → `db.dropDatabase()`), puis relancer :
   ```bash
  cd backend
  npm run seed
  ```
2. Vous pouvez aussi recréer uniquement les comptes en réexécutant `npm run seed` : le script est idempotent (il ne duplique pas les utilisateurs existants).

---

## Récapitulatif

- **Architecture :** Monolithe modulaire, multi-tenant, menu piloté par **`company.moduleFlags`**.
- **Philosophie :** Zéro mock, données réelles en base ; modules en Lego par Feature Flags.
- **IA :** **UniversalDocumentParserService** + apprentissage de formats dans le Lab, exécution locale.
- **Tests rapides :** Super Admin `admin@invocia.io` / `admin123` ; Client `client@test.com` / `client123` (tenant « Entreprise Test SAS »).

Bienvenue dans l’équipe.
