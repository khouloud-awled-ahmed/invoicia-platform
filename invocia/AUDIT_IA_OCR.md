# 🔍 Audit Complet - Cartographie des Modules IA & OCR

**Date de l'audit** : 26 Janvier 2026  
**Scope** : Backend NestJS + Frontend React  
**Objectif** : Identifier toutes les fonctionnalités "Intelligentes" et leur type (Externe/Interne/Mock)

---

## 📊 Résumé Exécutif

| Type | Nombre | Pourcentage |
|------|--------|------------|
| 🔴 **EXTERNAL AI** (Coût potentiel) | 1 | 8% |
| 🟡 **INTERNAL LOGIC** (Gratuit) | 1 | 8% |
| 🟣 **MOCK / FAKE** (À remplacer) | 10 | 84% |
| **TOTAL** | **12** | **100%** |

---

## 📋 Tableau Détaillé

| Module / Fichier | Type | Description de la fonction | État | Action Requise |
|:-----------------|:-----|:---------------------------|:-----|:---------------|
| **BankFileParserService** | 🟡 **INTERNAL LOGIC** | Service d'analyse de fichiers bancaires (PDF/CSV) avec apprentissage de formats. Utilise `pdf-parse` et `csv-parse` (bibliothèques locales Node.js). Signature-based template matching. | ✅ **Fonctionnel** | Aucune - Code local, gratuit |
| `backend/src/banking/services/bank-file-parser.service.ts` | | | | |
| **InvoiceFormDialog - Scanner IA** | 🟣 **MOCK / FAKE** | Bouton "Scanner avec l'IA" dans le formulaire de création de facture. Affiche un dialog mais ne fait que `console.log("Scanner avec l'IA")`. Aucun appel API réel. | ❌ **Non implémenté** | Implémenter OCR réel (Mindee/Google Vision) ou supprimer le bouton |
| `src/components/InvoiceFormDialog.tsx` (ligne 780) | | | | |
| **ExpenseImportDialog - OCR** | 🟣 **MOCK / FAKE** | Fonction `processInvoiceOCR()` pour extraire les données de factures fournisseurs. Contient uniquement un `TODO` commenté et affiche `toast.error("Fonctionnalité d'extraction OCR en cours d'implémentation")`. | ❌ **Non implémenté** | Implémenter OCR réel ou supprimer l'option |
| `src/components/ExpenseImportDialog.tsx` (ligne 220-247) | | | | |
| **PurchaseInvoiceAIReader** | 🟣 **MOCK / FAKE** | Composant complet pour lire les factures fournisseurs avec "IA". Utilise `MOCK_PROCESSED_INVOICES` avec données statiques hardcodées. Aucun traitement réel. | ❌ **Non implémenté** | Remplacer par OCR réel ou supprimer |
| `src/components/PurchaseInvoiceAIReader.tsx` | | | | |
| **CVAIReader** | 🟣 **MOCK / FAKE** | Lecteur de CV avec extraction automatique. Simule le traitement avec `setTimeout()` et retourne des données statiques (`firstName: "Nouveau", lastName: "Candidat"`). | ❌ **Non implémenté** | Implémenter OCR réel (Tesseract/Google Vision) ou supprimer |
| `src/components/CVAIReader.tsx` (ligne 312-353) | | | | |
| **AITemplateGenerator** | 🟣 **MOCK / FAKE** | Génération de templates de facture depuis une image via IA. Fonction `handleGenerateFromImage()` contient un `TODO` et affiche `toast.error("Fonctionnalité de génération de template IA depuis image en cours d'implémentation")`. | ❌ **Non implémenté** | Implémenter vision AI (GPT-4 Vision/Claude) ou supprimer |
| `src/components/AITemplateGenerator.tsx` (ligne 115-139) | | | | |
| **InvoiceImportDialog - Import IA** | 🟣 **MOCK / FAKE** | Onglet "Scan IA" pour importer des factures via OCR. Fonction `handleAIImport()` contient un `TODO` et affiche `toast.error("Fonctionnalité d'import IA en cours d'implémentation")`. | ❌ **Non implémenté** | Implémenter OCR réel ou supprimer l'onglet |
| `src/components/InvoiceImportDialog.tsx` (ligne 66-86) | | | | |
| **banking.ts - Suggestions** | 🟣 **MOCK / FAKE** | Fonction `getSuggestionsForTransaction()` pour suggérer des correspondances entre transactions bancaires et factures. Retourne `MOCK_SUGGESTIONS` (tableau statique hardcodé). | ❌ **Non implémenté** | Implémenter algorithme de matching réel ou supprimer |
| `src/lib/banking.ts` (ligne 324-456) | | | | |
| **GlobalSettings - Mindee OCR** | 🔴 **EXTERNAL AI** | Configuration d'API pour "Mindee OCR (Factures)" dans les paramètres globaux. Champ `apiKey` présent mais pas d'implémentation réelle. Mentionné comme service externe. | ⚠️ **Configuré mais non utilisé** | Implémenter l'intégration Mindee ou supprimer la config |
| `src/components/GlobalSettings.tsx` (ligne 32-63) | | | | |
| **Invoice Schema - extractionConfidence** | 🟣 **MOCK / FAKE** | Champ `extractionConfidence?: number` dans le schéma Invoice. Présent dans le backend mais jamais calculé ni rempli. | ❌ **Champ inutilisé** | Calculer la confiance lors de l'extraction ou supprimer le champ |
| `backend/src/billing/sales/schemas/invoice.schema.ts` (ligne 70) | | | | |
| **Expense Schema - extractionConfidence** | 🟣 **MOCK / FAKE** | Champ `extractionConfidence?: number` dans le schéma Expense. Présent dans le backend mais jamais calculé ni rempli. | ❌ **Champ inutilisé** | Calculer la confiance lors de l'extraction ou supprimer le champ |
| `backend/src/billing/purchases/schemas/expense.schema.ts` (ligne 42) | | | | |
| **ExpenseManagement - Affichage confiance** | 🟣 **MOCK / FAKE** | Affiche "Confiance IA: {expense.extractionConfidence}%" dans l'interface mais la valeur est toujours undefined/null. | ❌ **Affichage inutile** | Supprimer l'affichage ou calculer la valeur |
| `src/components/ExpenseManagement.tsx` (ligne 439) | | | | |

