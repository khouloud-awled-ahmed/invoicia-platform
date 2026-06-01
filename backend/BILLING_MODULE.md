# Module de Facturation - Documentation

## Vue d'ensemble

Le module de facturation regroupe tous les modules liés aux achats, ventes et facturation en un seul module principal avec des sous-modules. Il inclut également la génération de factures au format structuré (UBL, CII, Factur-X) et l'intégration avec les Plateformes Agréées par l'État.

## Structure du Module

```
billing/
├── billing.module.ts              # Module principal
├── billing.controller.ts          # Contrôleur principal
├── billing.service.ts             # Service principal
├── submodules/
│   ├── invoices/                   # Sous-module Factures
│   ├── credit-notes/              # Sous-module Avoirs
│   ├── suppliers/                 # Sous-module Fournisseurs
│   ├── clients/                   # Sous-module Clients
│   └── accounting/                # Sous-module Comptabilité
├── structured-formats/             # Formats structurés
│   ├── generators/
│   │   ├── ubl-generator.service.ts      # Générateur UBL
│   │   ├── cii-generator.service.ts     # Générateur CII
│   │   └── factur-x-generator.service.ts # Générateur Factur-X
│   └── structured-formats.service.ts
└── platform-agreement/            # Plateformes Agréées
    └── platform-agreement.service.ts
```

## Activation du Module

Le module de facturation doit être activé dans les paramètres du tenant. Par défaut, il est désactivé.

### Activation via API

```http
PATCH /api/tenants/:id/billing-settings
Content-Type: application/json

{
  "enabled": true,
  "structuredFormatsEnabled": true,
  "platformAgreementEnabled": true,
  "platformAgreementConfig": {
    "platform": "chorus-pro",
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret"
  }
}
```

### Vérification du statut

```http
GET /api/tenants/:id/billing-settings
```

Réponse :
```json
{
  "enabled": true,
  "structuredFormatsEnabled": true,
  "platformAgreementEnabled": true,
  "platformAgreementConfig": {
    "platform": "chorus-pro",
    "apiKey": "***"
  },
  "features": ["billing", "structured-formats", "platform-agreement"]
}
```

## Routes API

### Module de Facturation Principal

- `GET /api/billing/status` - Statut du module de facturation
- `GET /api/billing/summary` - Résumé de la facturation

### Sous-modules

#### Factures
- `GET /api/billing/invoices` - Liste des factures
- `POST /api/billing/invoices` - Créer une facture
- `GET /api/billing/invoices/:id` - Détails d'une facture
- `PATCH /api/billing/invoices/:id` - Modifier une facture
- `DELETE /api/billing/invoices/:id` - Supprimer une facture
- `POST /api/billing/invoices/generate-from-cra/:craPeriodId` - Générer depuis CRA

#### Avoirs
- `GET /api/billing/credit-notes` - Liste des avoirs
- `POST /api/billing/credit-notes` - Créer un avoir
- `GET /api/billing/credit-notes/:id` - Détails d'un avoir
- `PATCH /api/billing/credit-notes/:id` - Modifier un avoir
- `DELETE /api/billing/credit-notes/:id` - Supprimer un avoir

#### Fournisseurs
- `GET /api/billing/suppliers` - Liste des fournisseurs
- `POST /api/billing/suppliers` - Créer un fournisseur
- `GET /api/billing/suppliers/:id` - Détails d'un fournisseur
- `PATCH /api/billing/suppliers/:id` - Modifier un fournisseur
- `DELETE /api/billing/suppliers/:id` - Supprimer un fournisseur

#### Clients
- `GET /api/billing/clients` - Liste des clients
- `POST /api/billing/clients` - Créer un client
- `GET /api/billing/clients/:id` - Détails d'un client
- `PATCH /api/billing/clients/:id` - Modifier un client
- `DELETE /api/billing/clients/:id` - Supprimer un client

