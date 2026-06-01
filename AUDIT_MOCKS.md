# Audit Global des Mocks - Rapport Complet

## ✅ CONFIRMATION : Modale Paie créée et intégrée

**Fichier** : `src/components/PayrollSettingsModal.tsx`
- ✅ Modale avec 2 onglets (Identité + Organismes)
- ✅ Types d'organismes français réels (URSSAF, DGFIP, POLE_EMPLOI, etc.)
- ✅ Pré-remplissage automatique (Code APE: 6201Z, Convention: SYNTEC)
- ✅ Intégrée dans `HRComplete.tsx` avec bouton "Paramétrage DSN"

---

## 📊 Liste des Mocks à Nettoyer

| Fichier | Type de Mock | Action requise | Priorité |
|---------|--------------|----------------|----------|
| `src/components/SalesManagement.tsx` | `MOCK_INVOICES` (ligne 83) | Remplacer par `apiClient.getInvoices()` | 🔴 Haute |
| `src/components/UserManagement.tsx` | `MOCK_USERS` (ligne 73) | Remplacer par `apiClient.getUsers()` | 🔴 Haute |
| `src/lib/auth.ts` | `MOCK_USER` (ligne 25) | Utiliser l'utilisateur réel depuis localStorage | 🔴 Haute |
| `src/components/BankAccountManagement.tsx` | `MOCK_BANK_ACCOUNTS` (ligne 44) | Remplacer par `apiClient.getBankAccounts()` | 🔴 Haute |
| `src/lib/bank-accounts.ts` | `MOCK_BANK_ACCOUNTS` (ligne 47) | Supprimer, utiliser API | 🔴 Haute |
| `src/lib/banking.ts` | `MOCK_BANK_ACCOUNTS`, `MOCK_TRANSACTIONS`, `MOCK_SUGGESTIONS` | Remplacer par appels API réels | 🔴 Haute |
| `src/lib/credit-notes.ts` | `MOCK_CREDIT_NOTES`, `MOCK_INVOICES_FOR_CREDIT` | Remplacer par API | 🔴 Haute |
| `src/lib/webhooks.ts` | `MOCK_WEBHOOKS`, `MOCK_WEBHOOK_LOGS` | Remplacer par API | 🔴 Haute |
| `src/components/CRAManagement.tsx` | `MOCK_CRA_SHEETS` (ligne 124) | Remplacer par `apiClient.getCRASheets()` | 🔴 Haute |
| `src/components/AccountingComplete.tsx` | `MOCK_TREASURY_HISTORY`, `MOCK_TREASURY_FORECAST`, `MOCK_EXPENSES_BY_CATEGORY`, `MOCK_BANK_TRANSACTIONS`, `MOCK_ASSETS`, `MOCK_BUDGETS`, `MOCK_ALERTS` | Remplacer par appels API | 🔴 Haute |
| `src/components/UserRoleManagement.tsx` | `MOCK_USERS` (ligne 428) | Remplacer par `apiClient.getUsers()` | 🔴 Haute |
| `src/components/StaffingPlanning.tsx` | `MOCK_RESOURCES`, `MOCK_ASSIGNMENTS` | Remplacer par API | 🔴 Haute |
| `src/components/PipelineCommercial.tsx` | `MOCK_OPPORTUNITIES` (ligne 22) | Remplacer par API | 🔴 Haute |
| `src/components/AutoInvoicing.tsx` | `MOCK_ENTRIES` (ligne 26) | Remplacer par API | 🔴 Haute |
| `src/components/SupplierAttestations.tsx` | `MOCK_SUPPLIERS` (ligne 101) | Remplacer par `apiClient.getSuppliers()` | 🔴 Haute |
| `src/components/PurchaseInvoiceAIReader.tsx` | `MOCK_PROCESSED_INVOICES` (ligne 106) | Utiliser données réelles après traitement OCR | 🟡 Moyenne |
| `src/components/CVAIReader.tsx` | `MOCK_PROCESSED_CVS` (ligne 161) | Utiliser données réelles après traitement OCR | 🟡 Moyenne |
| `src/components/CVTechManagement.tsx` | `MOCK_CVS` (ligne 115) | Remplacer par `apiClient.getCVs()` | 🔴 Haute |
| `src/components/AuditLogs.tsx` | `MOCK_AUDIT_LOGS` (ligne 46) | Remplacer par `apiClient.getAuditLogs()` | 🔴 Haute |
| `src/components/BankConnectionWizard.tsx` | `mockAccounts` (ligne 51) | Récupérer depuis l'API après connexion | 🟡 Moyenne |
| `src/components/WebhookManagement.tsx` | Utilise `MOCK_WEBHOOKS` depuis `lib/webhooks.ts` | Remplacer par API | 🔴 Haute |
| `src/components/PaymentManagement.tsx` | `mockPayments` (ligne 34) | Remplacer par `apiClient.getPayments()` | 🔴 Haute |
| `src/lib/platform-data.ts` | `MOCK_PLATFORM_STATS`, `MOCK_SUBSCRIPTION_PLANS`, `MOCK_PLATFORM_USERS`, `MOCK_SYSTEM_HEALTH`, `MOCK_REVENUE_DATA` | Remplacer par API SuperAdmin | 🔴 Haute |
| `src/components/PlatformAdmins.tsx` | Utilise `MOCK_PLATFORM_USERS` | Remplacer par API | 🔴 Haute |
| `src/components/SubscriptionPlans.tsx` | Utilise `MOCK_SUBSCRIPTION_PLANS` | Remplacer par API | 🔴 Haute |
| `src/components/AlertsManager.tsx` | `demoAlerts` (ligne 141) | Remplacer par `apiClient.getAlerts()` | 🔴 Haute |
| `src/components/CRAWorkflowConfig.tsx` | `MOCK_EMPLOYEES` (ligne 163) | Remplacer par `apiClient.getEmployees()` | 🔴 Haute |
| `src/components/CVVerificationDialog.tsx` | `mockSocialProfiles`, `mockReport` (lignes 101, 141) | Utiliser données réelles après vérification | 🟡 Moyenne |
| `src/components/MFASetup.tsx` | `mockSecret`, `mockBackupCodes` (lignes 47-48) | Générer depuis le backend | 🟡 Moyenne |
| `src/components/SSOConfiguration.tsx` | `mockCallbackUrl`, `mockEntityId` (lignes 112-113) | Générer depuis le backend | 🟡 Moyenne |
| `src/components/ExpenseImportDialog.tsx` | `fakeEvent` (ligne 209) | Utiliser événement réel | 🟢 Basse |
| `src/components/HRComplete.tsx` | `SALARY_EVOLUTION`, `ABSENCE_STATS` (lignes 207-227) | Calculer depuis données réelles | 🟡 Moyenne |

