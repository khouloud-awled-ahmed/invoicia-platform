# 📋 Rapport d'Architecture Technique - Invoicia

**Date de génération** : 2025-01-26  
**Version** : 1.0.0  
**Type** : SaaS Multi-tenant pour ESN (Entreprise de Services Numériques)

---

## 1. 🛠️ Stack & Technologies

### Frontend

**Framework & Build**
- **React** : `^18.3.1` (Functional Components, Hooks)
- **TypeScript** : `^5.9.3`
- **Vite** : `^6.4.1` (Build tool, HMR, Proxy)
- **@vitejs/plugin-react-swc** : `^3.10.2` (Compilation rapide)

**UI & Design System**
- **Radix UI** : Suite complète de composants headless (`@radix-ui/*`)
  - Dialog, Dropdown, Select, Tabs, Accordion, Tooltip, etc.
- **Tailwind CSS** : Styling utility-first
- **Lucide React** : `^0.487.0` (Icônes)
- **Sonner** : `^2.0.3` (Toast notifications)
- **Recharts** : Graphiques et visualisations

**State & Data**
- **React Hooks** : `useState`, `useEffect`, `useCallback` (pas de Redux/Zustand)
- **Context API** : `CompanySettingsContext`, `InvoiceTemplateProvider`, `InvoiceSettingsProvider`, `ProjectProvider`
- **LocalStorage** : Stockage token JWT et données utilisateur

**Formulaires & Validation**
- **React Hook Form** : `^7.71.1`
- **Class Validator** : Validation côté backend

**PDF & Documents**
- **react-pdf** : `^10.2.0` (Visualisation PDF)
- **pdf-lib** : `^1.17.1` (Génération PDF côté backend)
- **pdfjs-dist** : Worker via unpkg.com

**Drag & Drop**
- **react-dnd** : `^1.x` (Drag & Drop pour signature électronique)
- **react-dnd-html5-backend** : Backend HTML5

**Autres**
- **date-fns** : Manipulation de dates
- **axios** : `^1.13.2` (non utilisé, remplacé par fetch)
- **cmdk** : `^1.1.1` (Command palette)

### Backend

**Framework**
- **NestJS** : `^10.3.0` (Architecture modulaire)
- **TypeScript** : `^5.3.3`
- **Express** : `@nestjs/platform-express` (HTTP server)

**Base de Données**
- **MongoDB** : Base de données NoSQL
- **Mongoose** : `^8.0.3` (ODM pour MongoDB)
- **@nestjs/mongoose** : `^10.0.2` (Intégration NestJS)