#### Comptabilité
- `GET /api/billing/accounting` - Liste des écritures comptables
- `POST /api/billing/accounting` - Créer une écriture
- `GET /api/billing/accounting/:id` - Détails d'une écriture
- `PATCH /api/billing/accounting/:id` - Modifier une écriture
- `DELETE /api/billing/accounting/:id` - Supprimer une écriture

## Formats Structurés

### Formats Disponibles

1. **UBL (Universal Business Language)** - Format OASIS conforme ISO/IEC 19845:2015
2. **CII (Cross Industry Invoice)** - Format UN/CEFACT
3. **Factur-X** - Format hybride PDF/A-3 avec XML intégré (EN 16931)

### Génération d'une Facture au Format Structuré

```http
GET /api/billing/structured-formats/invoice/:invoiceId/:format
```

Formats disponibles : `UBL`, `CII`, `Factur-X`

Exemple :
```http
GET /api/billing/structured-formats/invoice/507f1f77bcf86cd799439011/UBL
```

Réponse :
```json
{
  "format": "UBL",
  "version": "2.1",
  "data": { ... },
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>..."
}
```

### Validation d'une Facture

```http
POST /api/billing/structured-formats/invoice/:invoiceId/validate
```

Réponse :
```json
{
  "valid": true,
  "errors": []
}
```

## Plateformes Agréées (PA)

### Plateformes Disponibles

1. **Chorus Pro** - Plateforme publique de facturation électronique
2. **Dematis** - Solution de dématérialisation
3. **SAP Ariba** - Plateforme de facturation électronique
4. **Tradeshift** - Réseau de facturation électronique

### Configuration

```http
PATCH /api/tenants/:id/billing-settings
Content-Type: application/json

{
  "platformAgreementEnabled": true,
  "platformAgreementConfig": {
    "platform": "chorus-pro",
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "endpoint": "https://api.chorus-pro.gouv.fr"
  }
}
```

### Transmission d'une Facture

```http
POST /api/billing/platform-agreement/invoice/:invoiceId/transmit
Content-Type: application/json

{
  "format": "Factur-X",
  "platform": "chorus-pro"
}
```

Réponse :
```json
{
  "success": true,
  "invoiceId": "507f1f77bcf86cd799439011",
  "platform": "Chorus Pro",
  "format": "Factur-X",
  "reference": "PA-1234567890-FACT-001",
  "transmittedAt": "2024-01-15T10:30:00Z"
}
```

### Statut de Transmission

```http
GET /api/billing/platform-agreement/invoice/:invoiceId/status
```

Réponse :
```json
{
  "transmitted": true,
  "platform": "chorus-pro",
  "format": "Factur-X",
  "status": "success",
  "reference": "PA-1234567890-FACT-001",
  "transmittedAt": "2024-01-15T10:30:00Z"
}
```

### Liste des Plateformes Disponibles

```http
GET /api/billing/platform-agreement/platforms
```

## Sécurité

- Toutes les routes nécessitent une authentification JWT
- Le module vérifie que le tenant a activé les fonctionnalités avant de les utiliser
- Les identifiants de Plateforme Agréée sont stockés de manière sécurisée dans les métadonnées du tenant

## Notes Importantes

1. **Activation Requise** : Le module doit être activé dans les paramètres du tenant avant utilisation
2. **Formats Structurés** : Nécessite l'activation de `structuredFormatsEnabled`
3. **Plateformes Agréées** : Nécessite l'activation de `platformAgreementEnabled` et la configuration des identifiants API
4. **Factur-X** : Format hybride nécessitant l'intégration du XML dans un PDF/A-3 (non implémenté dans cette version)

## Prochaines Étapes

- [ ] Implémentation complète de l'intégration PDF/A-3 pour Factur-X
- [ ] Implémentation des appels API réels pour chaque Plateforme Agréée
- [ ] Validation XSD pour les formats structurés
- [ ] Gestion des erreurs et retry automatique pour les transmissions
- [ ] Webhooks pour les notifications de statut de transmission
