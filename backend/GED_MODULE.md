# Module GED (Gestion Électronique de Documents) - Documentation

## Vue d'ensemble

Le module GED permet de gérer les documents de manière organisée avec :
- **Gestion des dossiers et sous-dossiers** : Structure hiérarchique complète
- **Classement automatique** : Organisation par type de document selon des règles configurables
- **Réorganisation** : Déplacement de dossiers et documents
- **Types de documents supportés** : Factures, Dépenses, Avoirs, Devis, Documents fournisseurs/clients, Contrats, Documents société

## Structure du Module

```
ged/
├── ged.module.ts                    # Module principal
├── ged.controller.ts                # Contrôleur REST
├── ged.service.ts                   # Service métier
├── schemas/
│   ├── ged-folder.schema.ts         # Schéma des dossiers
│   ├── ged-document.schema.ts       # Schéma des documents
│   └── ged-classification-rule.schema.ts  # Schéma des règles de classement
└── dto/
    ├── create-folder.dto.ts         # DTO création dossier
    └── create-classification-rule.dto.ts  # DTO création règle
```

## Types de Documents

Les types de documents suivants sont supportés :
- `facture` - Factures clients
- `depense` - Notes de frais et dépenses
- `avoir` - Avoirs et notes de crédit
- `devis` - Devis et propositions commerciales
- `document_fournisseur` - Documents fournisseurs
- `document_client` - Documents clients
- `contrat` - Contrats et conventions
- `document_societe` - Documents de la société (K-bis, statuts, etc.)
- `autre` - Autres documents

## Routes API

### Gestion des Dossiers

#### Créer un dossier
```http
POST /api/ged/folders
Content-Type: application/json

{
  "name": "Factures 2025",
  "parentId": null,  // null pour dossier racine
  "documentType": "factures",
  "description": "Dossier pour les factures de l'année 2025"
}
```

#### Obtenir l'arborescence des dossiers
```http
GET /api/ged/folders/tree?rootFolderId=xxx
```

Réponse :
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Factures",
    "path": "/Factures",
    "documentType": "factures",
    "documentCount": 15,
    "totalSize": 5242880,
    "children": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "2025",
        "path": "/Factures/2025",
        "documentCount": 10,
        "children": []
      }
    ]
  }
]
```

#### Modifier un dossier
```http
PATCH /api/ged/folders/:id
Content-Type: application/json

{
  "name": "Factures 2025 (Renommé)",
  "description": "Nouvelle description"
}
```

#### Déplacer un dossier
```http
PUT /api/ged/folders/:id/move
Content-Type: application/json

{
  "newParentId": "507f1f77bcf86cd799439013"  // null pour déplacer à la racine
}
```

#### Supprimer un dossier
```http
DELETE /api/ged/folders/:id?force=true
```
- `force=true` : Supprime récursivement tous les sous-dossiers et documents

### Gestion des Documents

#### Uploader un document
```http
POST /api/ged/documents/upload?folderId=xxx&documentType=facture
Content-Type: multipart/form-data

file: [fichier]
```

Le document sera automatiquement classé selon les règles de classement si `folderId` n'est pas fourni.

#### Obtenir les documents
```http
GET /api/ged/documents?folderId=xxx&documentType=facture&archived=false
```

Paramètres :
- `folderId` : Filtrer par dossier
- `documentType` : Filtrer par type
- `archived` : `true`/`false` pour les documents archivés

#### Déplacer un document
```http
PUT /api/ged/documents/:id/move
Content-Type: application/json

{
  "newFolderId": "507f1f77bcf86cd799439013"  // null pour déplacer à la racine
}
```

#### Supprimer un document
```http
DELETE /api/ged/documents/:id
```

### Règles de Classement

#### Créer une règle de classement
```http
POST /api/ged/classification-rules
Content-Type: application/json

{
  "name": "Factures PDF vers dossier Factures",
  "documentType": "facture",
  "targetFolderId": "507f1f77bcf86cd799439011",
  "keywords": ["facture", "invoice"],
  "fileExtensions": [".pdf"],
  "priority": 10,
  "conditions": {
    "minSize": 1024,
    "maxSize": 10485760
  }
}
```

#### Obtenir toutes les règles
```http
GET /api/ged/classification-rules
```

#### Modifier une règle
```http
PATCH /api/ged/classification-rules/:id
Content-Type: application/json

{
  "isActive": false,
  "priority": 5
}
```

#### Supprimer une règle
```http
DELETE /api/ged/classification-rules/:id
```

## Classement Automatique

Le système de classement automatique fonctionne selon les règles suivantes :

1. **Priorité** : Les règles sont appliquées par ordre de priorité décroissante
2. **Mots-clés** : Si des mots-clés sont définis, le nom du fichier doit les contenir
3. **Extensions** : Si des extensions sont définies, le fichier doit avoir une de ces extensions
4. **Conditions** : Vérification de la taille du fichier si définie
5. **Type de document** : Correspondance avec le type de document si spécifié

### Exemple de Configuration

Pour classer automatiquement les factures PDF dans le dossier "Factures/2025" :

```json
{
  "name": "Factures PDF 2025",
  "documentType": "facture",
  "targetFolderId": "507f1f77bcf86cd799439011",
  "keywords": ["facture", "invoice", "2025"],
  "fileExtensions": [".pdf"],
  "priority": 10
}
```

## Structure Recommandée

### Organisation par Type de Document

```
/
├── Factures/
│   ├── 2025/
│   │   ├── Janvier/
│   │   ├── Février/
│   │   └── ...
│   └── 2024/
├── Dépenses/
│   ├── 2025/
│   └── 2024/
├── Avoirs/
├── Devis/
├── Documents Fournisseurs/
│   ├── Fournisseur A/
│   └── Fournisseur B/
├── Documents Clients/
│   ├── Client X/
│   └── Client Y/
├── Contrats/
└── Documents Société/
    ├── K-bis/
    ├── Statuts/
    └── Assurances/
```

## Intégration avec Attachments

Le module GED utilise le module `Attachments` existant pour le stockage des fichiers dans MongoDB GridFS. Les fichiers sont stockés dans le bucket `attachments` avec les métadonnées appropriées.

## Sécurité

- Toutes les routes nécessitent une authentification JWT
- Isolation multi-tenant : chaque tenant ne voit que ses propres dossiers et documents
- Validation des types de fichiers lors de l'upload
- Limite de taille : 10MB par défaut (configurable)

## Notes Importantes

1. **Chemins** : Les chemins sont automatiquement mis à jour lors du déplacement de dossiers
2. **Compteurs** : Les compteurs de documents et tailles sont automatiquement mis à jour
3. **Suppression récursive** : La suppression d'un dossier avec `force=true` supprime tous les contenus
4. **Classement automatique** : Si aucun dossier n'est spécifié lors de l'upload, le système essaie de classer automatiquement selon les règles