---

## 📝 Notes importantes

### Mocks de développement (à garder temporairement)
- `MFASetup.tsx` : Les codes mock sont pour le développement, remplacer par génération backend
- `SSOConfiguration.tsx` : URLs mock pour démo, remplacer par config backend
- `ExpenseImportDialog.tsx` : `fakeEvent` utilisé pour simulation, OK pour tests

### Données statiques (non critiques)
- `HRComplete.tsx` : `SALARY_EVOLUTION`, `ABSENCE_STATS` - Données de graphiques, calculer depuis API
- `ProjectManagement.tsx` : Statuts "todo" - OK, ce sont des valeurs d'énumération

### TODO / FIXME à traiter
- `src/lib/api-client-backend.ts` : Ligne 1048 - TODO pour endpoint
- `src/components/CreditNoteFormDialog.tsx` : Ligne 148 - TODO updateCreditNote
- `src/components/UnifiedSupplierManagement.tsx` : Lignes 155, 169 - TODO getSuppliers/getContractors
- `src/components/AITemplateGenerator.tsx` : Lignes 101, 125 - TODO endpoints AI
- `src/components/ExpenseImportDialog.tsx` : Ligne 231 - TODO processExpenseOCR
- `src/components/InvoiceImportDialog.tsx` : Lignes 48, 71 - TODO importInvoices/processInvoiceAI
- `src/pages/platform/PlatformDashboardPage.tsx` : Ligne 41 - TODO calculer totalRevenue

---

## 🎯 Plan d'action recommandé

### Phase 1 (Priorité Haute - Core Business)
1. `SalesManagement.tsx` - Factures
2. `BankAccountManagement.tsx` - Comptes bancaires
3. `AccountingComplete.tsx` - Données comptables
4. `CRAManagement.tsx` - CRA
5. `UserManagement.tsx` + `UserRoleManagement.tsx` - Utilisateurs

### Phase 2 (Priorité Moyenne - Features)
6. `StaffingPlanning.tsx` - Staffing
7. `PipelineCommercial.tsx` - CRM
8. `SupplierAttestations.tsx` - Fournisseurs
9. `CVTechManagement.tsx` - CV Tech
10. `PaymentManagement.tsx` - Paiements

### Phase 3 (Priorité Basse - Admin/Platform)
11. `platform-data.ts` - Données plateforme
12. `AuditLogs.tsx` - Logs d'audit
13. `AlertsManager.tsx` - Alertes

---

**Total de fichiers avec mocks** : 28 fichiers
**Mocks critiques (Haute priorité)** : 20 fichiers
**Mocks moyens** : 6 fichiers
**Mocks basse priorité** : 2 fichiers
