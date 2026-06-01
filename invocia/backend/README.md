# Invoicia Backend API

Backend NestJS pour la plateforme SaaS Invoicia.

## 🚀 Technologies

- **Framework**: NestJS 10.x
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **TypeScript**: 5.x

## 📋 Prérequis

- Node.js 18+ 
- MongoDB 4.4+
- npm ou yarn

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env (voir .env.example)
cp .env.example .env

# Modifier les variables d'environnement selon votre configuration
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine du backend :

```env
# Database
DB_URI=mongodb://localhost:27017/invoicia

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🏃 Démarrage

```bash
# Développement (avec hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000/api`

## 📚 Structure de l'API

### Authentification

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Modules disponibles

- **Users** (`/api/users`) - Gestion des utilisateurs
- **Tenants** (`/api/tenants`) - Gestion des organisations
- **Invoices** (`/api/invoices`) - Gestion des factures
- **CreditNotes** (`/api/credit-notes`) - Gestion des avoirs
- **Projects** (`/api/projects`) - Gestion des projets
- **Expenses** (`/api/expenses`) - Gestion des dépenses
- **Employees** (`/api/employees`) - Gestion des employés
- **Clients** (`/api/clients`) - Gestion des clients
- **Suppliers** (`/api/suppliers`) - Gestion des fournisseurs
- **Accounting** (`/api/accounting`) - Écritures comptables

## 🔐 Authentification

Toutes les routes (sauf `/auth/login` et `/auth/register`) nécessitent un token JWT.

Inclure le token dans les headers :
```
Authorization: Bearer <token>
```

## 📖 Exemples d'utilisation

### Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Créer une facture (avec token)

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "number": "FA-2025-001",
    "date": "2025-01-15",
    "dueDate": "2025-02-15",
    "clientId": "client-id",
    "client": "Client Name",
    "items": [
      {
        "article": "Prestation",
        "description": "Description",
        "quantity": 1,
        "unitPrice": 1000,
        "vatRate": 20
      }
    ]
  }'
```

## 🔧 Scripts disponibles

- `npm run start` - Démarre l'application
- `npm run start:dev` - Démarre en mode développement (watch)
- `npm run start:prod` - Démarre en mode production
- `npm run build` - Compile TypeScript
- `npm run lint` - Lint le code
- `npm test` - Lance les tests

## 🌐 Configuration Apache2

Le fichier de configuration Apache2 se trouve dans `apache-config/invoicia.conf`.

Pour activer la configuration :

```bash
# Copier le fichier de configuration
sudo cp apache-config/invoicia.conf /etc/apache2/sites-available/

# Activer le site
sudo a2ensite invoicia.conf

# Activer les modules nécessaires
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers

# Recharger Apache
sudo systemctl reload apache2
```

## 📝 Notes

- Toutes les routes sont préfixées par `/api`
- L'isolation multi-tenant est gérée automatiquement via `tenantId` dans le JWT
- Les dates doivent être au format ISO 8601 (YYYY-MM-DD)
- Les montants sont stockés en centimes (ou avec 2 décimales)

## 🔒 Sécurité

- **JWT**: Utilisez un secret fort en production
- **CORS**: Configurez correctement `FRONTEND_URL`
- **MongoDB**: Utilisez une authentification MongoDB en production
- **HTTPS**: Activez HTTPS en production (voir config Apache2)

## 📞 Support

Pour toute question, consultez la documentation NestJS : https://docs.nestjs.com