---

## 🎯 Recommandations par Priorité

### 🔴 **PRIORITÉ HAUTE** - Supprimer les Mocks Visibles

1. **InvoiceFormDialog** - Supprimer le bouton "Scanner avec l'IA" ou implémenter OCR réel
2. **InvoiceImportDialog** - Supprimer l'onglet "Scan IA" ou implémenter OCR réel
3. **ExpenseImportDialog** - Supprimer l'option OCR ou implémenter OCR réel
4. **PurchaseInvoiceAIReader** - Supprimer le composant ou implémenter OCR réel
5. **CVAIReader** - Supprimer le composant ou implémenter OCR réel

### 🟡 **PRIORITÉ MOYENNE** - Nettoyer les Champs Inutilisés

6. **Invoice/Expense Schema** - Supprimer `extractionConfidence` ou calculer la valeur
7. **ExpenseManagement** - Supprimer l'affichage de confiance ou calculer la valeur
8. **banking.ts** - Supprimer `MOCK_SUGGESTIONS` ou implémenter algorithme de matching réel

### 🟢 **PRIORITÉ BASSE** - Configurations Futures

9. **GlobalSettings - Mindee** - Garder la config si prévu d'implémenter, sinon supprimer
10. **AITemplateGenerator** - Supprimer ou implémenter avec GPT-4 Vision/Claude

---

## 💰 Estimation des Coûts (si implémentation EXTERNAL AI)

| Service | Coût estimé par 1000 documents | Recommandation |
|---------|-------------------------------|----------------|
| **Mindee OCR** | ~5-10€ | ✅ Recommandé pour factures (spécialisé) |
| **Google Cloud Vision** | ~1.5€ | Alternative générique |
| **OpenAI GPT-4 Vision** | ~10-20€ | Trop cher pour OCR simple |
| **Tesseract (Self-hosted)** | 0€ | ✅ Gratuit mais moins précis |

---

## ✅ Points Positifs

- ✅ **BankFileParserService** : Excellent exemple d'IA interne sans coût externe
- ✅ Architecture prête pour intégration OCR (champs `extractionConfidence` présents)
- ✅ Séparation claire entre mocks et code réel

---

## ⚠️ Points d'Attention

- ⚠️ **84% des fonctionnalités IA sont des mocks** - Risque de confusion utilisateur
- ⚠️ **Aucune vraie intégration OCR** - Toutes les promesses "IA" sont non fonctionnelles
- ⚠️ **Champs `extractionConfidence` jamais remplis** - Données incomplètes

---

## 📝 Notes Techniques

- Le seul module réellement fonctionnel est `BankFileParserService` qui utilise des bibliothèques locales (`pdf-parse`, `csv-parse`)
- Tous les autres modules "IA" sont des placeholders avec `TODO` ou données statiques
- Aucune clé API externe n'est réellement utilisée dans le code (seulement des placeholders dans les settings)

---

**Généré le** : 26 Janvier 2026  
**Auditeur** : Code Auditor & AI Integration Specialist
