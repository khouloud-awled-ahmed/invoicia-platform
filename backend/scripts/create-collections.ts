import * as mongoose from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement depuis .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/DB_INVOCIA';

// S'assurer que l'URI pointe vers DB_INVOCIA
let mongoUri = DB_URI;
if (!mongoUri.includes('/DB_INVOCIA') && !mongoUri.includes('?dbName')) {
  // Si l'URI se termine par /invoicia ou autre, remplacer par DB_INVOCIA
  mongoUri = mongoUri.replace(/\/[^\/\?]+(\?|$)/, '/DB_INVOCIA$1');
  if (!mongoUri.includes('DB_INVOCIA')) {
    mongoUri = mongoUri.replace(/(mongodb[^\/]*\/\/[^\/]+)\/?(\?|$)/, '$1/DB_INVOCIA$2');
  }
}

console.log(`🔗 Connexion à MongoDB : ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

async function createCollections() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB réussie');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('\n📦 Création des collections et index...\n');

    // Type pour les index
    interface IndexDefinition {
      key: Record<string, number>;
      unique?: boolean;
      name: string;
    }

    interface CollectionConfig {
      name: string;
      indexes: IndexDefinition[];
    }

    // Liste des collections à créer avec leurs index
    const collections: CollectionConfig[] = [
      {
        name: 'users',
        indexes: [
          { key: { email: 1 }, unique: true, name: 'email_1' },
          { key: { tenantId: 1 }, name: 'tenantId_1' },
          { key: { tenantId: 1, email: 1 }, name: 'tenantId_1_email_1' },
        ],
      },
      {
        name: 'tenants',
        indexes: [
          { key: { siret: 1 }, unique: true, name: 'siret_1' },
          { key: { email: 1 }, name: 'email_1' },
        ],
      },
      {
        name: 'clients',
        indexes: [
          { key: { tenantId: 1, name: 1 }, name: 'tenantId_1_name_1' },
          { key: { tenantId: 1, email: 1 }, name: 'tenantId_1_email_1' },
        ],
      },
      {
        name: 'suppliers',
        indexes: [
          { key: { tenantId: 1, name: 1 }, name: 'tenantId_1_name_1' },
        ],
      },
      {
        name: 'invoices',
        indexes: [
          // Index unique composé : le numéro de facture doit être unique par tenant (pas globalement)
          { key: { tenantId: 1, number: 1 }, unique: true, name: 'tenantId_1_number_1' },
          { key: { tenantId: 1, status: 1 }, name: 'tenantId_1_status_1' },
          { key: { tenantId: 1, date: -1 }, name: 'tenantId_1_date_-1' },
        ],
      },
      {
        name: 'creditnotes',
        indexes: [
          // Index unique composé : le numéro d'avoir doit être unique par tenant (pas globalement)
          { key: { tenantId: 1, number: 1 }, unique: true, name: 'tenantId_1_number_1' },
          { key: { tenantId: 1, relatedInvoiceId: 1 }, name: 'tenantId_1_relatedInvoiceId_1' },
        ],
      },
      {
        name: 'projects',
        indexes: [
          { key: { tenantId: 1, status: 1 }, name: 'tenantId_1_status_1' },
        ],
      },
      {
        name: 'craentries',
        indexes: [
          { key: { tenantId: 1, userId: 1, date: -1 }, name: 'tenantId_1_userId_1_date_-1' },
          { key: { tenantId: 1, projectId: 1 }, name: 'tenantId_1_projectId_1' },
        ],
      },
      {
        name: 'expenses',
        indexes: [
          { key: { tenantId: 1, date: -1 }, name: 'tenantId_1_date_-1' },
          { key: { tenantId: 1, status: 1 }, name: 'tenantId_1_status_1' },
        ],
      },
      {
        name: 'employees',
        indexes: [
          { key: { email: 1 }, unique: true, name: 'email_1' },
          { key: { tenantId: 1, email: 1 }, name: 'tenantId_1_email_1' },
          { key: { tenantId: 1, status: 1 }, name: 'tenantId_1_status_1' },
        ],
      },
      {
        name: 'accountingentries',
        indexes: [
          { key: { tenantId: 1, date: -1 }, name: 'tenantId_1_date_-1' },
          { key: { tenantId: 1, account: 1 }, name: 'tenantId_1_account_1' },
        ],
      },
    ];

    // Créer chaque collection avec ses index
    for (const collectionConfig of collections) {
      try {
        // Vérifier si la collection existe déjà
        const collectionsList = await db.listCollections({ name: collectionConfig.name }).toArray();
        const exists = collectionsList.length > 0;

        if (exists) {
          console.log(`⚠️  Collection '${collectionConfig.name}' existe déjà`);
        } else {
          // Créer la collection (vide pour l'instant)
          await db.createCollection(collectionConfig.name);
          console.log(`✅ Collection '${collectionConfig.name}' créée`);
        }

        // Créer les index
        const collection = db.collection(collectionConfig.name);
        const existingIndexes = await collection.indexes();
        const existingIndexNames = existingIndexes.map((idx: any) => idx.name);

        for (const index of collectionConfig.indexes) {
          try {
            if (existingIndexNames.includes(index.name)) {
              console.log(`   ⚠️  Index '${index.name}' existe déjà sur '${collectionConfig.name}'`);
            } else {
              const indexOptions: any = {
                name: index.name,
              };
              if (index.unique) {
                indexOptions.unique = true;
              }
              await collection.createIndex(index.key, indexOptions);
              console.log(`   ✅ Index '${index.name}' créé sur '${collectionConfig.name}'`);
            }
          } catch (indexError: any) {
            console.log(`   ❌ Erreur lors de la création de l'index '${index.name}': ${indexError.message}`);
          }
        }
      } catch (error: any) {
        console.log(`❌ Erreur lors de la création de '${collectionConfig.name}': ${error.message}`);
      }
    }

    console.log('\n✅ Toutes les collections ont été initialisées avec succès !\n');

    // Afficher la liste des collections créées
    const allCollections = await db.listCollections().toArray();
    console.log('📋 Collections disponibles dans la base de données :');
    allCollections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
createCollections();