**Authentification & Sécurité**
- **@nestjs/jwt** : `^10.2.0` (JWT tokens)
- **@nestjs/passport** : `^10.0.3` (Stratégies d'auth)
- **passport-jwt** : `^4.0.1` (JWT strategy)
- **passport-local** : `^1.0.0` (Local strategy)
- **bcrypt** : `^5.1.1` (Hash passwords)

**Validation & Transformation**
- **class-validator** : `^0.14.0` (DTO validation)
- **class-transformer** : `^0.5.1` (Transformation d'objets)

**PDF & Documents**
- **pdf-lib** : `^1.17.1` (Génération PDF)

**Configuration**
- **@nestjs/config** : `^3.1.1` (Variables d'environnement)

**Logging**
- **Logger NestJS** : Logger intégré (remplace console.log)

---

## 2. 🗄️ Base de Données & Schémas

### Collections Principales

#### **User** (`users` collection)
**Rôle** : Comptes utilisateurs de la plateforme  
**Champs clés** :
- `email` (unique, lowercase)
- `password` (hashé avec bcrypt)
- `name` (nom complet)
- `role` : `PLATFORM_ADMIN` | `TENANT_ADMIN` | `USER` | `CONSULTANT` | `MANAGER` | `RH`
- `tenantId` (référence Tenant, optionnel pour PLATFORM_ADMIN)
- `isActive` (boolean)
- `isEmailVerified`, `isPhoneVerified`
- `mfaEnabled`, `mfaSecret`
- `resetPasswordTokenHash`, `resetPasswordExpiresAt`
- `metadata` (objet flexible)

**Relations** :
- `tenantId` → `Tenant`
- Lié à `Employee.userId` (synchronisation automatique)

#### **Tenant** (`tenants` collection)
**Rôle** : Organisation cliente (multi-tenant)  
**Champs clés** :
- `name`, `businessName`
- `siret` (unique, 14 chiffres)
- `siren`, `tvaNumber`, `legalForm`, `capital`, `rcs`
- `email`, `phone`
- `address` (objet structuré)
- `defaultBankAccount` (IBAN, BIC, bankName, bankAddress)
- `modules` : Array<string> (modules activés)
- `features` : Array<string> (fonctionnalités)
- `subscriptionStatus` : `ACTIVE` | `PENDING_PAYMENT` | `SUSPENDED` | `TRIAL` | `CANCELLED`
- `planId` (référence SubscriptionPlan)
- `invoiceSettings` (prefix, nextNumber, footerText)
- `billingSettings`, `notificationPreferences`, `securitySettings`
- `metadata` (objet flexible)

**Relations** :
- `planId` → `SubscriptionPlan`
- Parent de tous les documents métier (Invoice, Employee, Project, etc.)

#### **Project** (`projects` collection)
**Rôle** : Projets clients ou internes  
**Champs clés** :
- `name`, `code` (unique)
- `client` (nom du client)
- `type` : `INTERNAL` | `CLIENT_BILLABLE`
- `status` : `en-cours` | `termine` | `en-attente` | `annule`
- `priority` : `haute` | `moyenne` | `basse`
- `startDate`, `endDate`
- `budget`, `consumed`, `progress`
- `manager` (nom)
- `team` : Array<string>
- `tenantId` (référence Tenant)

**Relations** :
- `tenantId` → `Tenant`
- Parent de `ProjectAssignment`

#### **ProjectAssignment** (`projectassignments` collection)
**Rôle** : Affectation consultant → projet (Staffing)  
**Champs clés** :
- `userId` (référence User - Consultant)
- `projectId` (référence Project)
- `projectName` (snapshot)
- `startDate`, `endDate` (optionnel)
- `validatorId` (référence User - Manager)
- `validatorName` (snapshot)
- `dailyRate` (TJM, masqué pour consultant)
- `status` : `ACTIVE` | `ENDED` | `CANCELLED`
- `tenantId`

**Relations** :
- `userId` → `User`
- `projectId` → `Project`
- `validatorId` → `User`
- Utilisé pour générer les `CRAMonthly`

#### **CRAMonthly** (`cramonthlies` collection)
**Rôle** : Compte Rendu d'Activité mensuel  
**Champs clés** :
- `userId` (référence User - Consultant)
- `userName` (snapshot)
- `year`, `month` (1-12)
- `periodStart`, `periodEnd`
- `entries` : Array<{
  - `projectAssignmentId` (référence ProjectAssignment)
  - `projectId`, `projectName`
  - `days`, `hours`
  - `details` : Array<{date, hours, description}>
}>
- `status` : `DRAFT` | `SUBMITTED` | `VALIDATED` | `REJECTED`
- `totalDays`, `totalHours`
- `submittedAt`, `validatedBy`, `validatedAt`, `rejectionReason`
- `tenantId`

**Relations** :
- `userId` → `User`
- `entries[].projectAssignmentId` → `ProjectAssignment`
- Généré dynamiquement depuis les `ProjectAssignment` actifs

#### **Employee** (`employees` collection)
**Rôle** : Collaborateurs internes  
**Champs clés** :
- `firstName`, `lastName`
- `email` (unique, lowercase)
- `phone`, `position`, `department`
- `hireDate`, `birthDate`
- `salary` (masqué selon rôle)
- `status` : `active` | `inactive` | `on-leave`
- `userId` (référence User - créé automatiquement)
- `tenantId`

**Relations** :
- `userId` → `User` (création automatique via `UserSyncService`)
- `tenantId` → `Tenant`

#### **Intervenant** (`intervenants` collection)
**Rôle** : Intervenants externes  
**Champs clés** :
- `firstName`, `lastName`, `email`
- `type` : `interne` | `externe`
- `canSubmitCRA` (boolean)
- `craAccessToken` (pour accès public)
- `status` : `active` | `inactive`
- `metadata.userId` (référence User si externe avec CRA)
- `tenantId`

**Relations** :
- `metadata.userId` → `User` (création conditionnelle)
- `tenantId` → `Tenant`

#### **Invoice** (`invoices` collection)
**Rôle** : Factures clients  
**Champs clés** :
- `number` (unique, format: FA-YYYY-MM-XXX)
- `date`, `dueDate`
- `clientId` (référence Client)
- `client`, `clientAddress`, `clientEmail`
- `items` : Array<InvoiceItem> (article, description, quantity, unitPrice, discount, vatRate)
- `amountHT`, `amountTVA`, `amountTTC`
- `status` : `draft` | `pending` | `paid` | `overdue` | `cancelled`
- `orderNumber`, `engagementId`
- `deposit`, `paymentTerms`, `notes`
- `pdfUrl`, `pdfPath`
- `tenantId`

**Relations** :
- `clientId` → `Client`
- `tenantId` → `Tenant`

#### **PlatformInvoice** (`platforminvoices` collection)
**Rôle** : Factures d'abonnement (plateforme → tenant)  
**Champs clés** :
- `invoiceNumber` (format: INV-2024-001)
- `tenantId` (référence Tenant)
- `planId` (référence SubscriptionPlan)
- `planName` (snapshot)
- `amount`, `currency`
- `status` : `DRAFT` | `ISSUED` | `PAID` | `CANCELLED`
- `paymentMethod` : `CARD` | `TRANSFER` | `PAYPAL`
- `pdfUrl`, `pdfPath`
- `issuedAt`, `paidAt`, `dueDate`
- `tenantSnapshot`, `planSnapshot` (données au moment de la facturation)
- `promoCode`, `discountAmount`, `subtotal`, `taxAmount`, `totalAmount`
- `emailSent` (boolean)

**Relations** :
- `tenantId` → `Tenant`
- `planId` → `SubscriptionPlan`

#### **Envelope** (`envelopes` collection)
**Rôle** : Enveloppes de signature électronique  
**Champs clés** :
- `title`, `message`
- `status` : `DRAFT` | `SENT` | `IN_PROGRESS` | `COMPLETED` | `VOIDED` | `EXPIRED`
- `documents` : Array<{id, fileName, fileUrl, order}>
- `recipients` : Array<{
  - `id`, `name`, `email`
  - `role` : `SIGNER` | `VIEWER`
  - `routingOrder` (ordre de signature)
  - `status` : `WAITING` | `SENT` | `SIGNED` | `REFUSED`
  - `signedAt`, `refusedAt`, `refusalReason`
}>
- `fields` : Array<{
  - `type` : `SIGNATURE` | `INITIALS` | `DATE` | `TEXT` | `CHECKBOX`
  - `pageNumber`, `xPosition`, `yPosition`, `width`, `height`
  - `assignedRecipientId` (référence recipient)
  - `linkedDocumentId` (référence document)
  - `label`, `required`
}>
- `expiresAt`
- `auditTrail` : Array<AuditEvent>
- `tenantId`

**Relations** :
- `tenantId` → `Tenant`
- `fields[].assignedRecipientId` → `recipients[].id`

#### **SubscriptionPlan** (`subscriptionplans` collection)
**Rôle** : Plans d'abonnement  
**Champs clés** :
- `name`, `description`
- `price`, `currency`
- `features` : Array<string>
- `maxUsers` (nombre max d'utilisateurs)
- `isActive` (boolean)
- `billingPeriod` : `MONTHLY` | `YEARLY`
- `trialDays` (période d'essai)

#### **PlatformSettings** (`platformsettings` collection)
**Rôle** : Configuration globale de la plateforme  
**Champs clés** :
- `id` : `'platform'` (singleton)
- `invoiceLogoUrl`, `invoiceCompanyName`, `invoiceCompanyAddress`, `invoiceCompanyVat`
- `invoiceFooterText`, `invoiceColor`, `invoicePrefix`
- `nextInvoiceNumber` (compteur séquentiel)
- `paymentMethods` (IBAN, Stripe config)

#### **Client** (`clients` collection)
**Rôle** : Clients finaux  
**Champs clés** :
- `name`, `email`, `phone`
- `address` (objet structuré)
- `siret`, `tvaNumber`
- `contacts` : Array<ClientContact>
- `tenantId`

#### **Expense** (`expenses` collection)
**Rôle** : Dépenses/Achats  
**Champs clés** :
- `number`, `date`
- `supplierId` (référence Supplier)
- `category`, `amountHT`, `amountTVA`, `amountTTC`
- `status` : `pending` | `verified` | `exported` | `rejected`
- `attachments` : Array<string>
- `tenantId`

#### **Supplier** (`suppliers` collection)
**Rôle** : Fournisseurs  
**Champs clés** :
- `name`, `email`, `phone`
- `siret`, `tvaNumber`
- `address` (objet structuré)
- `status` : `active` | `inactive`
- `tenantId`

#### **CreditNote** (`creditnotes` collection)
**Rôle** : Avoirs clients  
**Champs clés** :
- `number` (format: AV-YYYY-MM-XXX)
- `date`, `relatedInvoiceId`, `relatedInvoiceNumber`
- `clientId`, `client`
- `items`, `amountHT`, `amountTVA`, `amountTTC`
- `reason`, `status`
- `tenantId`

#### **GEDDocument** (`geddocuments` collection)
**Rôle** : Documents GED  
**Champs clés** :
- `fileName`, `fileUrl`, `fileType`, `fileSize`
- `folderId` (référence GEDFolder)
- `classificationRuleId` (référence GEDClassificationRule)
- `metadata` (tags, description)
- `tenantId`

#### **GEDFolder** (`gedfolders` collection)
**Rôle** : Dossiers GED  
**Champs clés** :
- `name`, `path`
- `parentId` (référence GEDFolder, optionnel)
- `tenantId`

#### **LogEntry** (`logentries` collection)
**Rôle** : Logs d'audit  
**Champs clés** :
- `action`, `module`, `userId`, `userEmail`
- `resourceType`, `resourceId`
- `details` (objet)
- `ipAddress`, `userAgent`
- `timestamp`
- `tenantId`

#### **Attachment** (`attachments` collection)
**Rôle** : Pièces jointes  
**Champs clés** :
- `fileName`, `fileUrl`, `fileType`, `fileSize`
- `linkedResourceType`, `linkedResourceId`
- `uploadedBy` (userId)
- `tenantId`

#### **AccountingEntry** (`accountingentries` collection)
**Rôle** : Écritures comptables  
**Champs clés** :
- `date`, `account`, `label`
- `debit`, `credit`
- `linkedResourceType`, `linkedResourceId`
- `tenantId`

---

## 3. 🗺️ Cartographie des Modules (Frontend ↔ Backend)

### Module : Authentification & Utilisateurs

**Route Frontend** : `/login`, `/register`, `/forgot-password`, `/reset-password`  
**Composant Principal** : `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`  
**Endpoints Backend** :
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/profile`

**Actions Principales** :
- Connexion avec JWT
- Inscription avec création automatique de Tenant
- Réinitialisation de mot de passe (token par email)
- Vérification email (OTP)

---

### Module : Facturation (Sales)

**Route Frontend** : `/sales`  
**Composant Principal** : `SalesManagement.tsx`  
**Endpoints Backend** :
- `GET /api/billing/sales/invoices`
- `POST /api/billing/sales/invoices`
- `PATCH /api/billing/sales/invoices/:id`
- `DELETE /api/billing/sales/invoices/:id`
- `GET /api/billing/sales/invoices/:id/download`
- `POST /api/billing/sales/invoices/:id/send-email`
- `GET /api/billing/sales/clients`
- `GET /api/billing/sales/credit-notes`
- `POST /api/billing/sales/credit-notes`

**Actions Principales** :
- Créer/Modifier/Supprimer factures
- Générer PDF
- Envoyer par email
- Gérer avoirs (credit notes)
- Import AI (OCR factures)

**Dialogs** :
- `InvoiceFormDialog.tsx` (création/édition)
- `InvoiceViewDialog.tsx` (visualisation)
- `InvoiceEditDialog.tsx` (édition)
- `InvoiceDeleteDialog.tsx`, `InvoiceCancelDialog.tsx`
- `CreditNoteFormDialog.tsx`, `CreditNoteViewDialog.tsx`
- `InvoiceImportDialog.tsx` (import AI)
- `GenerateInvoiceFromCRADialog.tsx` (génération depuis CRA)

---

### Module : Achats & Dépenses

**Route Frontend** : `/expenses`  
**Composant Principal** : `ExpenseManagement.tsx`  
**Endpoints Backend** :
- `GET /api/billing/purchases/expenses`
- `POST /api/billing/purchases/expenses`
- `PATCH /api/billing/purchases/expenses/:id`
- `DELETE /api/billing/purchases/expenses/:id`
- `GET /api/billing/purchases/suppliers`
- `POST /api/billing/purchases/suppliers`

**Actions Principales** :
- Gérer dépenses
- Valider/Rejeter dépenses
- Importer depuis OCR
- Gérer fournisseurs

**Dialogs** :
- `ExpenseImportDialog.tsx` (import OCR)
- `ExpenseDetailsDialog.tsx`

---

### Module : CRA (Compte Rendu d'Activité)

**Routes Frontend** :
- `/my-cra` (Consultant)
- `/team/validation` (Manager)
- `/admin/staffing` (Admin)
- `/cra` (Vue globale)

**Composants Principaux** :
- `MyCRAPage.tsx` (Consultant - saisie temps)
- `TeamValidationPage.tsx` (Manager - validation)
- `AdminStaffingPage.tsx` (Admin - affectations)
- `CRAManagement.tsx` (Vue globale)

**Endpoints Backend** :
- `GET /api/cra/monthly/current` (CRA du mois en cours)
- `GET /api/cra/monthly/my-cras` (historique consultant)
- `PATCH /api/cra/monthly/:id/entry` (mettre à jour entrée)
- `POST /api/cra/monthly/:id/submit` (soumettre)
- `GET /api/cra/monthly/pending-validation` (liste pour manager)
- `POST /api/cra/monthly/:id/validate` (valider)
- `POST /api/cra/monthly/:id/reject` (rejeter avec raison)
- `GET /api/projects/assignments/my-assignments` (affectations consultant)
- `GET /api/projects/assignments/project/:projectId` (affectations projet)
- `POST /api/projects/assignments` (créer affectation)
- `PATCH /api/projects/assignments/:id` (modifier)
- `DELETE /api/projects/assignments/:id` (terminer)

**Actions Principales** :
- Consultant : Saisir heures/jours par projet
- Manager : Valider/Rejeter CRA soumis
- Admin : Affecter consultants aux projets (Staffing)

**Workflow** :
1. Admin crée `ProjectAssignment` (consultant → projet)
2. Consultant saisit temps dans `CRAMonthly` (DRAFT)
3. Consultant soumet (SUBMITTED)
4. Manager valide (VALIDATED) ou rejette (REJECTED)

---

### Module : RH & Absences

**Route Frontend** : `/hr`  
**Composant Principal** : `HRComplete.tsx`  
**Endpoints Backend** :
- `GET /api/employees`
- `POST /api/employees`
- `PATCH /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/intervenants`
- `POST /api/intervenants`

**Actions Principales** :
- Gérer collaborateurs (Employés)
- Gérer intervenants externes
- Création automatique de compte User (via `UserSyncService`)
- Gestion formations, performances, recrutements (UI mockée)

**Synchronisation Automatique** :
- Création `Employee` → Création automatique `User` avec rôle `CONSULTANT`
- Email avec mot de passe temporaire (TODO: implémenter)
- Mise à jour `Employee` → Mise à jour `User`
- Désactivation `Employee` → Désactivation `User`

---

### Module : Projets

**Route Frontend** : `/projects`  
**Composant Principal** : `ProjectManagement.tsx`  
**Endpoints Backend** :
- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

**Actions Principales** :
- Créer/Modifier projets
- Gérer budget, équipe, tâches
- Types : `INTERNAL` (projet interne) | `CLIENT_BILLABLE` (facturable)

---

### Module : Signature Électronique

**Route Frontend** : `/signature`  
**Composant Principal** : `ElectronicSignature.tsx`  
**Endpoints Backend** :
- `GET /api/envelopes`
- `POST /api/envelopes`
- `GET /api/envelopes/:id`
- `PATCH /api/envelopes/:id`
- `POST /api/envelopes/:id/send`
- `POST /api/envelopes/:id/sign`
- `POST /api/envelopes/:id/refuse`
- `DELETE /api/envelopes/:id`
- `POST /api/envelopes/:id/fields` (ajouter champs)
- `GET /api/envelopes/:id/download`
- `GET /api/envelopes/:id/download-certificate`

**Actions Principales** :
- Créer enveloppe avec documents PDF
- Définir signataires et ordre
- Placer champs de signature (drag & drop)
- Envoyer pour signature
- Signer/Refuser (expérience signataire)
- Télécharger document signé + certificat

**Dialogs** :
- `EnvelopeCreationDialog.tsx` (création)
- `DocumentPreparationDialog.tsx` (préparation - placement champs)
- `SigningExperienceDialog.tsx` (expérience signataire)
- `EnvelopeDetailDialog.tsx` (détails)

**Page Publique** :
- `PublicSignaturePage.tsx` (route `/sign/:token`)

---

### Module : GED (Gestion Électronique de Documents)

**Route Frontend** : `/ged`  
**Composant Principal** : `GEDManagement.tsx`  
**Endpoints Backend** :
- `GET /api/ged/folders`
- `POST /api/ged/folders`
- `GET /api/ged/documents`
- `POST /api/ged/documents` (upload)
- `GET /api/ged/documents/:id/download`
- `POST /api/ged/classify` (classification automatique)

**Actions Principales** :
- Gérer dossiers (arborescence)
- Upload documents
- Classification automatique (règles)
- Recherche, tags, métadonnées

---

### Module : Comptabilité

**Route Frontend** : `/accounting`  
**Composant Principal** : `AccountingComplete.tsx`  
**Endpoints Backend** :
- `GET /api/billing/accounting/entries`
- `POST /api/billing/accounting/entries`
- `GET /api/billing/accounting/balance`
- `POST /api/billing/accounting/export-fec`

**Actions Principales** :
- Gérer écritures comptables
- Export FEC (Fichier des Écritures Comptables)
- Lettrage automatique
- Synchronisation bancaire (TODO)

---

### Module : Paiements & Abonnements

**Route Frontend** : `/settings/payments`  
**Composant Principal** : `PaymentSettingsPage.tsx`  
**Endpoints Backend** :
- `GET /api/billing/subscription/current`
- `POST /api/billing/subscription/subscribe`
- `GET /api/platform/invoices/my-invoices`
- `GET /api/platform/invoices/:id/download`
- `GET /api/platform/plans`

**Actions Principales** :
- Gérer méthode de paiement (Carte, Virement)
- S'abonner à un plan
- Consulter historique factures
- Télécharger factures PDF

**Workflow Abonnement** :
1. Client choisit plan → `POST /api/billing/subscription/subscribe`
2. Si `CARD` : Facture générée immédiatement + PDF
3. Si `TRANSFER` : Facture DRAFT, activation manuelle par Super Admin
4. Super Admin : `POST /api/platform/tenants/:id/approve-transfer` → Génère facture finale

---

### Module : Platform Admin (Super Admin)

**Routes Frontend** : `/platform/admin`, `/platform/tenants`, `/platform/plans`, `/platform/settings`  
**Composants Principaux** :
- `PlatformDashboardPage.tsx`
- `PlatformTenantsPage.tsx`
- `PlatformPlansPage.tsx`
- `PlatformSettingsPage.tsx`

**Endpoints Backend** :
- `GET /api/platform/tenants`
- `GET /api/platform/tenants/:id`
- `POST /api/platform/tenants`
- `PATCH /api/platform/tenants/:id/modules`
- `PATCH /api/platform/tenants/:id/status`
- `POST /api/platform/tenants/:id/approve-transfer`
- `GET /api/platform/plans`
- `POST /api/platform/plans`
- `PATCH /api/platform/plans/:id`
- `DELETE /api/platform/plans/:id`
- `GET /api/platform/settings`
- `PATCH /api/platform/settings`

**Actions Principales** :
- Gérer tenants (créer, activer, suspendre)
- Gérer plans d'abonnement
- Configurer paramètres plateforme (logo facture, IBAN, etc.)
- Approuver virements bancaires

---

### Module : Clients

**Route Frontend** : `/clients`  
**Composant Principal** : `ClientManagement.tsx`  
**Endpoints Backend** :
- `GET /api/billing/sales/clients`
- `POST /api/billing/sales/clients`
- `PATCH /api/billing/sales/clients/:id`
- `DELETE /api/billing/sales/clients/:id`

**Actions Principales** :
- CRUD clients
- Gérer contacts clients

---

### Module : Fournisseurs

**Route Frontend** : `/suppliers`  
**Composant Principal** : `UnifiedSupplierManagement.tsx`  
**Endpoints Backend** :
- `GET /api/billing/purchases/suppliers`
- `POST /api/billing/purchases/suppliers`
- `PATCH /api/billing/purchases/suppliers/:id`
- `DELETE /api/billing/purchases/suppliers/:id`

**Actions Principales** :
- CRUD fournisseurs
- Gérer attestations fournisseurs

---

### Module : Intervenants

**Route Frontend** : `/intervenants`  
**Composant Principal** : `IntervenantsManagement.tsx`  
**Endpoints Backend** :
- `GET /api/intervenants`
- `POST /api/intervenants`
- `PATCH /api/intervenants/:id`
- `DELETE /api/intervenants/:id`

**Actions Principales** :
- Gérer intervenants externes
- Générer token CRA (accès public)
- Création conditionnelle de compte User (si `externe` + `canSubmitCRA`)

---

### Module : Utilisateurs & Rôles

**Route Frontend** : `/users`  
**Composant Principal** : `UserRoleManagement.tsx`  
**Endpoints Backend** :
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

**Actions Principales** :
- Gérer utilisateurs
- Assigner rôles
- Activer/Désactiver comptes

**Note** : Les utilisateurs liés à `Employee` ne doivent pas être modifiés manuellement (gérés via HR).

---

### Module : Paramètres

**Route Frontend** : `/settings`  
**Composant Principal** : `Settings.tsx`  
**Sous-composants** :
- `CompanySettingsEnhanced.tsx` (infos entreprise)
- `BankAccountManagement.tsx` (comptes bancaires)
- `InvoiceTemplateSettings.tsx` (modèle facture)
- `NotificationSettings.tsx` (préférences notifications)
- `MFASetup.tsx` (2FA)
- `SSOConfiguration.tsx` (SSO)

**Endpoints Backend** :
- `GET /api/tenants/:id`
- `PATCH /api/tenants/:id` (updateCompanyInfo, updateBankAccount, etc.)

---

### Module : Banque

**Route Frontend** : `/banking`  
**Composant Principal** : `BankingModule.tsx`  
**Endpoints Backend** :
- `GET /api/billing/banking/accounts`
- `POST /api/billing/banking/accounts`
- `POST /api/billing/banking/sync` (synchronisation)

**Actions Principales** :
- Connecter comptes bancaires (Bridge API)
- Synchroniser transactions
- Lettrage automatique

---

### Module : Monitoring & Logs

**Route Frontend** : `/monitoring`  
**Composant Principal** : `TechnicalMonitoring.tsx`  
**Endpoints Backend** :
- `GET /api/logs`
- `GET /api/logs/:id`

**Actions Principales** :
- Consulter logs d'audit
- Monitoring services
- Alertes système

---

### Module : Notifications

**Route Frontend** : `/notifications`  
**Composant Principal** : `NotificationsPage.tsx`  
**Actions Principales** :
- Centre de notifications
- Alertes métier (factures en retard, CRA à valider, etc.)

---

## 4. 🗑️ Analyse du Code Mort & Fichiers Suspects

### Fichiers Mock (À Nettoyer)

**Frontend** :
- `src/components/HRComplete.tsx` : Contient `MOCK_EMPLOYEES`, `MOCK_TRAININGS`, `MOCK_PERFORMANCES`, `MOCK_RECRUITMENTS`
  - **Statut** : Utilisés comme fallback en cas d'erreur API
  - **Action recommandée** : Supprimer et gérer les erreurs avec messages clairs

- `src/components/SalesManagement.tsx` : Contient `MOCK_CREDIT_NOTES`
  - **Statut** : Données de démo
  - **Action recommandée** : Supprimer, charger depuis API

- `src/components/NotificationPanel.tsx` : Données de démo hardcodées
  - **Statut** : Notifications mockées
  - **Action recommandée** : Implémenter endpoint backend `/api/notifications`

- `src/lib/monitoring.ts` : Contient `MOCK_SERVICES`, `MOCK_ACTIVITY_LOGS`
  - **Statut** : Données de démo
  - **Action recommandée** : Remplacer par appels API réels

### TODOs Identifiés

**Backend** :
1. **Email Service** : `TODO: Envoyer un email avec le mot de passe temporaire`
   - Fichiers : `user-sync.service.ts`, `invoice-email.service.ts`, `email.service.ts`
   - **Impact** : Les nouveaux utilisateurs ne reçoivent pas d'email de bienvenue

2. **SMS Service** : `TODO: Intégrer Twilio ou service SMS`
   - Fichier : `verification.service.ts`
   - **Impact** : Pas de vérification SMS

3. **Calcul TVA** : `TODO: Calculer la TVA si nécessaire`
   - Fichier : `platform-invoices.service.ts`
   - **Impact** : TVA à 0% pour les factures plateforme

4. **Automation** : `TODO: Implémenter la génération automatique de factures`
   - Fichier : `automation.service.ts`
   - **Impact** : Facturation automatique non fonctionnelle

5. **Platform Agreement** : `TODO: Implémenter l'appel HTTP réel`
   - Fichier : `platform-agreement.service.ts`
   - **Impact** : Intégration Plateforme Agréée non fonctionnelle

6. **GED** : `TODO: Implémenter getFolder si nécessaire`
   - Fichier : `ged.controller.ts`
   - **Impact** : Endpoint manquant

**Frontend** :
1. **API Methods** : Plusieurs `TODO: Implémenter ... dans api-client-backend.ts`
   - `UnifiedSupplierManagement.tsx` : `getSuppliers`, `getContractors`
   - `AITemplateGenerator.tsx` : `generateTemplateFromText`, `generateTemplateFromImage`
   - `ExpenseImportDialog.tsx` : `processExpenseOCR`
   - `InvoiceImportDialog.tsx` : `importInvoices`, `processInvoiceAI`

2. **Credit Notes** : `TODO: Implémenter updateCreditNote si nécessaire`
   - Fichier : `CreditNoteFormDialog.tsx`

3. **Revenue Calculation** : `TODO: Calculer depuis les abonnements actifs`
   - Fichier : `PlatformDashboardPage.tsx`

### Fichiers Potentiellement Non Utilisés

**À Vérifier** :
- `src/lib/bank-accounts.ts` : Données mockées de banques françaises
- `src/lib/french-banks.ts` : Liste de banques
- `src/lib/webhooks.ts` : Configuration webhooks (mockée)
- `src/lib/netEntreprisesAPI.ts` : Client API Net-Entreprises (non utilisé ?)
- `src/lib/payrollCalculations.ts` : Calculs paie (non utilisé ?)
- `src/lib/platform-data.ts` : Données plateforme (mockées ?)
- `src/lib/tenants.ts` : Client tenants (vérifier si utilisé)
- `src/lib/banking.ts` : Client banking (vérifier si utilisé)
- `src/lib/credit-notes.ts` : Client credit notes (vérifier si utilisé)

**Composants Suspects** :
- `SuperAdminDashboard.tsx` : Dashboard Super Admin (vérifier si utilisé)
- `GlobalSettings.tsx` : Paramètres globaux (vérifier si utilisé)
- `PlatformAdmins.tsx` : Gestion admins plateforme (vérifier si utilisé)

### Doublons Potentiels

**Services d'Email** :
- `backend/src/envelopes/email.service.ts`
- `backend/src/platform/invoice-generator/invoice-email.service.ts`
- **Action** : Centraliser dans un service unique

**Clients API** :
- `src/lib/api-client-backend.ts` (principal)
- Vérifier si `src/lib/tenants.ts`, `src/lib/banking.ts`, etc. sont utilisés ou redondants

---

## 5. 📂 Structure des Dossiers

### Frontend (`src/`)

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (Radix UI wrappers)
│   ├── onboarding/    # Étapes d'onboarding
│   └── [36 fichiers]   # Composants métier (SalesManagement, HRComplete, etc.)
├── pages/              # Pages principales (routes)
│   └── platform/       # Pages Super Admin
├── lib/                # Utilitaires et clients API
│   ├── api-client-backend.ts  # Client API centralisé (fetch)
│   ├── auth.ts         # Helpers authentification
│   ├── pdf-worker-config.ts  # Configuration PDF worker
│   └── [autres]        # Clients spécialisés (banking, webhooks, etc.)
├── contexts/           # React Contexts
│   └── CompanySettingsContext.tsx
├── utils/              # Utilitaires
│   ├── invoiceTemplateContext.tsx
│   └── invoiceSettingsContext.tsx
├── styles/             # Styles globaux
├── App.tsx             # Router principal (window.location basé)
└── main.tsx            # Point d'entrée React
```

**Logique** :
- **Components** : Composants métier (1 composant = 1 module)
- **Pages** : Pages de routing (Login, Register, etc.)
- **Lib** : Logique métier, clients API, helpers
- **Contexts/Utils** : State management global (Context API)

### Backend (`backend/src/`)

```
backend/src/
├── auth/               # Authentification & Autorisation
│   ├── guards/        # JwtAuthGuard, PlatformAdminGuard, TenantAdminGuard
│   ├── decorators/    # @CurrentUser
│   ├── strategies/    # JWT strategy
│   ├── verification/  # Email/SMS verification
│   └── dto/           # LoginDto, RegisterDto, etc.
├── users/              # Gestion utilisateurs
│   ├── user-sync.service.ts  # Synchronisation Employee → User
│   └── schemas/
├── tenants/            # Gestion tenants
│   └── schemas/
├── platform/           # Administration plateforme
│   ├── platform-invoices/    # Factures abonnement
│   ├── invoice-generator/     # Génération PDF
│   └── schemas/        # PlatformSettings, SubscriptionPlan, PlatformInvoice
├── billing/            # Facturation
│   ├── sales/          # Factures clients
│   │   ├── clients/    # Clients
│   │   └── credit-notes/  # Avoirs
│   ├── purchases/      # Achats
│   │   └── suppliers/  # Fournisseurs
│   ├── subscription/  # Abonnements
│   ├── accounting/     # Comptabilité
│   ├── automation/     # Facturation automatique (TODO)
│   ├── structured-formats/  # Factur-X, CII, UBL
│   └── platform-agreement/  # Plateforme Agréée (TODO)
├── projects/           # Projets & CRA
│   ├── project-assignments.service.ts  # Staffing
│   ├── cra-monthly.service.ts          # CRA mensuel
│   └── schemas/        # Project, ProjectAssignment, CRAMonthly
├── employees/          # RH - Employés
│   └── schemas/
├── intervenants/       # RH - Intervenants externes
│   └── schemas/
├── envelopes/          # Signature électronique
│   ├── certificate.service.ts  # Certificats
│   ├── email.service.ts        # Emails signature
│   └── workflow-engine.service.ts  # Workflow
├── ged/                # Gestion Électronique de Documents
│   └── schemas/
├── attachments/        # Pièces jointes
├── logs/               # Logs d'audit
└── app.module.ts       # Module racine (imports tous les modules)
```

**Logique** :
- **Architecture modulaire NestJS** : 1 module = 1 domaine métier
- **Structure par feature** : `[feature]/[feature].controller.ts`, `[feature].service.ts`, `schemas/`
- **Séparation des responsabilités** : Controllers (routes), Services (logique), Schemas (modèles)

### Patterns Identifiés

**Backend** :
- **Guards** : Protection des routes par rôle
- **Decorators** : `@CurrentUser` pour injecter l'utilisateur
- **DTOs** : Validation des données entrantes
- **Services** : Logique métier isolée
- **Schemas Mongoose** : Modèles de données avec timestamps automatiques

**Frontend** :
- **Routing basé sur window.location** : Pas de React Router, navigation via `window.location.href`
- **Context API** : State global (CompanySettings, InvoiceTemplate, etc.)
- **API Client centralisé** : `api-client-backend.ts` avec fetch
- **Composants modulaires** : 1 composant = 1 page/module

---

## 6. 🔐 Système d'Authentification & Rôles

### Rôles Définis

1. **PLATFORM_ADMIN** : Super administrateur plateforme
   - Accès : `/platform/*` uniquement
   - Pas de `tenantId`

2. **TENANT_ADMIN** : Administrateur tenant
   - Accès : Tous les modules (sauf `/platform/*`)
   - Gestion complète du tenant

3. **MANAGER** : Manager d'équipe
   - Accès : Tous les modules (sauf `/platform/*`)
   - Validation CRA équipe

4. **RH** : Ressources Humaines
   - Accès : Tous les modules (sauf `/platform/*`)
   - Gestion employés/intervenants

5. **CONSULTANT** : Consultant (accès limité)
   - Accès : `/my-cra`, `/my-leaves`, `/my-profile` uniquement
   - Saisie temps, consultation congés

6. **USER** : Utilisateur standard
   - Accès : Selon modules activés

### Guards & Protection

**Backend** :
- `JwtAuthGuard` : Vérifie token JWT
- `PlatformAdminGuard` : Vérifie rôle `PLATFORM_ADMIN`
- `TenantAdminGuard` : Vérifie rôle `TENANT_ADMIN`
- `@CurrentUser` : Injecte l'utilisateur depuis le token

**Frontend** :
- `ProtectedRoute` : Composant wrapper pour routes protégées
- Redirections basées sur rôle dans `App.tsx`
- Filtrage menu dans `MainLayout.tsx`

---

## 7. 🔄 Flux de Données Principaux

### Création Employé → User Automatique

1. Admin crée `Employee` via `/hr`
2. `EmployeesService.create()` appelle `UserSyncService.createUserFromEmployee()`
3. `UserSyncService` :
   - Vérifie email unique
   - Génère mot de passe temporaire (hash bcrypt)
   - Crée `User` avec rôle `CONSULTANT`
   - Log mot de passe (TODO: email)
4. `Employee.userId` lié au `User` créé
5. Si échec User → Rollback Employee

### Workflow CRA

1. **Staffing** : Admin crée `ProjectAssignment` (consultant → projet)
2. **Saisie** : Consultant accède `/my-cra`
3. **Génération** : `CRAMonthlyService.getOrCreateMonthlyCRA()` crée CRA depuis `ProjectAssignment` actifs
4. **Soumission** : Consultant soumet → Status `SUBMITTED`
5. **Validation** : Manager accède `/team/validation` → Valide/Rejette
6. **Génération Facture** : Admin peut générer facture depuis CRA validé

### Workflow Signature Électronique

1. **Création** : Admin crée `Envelope` avec documents PDF
2. **Préparation** : Admin place champs (signature, date, texte) via drag & drop
3. **Envoi** : Admin envoie → Status `SENT`
4. **Signature** : Signataires reçoivent email → Accès `/sign/:token`
5. **Workflow** : Signataire 1 signe → Signataire 2 peut signer (ordre)
6. **Finalisation** : Tous signés → Status `COMPLETED`, PDF signé généré

### Workflow Abonnement

1. **Onboarding** : Client choisit plan → `POST /api/billing/subscription/subscribe`
2. **Paiement Carte** : Facture générée immédiatement + PDF + Email
3. **Paiement Virement** : Facture DRAFT, activation manuelle
4. **Super Admin** : `POST /api/platform/tenants/:id/approve-transfer` → Génère facture finale

---

## 8. ⚠️ Points d'Attention

### Sécurité

- **Mots de passe** : Hashés avec bcrypt (10 rounds)
- **JWT** : Tokens dans localStorage (considérer httpOnly cookies)
- **Validation** : DTOs avec class-validator
- **CORS** : Configuré pour accepter toutes origines (à restreindre en production)

### Performance

- **PDF Worker** : Configuré via unpkg (CDN externe)
- **Images** : Pas d'optimisation identifiée
- **Lazy Loading** : Import dynamique pour `PublicSignaturePage`

### Dépendances Externes

- **MongoDB** : Requis au démarrage
- **Email Service** : Non implémenté (TODOs)
- **SMS Service** : Non implémenté (TODOs)
- **Bridge API** : Intégration bancaire (mockée ?)
- **OCR Services** : Mindee (mockée ?)

---

## 9. 📊 Statistiques

- **Schémas MongoDB** : 27 collections
- **Modules NestJS** : 25 modules
- **Controllers Backend** : 27 controllers
- **Composants React** : 36+ composants
- **Pages Frontend** : 13 pages
- **Endpoints API** : ~150+ endpoints estimés

---

## 10. 🚀 Commandes de Démarrage

**Backend** :
```bash
cd backend
npm install
npm run start:dev  # Port 3000
```

**Frontend** :
```bash
npm install
npm run dev  # Port 3002, proxy vers backend:3000
```

**Variables d'environnement Backend** (`.env`) :
- `PORT=3000`
- `DB_URI=mongodb://localhost:27017/invoicia`
- `JWT_SECRET=your_secret_key`

---

**Fin du Rapport**
