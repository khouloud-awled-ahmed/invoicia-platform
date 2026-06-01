# Invocia

**Plateforme SaaS complète de gestion financière et opérationnelle pour entreprises de services, avec facturation, CRA (Compte-Rendu d'Activité), gestion de projets et documents.**

---

## Vue d'ensemble

Invocia est une application web multi-tenant qui centralise la gestion financière (facturation, achats, comptabilité), la gestion de projets (CRA, planning, staffing), la gestion documentaire (GED avec classification automatique), et l'automatisation des processus métier pour les sociétés de prestation de services.

L'application propose une architecture modulaire moderne avec un frontend React et un backend NestJS, permettant une scalabilité et une maintenabilité optimales.

---

## Stack Technique

### Frontend
- **Framework** : React 18.3+ avec TypeScript
- **Build Tool** : Vite 5+
- **Styling** : Tailwind CSS v4
- **UI Components** : shadcn/ui (Radix UI)
- **Icons** : Lucide React
- **Form Management** : React Hook Form
- **State Management** : React Context API
- **PDF** : react-pdf
- **Charts** : Recharts
- **Server** : Port 3002 (dev), proxy vers backend sur port 3000

### Backend
- **Framework** : NestJS 10.3+ avec TypeScript
- **Database** : MongoDB 8.0+ (Mongoose ODM)
- **Authentication** : JWT (Passport.js)
- **File Storage** : GridFS (via AttachmentsModule)
- **Validation** : class-validator, class-transformer
- **Security** : bcrypt, passport-jwt, passport-local
- **PDF Generation** : pdf-lib
- **Server** : Port 3000 (dev)

---

## Architecture du Backend

### Structure Modulaire Centrée sur BillingModule

L'architecture backend suit une approche **modulaire monolithique** où le module `BillingModule` centralise toute la logique financière en tant que module parent, avec trois sous-domaines principaux :

```
BillingModule (Parent)
├── SalesModule (Ventes/Factures)
│   ├── Clients (Gestion des clients)
│   ├── Credit Notes (Avoirs)
│   ├── Invoices (Factures client)
│   └── Schemas & DTOs
│
├── PurchasesModule (Achats/Dépenses)
│   ├── Suppliers (Fournisseurs)
│   ├── Expenses (Dépenses)
│   └── Schemas
│
├── AutomationModule (Facturation automatique)
│   └── Génération automatique depuis CRA
│
├── AccountingModule (Comptabilité)
│   └── Écritures comptables
│
├── StructuredFormatsModule (Formats structurés)
│   ├── UBL 2.1
│   ├── CII (Cross Industry Invoice)
│   └── Factur-X
│
└── PlatformAgreementModule (Plateformes Agréées)
    └── Intégration PA (Chorus Pro, etc.)
```

### Routes API Harmonisées

Toutes les routes financières sont préfixées par `/billing` :

- **Ventes** : `/api/billing/sales/*`
  - Factures : `GET/POST /api/billing/sales/invoices`
  - Clients : `GET/POST /api/billing/sales/clients`
  - Avoirs : `GET/POST /api/billing/sales/credit-notes`

- **Achats** : `/api/billing/purchases/*`
  - Dépenses : `GET/POST /api/billing/purchases/expenses`
  - Fournisseurs : `GET/POST /api/billing/purchases/suppliers`

- **Automatisation** : `/api/billing/automation/*`
  - Entrées facturables : `GET /api/billing/automation/invoiceable-entries`
  - Génération auto : `POST /api/billing/automation/generate-invoices`

- **Comptabilité** : `/api/billing/accounting/*`
- **Formats structurés** : `/api/billing/structured-formats/*`
- **Plateformes Agréées** : `/api/billing/platform-agreement/*`

### Activation Modulaire

Le module de facturation peut être activé/désactivé par tenant via les paramètres (`Tenant.billingSettings.enabled`), permettant une activation à la demande.

---

## Arborescence des Fichiers

```
invocia/
│
├── backend/                          # Application Backend NestJS
│   ├── src/
│   │   ├── app.module.ts            # Module racine de l'application
│   │   ├── main.ts                  # Point d'entrée backend
│   │   │
│   │   ├── auth/                    # Authentification & autorisation
│   │   │   ├── auth.module.ts       # Module JWT/Passport
│   │   │   ├── auth.service.ts      # Service d'authentification
│   │   │   ├── auth.controller.ts   # Endpoints login/register
│   │   │   ├── guards/              # Guards JWT
│   │   │   ├── strategies/          # Stratégies Passport
│   │   │   └── decorators/          # Décorateurs (@CurrentUser, etc.)
│   │   │
│   │   ├── billing/                 # 🎯 MODULE PARENT : Logique financière centralisée
│   │   │   ├── billing.module.ts    # Module parent (importe tous les sous-modules)
│   │   │   ├── billing.controller.ts
│   │   │   ├── billing.service.ts
│   │   │   │
│   │   │   ├── sales/               # 📊 Ventes/Factures clients
│   │   │   │   ├── sales.module.ts
│   │   │   │   ├── sales.controller.ts  # @Controller('billing/sales')
│   │   │   │   ├── sales.service.ts
│   │   │   │   ├── schemas/         # Invoice, InvoiceItem
│   │   │   │   ├── dto/             # CreateInvoiceDto, UpdateInvoiceDto
│   │   │   │   ├── clients/         # Gestion clients (CRUD)
│   │   │   │   └── credit-notes/    # Avoirs (CRUD)
│   │   │   │
│   │   │   ├── purchases/           # 🛒 Achats/Dépenses
│   │   │   │   ├── purchases.module.ts
│   │   │   │   ├── purchases.controller.ts  # @Controller('billing/purchases')
│   │   │   │   ├── purchases.service.ts
│   │   │   │   ├── schemas/         # Expense
│   │   │   │   └── suppliers/       # Gestion fournisseurs (CRUD)
│   │   │   │
│   │   │   ├── automation/          # ⚙️ Facturation automatique
│   │   │   │   ├── automation.module.ts
│   │   │   │   ├── automation.controller.ts  # @Controller('billing/automation')
│   │   │   │   └── automation.service.ts
│   │   │   │
│   │   │   ├── accounting/          # 📚 Comptabilité
│   │   │   │   ├── accounting.module.ts
│   │   │   │   ├── accounting.controller.ts
│   │   │   │   └── accounting.service.ts
│   │   │   │
│   │   │   ├── structured-formats/  # 📄 Formats structurés (UBL, CII, Factur-X)
│   │   │   │   ├── structured-formats.module.ts
│   │   │   │   ├── structured-formats.service.ts
│   │   │   │   └── generators/      # UBL, CII, Factur-X generators
│   │   │   │
│   │   │   └── platform-agreement/  # 🌐 Intégration Plateformes Agréées
│   │   │       ├── platform-agreement.module.ts
│   │   │       ├── platform-agreement.service.ts
│   │   │       └── platform-agreement.controller.ts
│   │   │
│   │   ├── users/                   # Gestion des utilisateurs
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── tenants/                 # Multi-tenant (organisations)
│   │   │   ├── tenants.module.ts
│   │   │   ├── tenants.service.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── projects/                # Gestion de projets
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.service.ts
│   │   │   └── schemas/             # Project, CRAPeriod
│   │   │
│   │   ├── employees/               # Gestion des employés
│   │   │   ├── employees.module.ts
│   │   │   └── employees.service.ts
│   │   │
│   │   ├── ged/                     # 📂 GED (Gestion Électronique des Documents)
│   │   │   ├── ged.module.ts
│   │   │   ├── ged.service.ts       # Gestion dossiers/documents
│   │   │   ├── ged.controller.ts
│   │   │   ├── ged-initialization.service.ts  # Structure par défaut
│   │   │   ├── schemas/             # GEDFolder, GEDDocument, ClassificationRule
│   │   │   └── dto/
│   │   │
│   │   ├── attachments/             # Stockage fichiers (GridFS)
│   │   │   ├── attachments.module.ts
│   │   │   ├── attachments.service.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── envelopes/               # Enveloppes de signature
│   │   │   ├── envelopes.module.ts
│   │   │   ├── envelopes.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── certificate.service.ts
│   │   │   └── workflow-engine.service.ts
│   │   │
│   │   ├── intervenants/            # Intervenants externes
│   │   │   ├── intervenants.module.ts
│   │   │   └── intervenants.service.ts
│   │   │
│   │   ├── logs/                    # Logs & audit trail
│   │   │   ├── logs.module.ts
│   │   │   ├── logs.service.ts
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   │
│   │   ├── accounting/              # Schémas comptables (partagés)
│   │   │   └── schemas/
│   │   │
│   │   ├── clients/                 # Schémas clients (partagés)
│   │   │   └── schemas/
│   │   │
│   │   ├── credit-notes/            # Schémas avoirs (partagés)
│   │   │   └── schemas/
│   │   │
│   │   └── suppliers/               # Schémas fournisseurs (partagés)
│   │       └── schemas/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── src/                             # Application Frontend React
│   ├── main.tsx                     # Point d'entrée React
│   ├── App.tsx                      # Composant racine
│   │
│   ├── components/                  # Composants React (120+ fichiers)
│   │   ├── MainLayout.tsx           # Layout principal avec sidebar
│   │   ├── Dashboard.tsx            # Tableau de bord
│   │   ├── SalesManagement.tsx      # Gestion ventes/factures
│   │   ├── ExpenseManagement.tsx    # Gestion dépenses
│   │   ├── CRAManagement.tsx        # CRA & feuilles de temps
│   │   ├── GEDManagement.tsx        # GED avec dossiers/classification
│   │   ├── ClientManagement.tsx     # Gestion clients
│   │   ├── PaymentManagement.tsx    # Gestion paiements
│   │   ├── AccountingComplete.tsx   # Module comptabilité
│   │   ├── BankingModule.tsx        # Connexion bancaire
│   │   ├── HRComplete.tsx           # RH & absences
│   │   ├── ProjectManagement.tsx    # Projets
│   │   ├── AutoInvoicing.tsx        # Facturation automatique
│   │   ├── SuperAdminLayout.tsx     # Interface Super-Admin
│   │   ├── SuperAdminDashboard.tsx  # Dashboard admin
│   │   ├── TenantManagement.tsx     # Gestion tenants
│   │   └── ui/                      # Composants UI shadcn/ui
│   │
│   ├── lib/                         # Services & utilitaires
│   │   ├── api-client-backend.ts    # Client API backend (routes /billing/*)
│   │   ├── api-client.ts            # Client API général
│   │   ├── auth.ts                  # Gestion authentification
│   │   ├── tenants.ts               # Gestion tenants
│   │   ├── banking.ts               # Connexions bancaires
│   │   └── ...
│   │
│   ├── contexts/                    # Contextes React
│   │   └── CompanySettingsContext.tsx
│   │
│   ├── pages/                       # Pages publiques
│   │   ├── PublicCRASubmission.tsx
│   │   └── PublicSignaturePage.tsx
│   │
│   └── utils/                       # Utilitaires
│
├── package.json                     # Dépendances frontend
├── vite.config.ts                   # Configuration Vite
└── README.md                        # Ce fichier
```

---

## Fonctionnalités Détaillées

### 🔐 Authentification & Autorisation

**Opérationnel** :
- Authentification JWT avec Passport.js
- 4 rôles RBAC : `super_admin`, `admin`, `manager`, `user`
- Multi-tenant avec isolation des données par `tenantId`
- Guards NestJS pour la protection des routes
- Décorateurs personnalisés (`@CurrentUser`)

**Modules** : `auth/`, `users/`, `tenants/`

---

### 💰 Module Ventes (Sales)

**Opérationnel** :
- ✅ CRUD complet des factures client (`/api/billing/sales/invoices`)
- ✅ Gestion des clients (`/api/billing/sales/clients`)
- ✅ Gestion des avoirs (`/api/billing/sales/credit-notes`)
- ✅ Calcul automatique des totaux (HT, TVA, TTC)
- ✅ Génération de factures depuis CRA
- ✅ Statuts de factures (draft, sent, paid, cancelled)

**Modules** : `billing/sales/`

---

### 🛒 Module Achats (Purchases)

**Opérationnel** :
- ✅ CRUD complet des dépenses (`/api/billing/purchases/expenses`)
- ✅ Gestion des fournisseurs (`/api/billing/purchases/suppliers`)
- ✅ Suivi des dépenses par statut

**Modules** : `billing/purchases/`

---

### ⚙️ Facturation Automatique (Automation)

**Opérationnel** :
- ✅ Récupération des entrées facturables
- ✅ Génération automatique de factures depuis CRA
- 🔄 Génération batch (en développement)

**Modules** : `billing/automation/`

---

### 📚 Comptabilité (Accounting)

**Opérationnel** :
- ✅ Gestion des écritures comptables
- ✅ Filtrage par compte comptable
- 🔄 Intégration avec les factures/dépenses (en développement)

**Modules** : `billing/accounting/`

---

### 📄 Formats Structurés (Structured Formats)

**Opérationnel** :
- ✅ Génération UBL 2.1
- ✅ Génération CII (Cross Industry Invoice)
- ✅ Génération Factur-X
- ✅ Validation des formats
- ✅ Intégration avec les factures

**Modules** : `billing/structured-formats/`

---

### 🌐 Plateformes Agréées (Platform Agreement)

**Opérationnel** :
- ✅ Simulation d'intégration avec PA (Chorus Pro, etc.)
- ✅ Transmission de factures en format structuré
- ✅ Suivi du statut de transmission
- 🔄 Intégration réelle avec APIs PA (à venir)

**Modules** : `billing/platform-agreement/`

---

### 📂 GED (Gestion Électronique des Documents)

**Opérationnel** :
- ✅ Gestion hiérarchique des dossiers et sous-dossiers
- ✅ Upload et stockage de documents (GridFS)
- ✅ Classification automatique par règles configurables
- ✅ Types de documents : Factures, Dépenses, Avoirs, Devis, Documents fournisseurs/clients, Contrats, Documents société
- ✅ Structure par défaut initialisée automatiquement
- ✅ Recherche de documents

**Modules** : `ged/`, `attachments/`

---

### 📋 CRA (Compte-Rendu d'Activité)

**Opérationnel** :
- ✅ Gestion des périodes CRA
- ✅ Saisie des heures par projet
- ✅ Validation des CRA
- ✅ Génération de factures depuis CRA
- ✅ Interface calendrier pour la saisie

**Modules** : `projects/` (CRAPeriod schema)

---

### 👥 Gestion Clients & Fournisseurs

**Opérationnel** :
- ✅ CRUD clients (`/api/billing/sales/clients`)
- ✅ CRUD fournisseurs (`/api/billing/purchases/suppliers`)
- ✅ Contacts clients multiples
- ✅ Informations complètes (SIRET, TVA, etc.)

**Modules** : `billing/sales/clients/`, `billing/purchases/suppliers/`

---

### 📁 Projets

**Opérationnel** :
- ✅ Gestion des projets
- ✅ Association avec clients
- ✅ Suivi des heures (CRA)
- ✅ Statuts de projets

**Modules** : `projects/`

---

### 👤 Employés & Intervenants

**Opérationnel** :
- ✅ Gestion des employés
- ✅ Gestion des intervenants externes
- ✅ Association avec projets

**Modules** : `employees/`, `intervenants/`

---

### ✍️ Signature Électronique

**Opérationnel** :
- ✅ Enveloppes de signature
- ✅ Workflow de signature
- ✅ Envoi par email
- ✅ Suivi du statut

**Modules** : `envelopes/`

---

### 📊 Tableau de Bord & Analytics

**Opérationnel** :
- ✅ Dashboard avec KPIs financiers
- ✅ Graphiques de ventes/dépenses
- ✅ Statistiques par période
- ✅ Vue multi-tenant

**Modules** : Frontend `components/Dashboard.tsx`

---

### 🏢 Multi-Tenant

**Opérationnel** :
- ✅ Isolation complète des données par tenant
- ✅ Sélection de tenant en temps réel
- ✅ Paramètres par tenant (activation modules)
- ✅ Gestion des packs d'abonnement

**Modules** : `tenants/`

---

### 🔐 Super-Admin

**Opérationnel** :
- ✅ Dashboard plateforme (MRR, ARR, churn)
- ✅ Gestion des tenants (sociétés)
- ✅ Gestion des packs d'abonnement
- ✅ Gestion des administrateurs
- ✅ Logs & audit trail
- ✅ Paramètres globaux

**Modules** : Frontend `components/SuperAdmin*`

---

## Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- MongoDB 8.0+ (local ou distant)

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd invocia
   ```

2. **Installer les dépendances**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

3. **Configuration**
   ```bash
   # Créer .env dans backend/
   DB_URI=mongodb://localhost:27017/invoicia
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

4. **Lancer l'application**
   ```bash
   # Terminal 1 : Backend
   cd backend
   npm run start:dev

   # Terminal 2 : Frontend
   npm run dev
   ```

5. **Accéder à l'application**
   - Frontend : http://localhost:3002
   - Backend API : http://localhost:3000

---

## Scripts Disponibles

### Backend
```bash
npm run start:dev    # Développement avec watch
npm run build        # Compilation TypeScript
npm run start:prod   # Production
npm run lint         # Linter ESLint
```

### Frontend
```bash
npm run dev          # Développement (Vite)
npm run build        # Build production
npm run preview      # Prévisualiser le build
```

---

## Notes Techniques

### Architecture Refactorisée

L'architecture backend a été refactorisée pour centraliser toute la logique financière sous le `BillingModule` :
- ✅ Suppression des modules dupliqués (`invoices/`, `expenses/`, `submodules/`)
- ✅ Routes harmonisées sous `/billing/*`
- ✅ Séparation claire : Sales, Purchases, Automation
- ✅ Imports corrigés après migration

### Multi-Tenant

Chaque entité est isolée par `tenantId`, garantissant une séparation stricte des données entre organisations.

### GED

Le module GED utilise GridFS pour le stockage de fichiers volumineux et propose une classification automatique basée sur des règles configurables.

---

## Roadmap

### ✅ Complété
- Architecture modulaire backend
- Module de facturation centralisé
- GED avec dossiers hiérarchiques
- Formats structurés (UBL, CII, Factur-X)
- Multi-tenant complet
- Interface Super-Admin

### 🔄 En développement
- Intégration réelle avec Plateformes Agréées
- Génération batch de factures
- Reporting avancé
- Tests automatisés

### 📋 À venir
- PWA mobile
- API GraphQL
- Webhooks
- Intégrations tierces (comptabilité, banques)

---

## Contribution

Ce projet suit les bonnes pratiques de développement :
- TypeScript strict
- ESLint + Prettier
- Architecture modulaire
- Séparation des responsabilités

---

## License

MIT

---

**Dernière mise à jour** : Après refactoring backend - Architecture centralisée sur BillingModule
