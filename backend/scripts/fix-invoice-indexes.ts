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
  mongoUri = mongoUri.replace(/\/[^\/\?]+(\?|$)/, '/DB_INVOCIA$1');
  if (!mongoUri.includes('DB_INVOCIA')) {
    mongoUri = mongoUri.replace(/(mongodb[^\/]*\/\/[^\/]+)\/?(\?|$)/, '$1/DB_INVOCIA$2');
  }
}

console.log(`🔗 Connexion à MongoDB : ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

async function fixInvoiceIndexes() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB réussie\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('🔧 Correction des index pour les factures et avoirs...\n');

    // Collection invoices
    const invoicesCollection = db.collection('invoices');
    
    // Supprimer l'ancien index unique global sur 'number'
    try {
      await invoicesCollection.dropIndex('number_1');
      console.log('✅ Index unique global "number_1" supprimé de la collection invoices');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  L\'index "number_1" n\'existe pas (déjà supprimé ou jamais créé)');
      } else {
        console.warn('⚠️  Erreur lors de la suppression de l\'index "number_1":', error.message);
      }
    }

    // Créer l'index unique composé { tenantId: 1, number: 1 }
    // Supprimer l'index existant s'il n'est pas unique
    try {
      await invoicesCollection.dropIndex('tenantId_1_number_1');
      console.log('ℹ️  Ancien index "tenantId_1_number_1" supprimé');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  L\'index "tenantId_1_number_1" n\'existe pas encore');
      } else {
        console.warn('⚠️  Erreur lors de la suppression de l\'ancien index:', error.message);
      }
    }

    // Créer le nouvel index unique
    try {
      await invoicesCollection.createIndex(
        { tenantId: 1, number: 1 },
        { unique: true, name: 'tenantId_1_number_1' }
      );
      console.log('✅ Index unique composé "tenantId_1_number_1" créé pour invoices');
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de l\'index:', error.message);
      throw error;
    }

    console.log('');

    // Collection creditnotes
    const creditnotesCollection = db.collection('creditnotes');
    
    // Supprimer l'ancien index unique global sur 'number'
    try {
      await creditnotesCollection.dropIndex('number_1');
      console.log('✅ Index unique global "number_1" supprimé de la collection creditnotes');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  L\'index "number_1" n\'existe pas (déjà supprimé ou jamais créé)');
      } else {
        console.warn('⚠️  Erreur lors de la suppression de l\'index "number_1":', error.message);
      }
    }

    // Créer l'index unique composé { tenantId: 1, number: 1 }
    // Supprimer l'index existant s'il n'est pas unique
    try {
      await creditnotesCollection.dropIndex('tenantId_1_number_1');
      console.log('ℹ️  Ancien index "tenantId_1_number_1" supprimé');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  L\'index "tenantId_1_number_1" n\'existe pas encore');
      } else {
        console.warn('⚠️  Erreur lors de la suppression de l\'ancien index:', error.message);
      }
    }

    // Créer le nouvel index unique
    try {
      await creditnotesCollection.createIndex(
        { tenantId: 1, number: 1 },
        { unique: true, name: 'tenantId_1_number_1' }
      );
      console.log('✅ Index unique composé "tenantId_1_number_1" créé pour creditnotes');
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de l\'index:', error.message);
      throw error;
    }

    console.log('\n✅ Correction des index terminée avec succès !\n');

    await mongoose.disconnect();
    console.log('✅ Script terminé.');

  } catch (error: any) {
    console.error('❌ Erreur lors de la correction des index:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixInvoiceIndexes();
