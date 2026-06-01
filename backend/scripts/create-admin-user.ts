import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
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

// Schémas Mongoose (simplifiés pour le script)
const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  siret: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: String,
  adminEmail: String,
  status: { type: String, default: 'active' },
  subscriptionPlan: { type: String, default: 'essential' },
  pack: { type: String, default: 'essential' },
  currentUsers: { type: Number, default: 0 },
  maxUsers: { type: Number, default: 10 },
  settings: {
    type: {
      paymentMethods: { type: Array, default: [] },
    },
    default: { paymentMethods: [] },
  },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'USER'],
    default: 'USER',
  },
  tenantId: { type: String, ref: 'Tenant' },
  avatar: String,
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB réussie\n');

    const Tenant = mongoose.model('Tenant', TenantSchema);
    const User = mongoose.model('User', UserSchema);

    const adminEmail = 'admin@admin.fr';
    const adminPassword = 'admin123';
    const adminName = 'Administrateur Plateforme';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() }).exec();
    if (existingUser) {
      console.log(`⚠️  L'utilisateur ${adminEmail} existe déjà.`);
      console.log(`   ID: ${existingUser._id}`);
      console.log(`   Rôle: ${existingUser.role}`);
      console.log(`   Tenant ID: ${existingUser.tenantId || 'Aucun (PLATFORM_ADMIN)'}\n`);
      
      // Mettre à jour le rôle si ce n'est pas déjà PLATFORM_ADMIN
      if (existingUser.role !== 'PLATFORM_ADMIN' || existingUser.tenantId) {
        console.log('🔄 Mise à jour du rôle vers PLATFORM_ADMIN et suppression du tenantId...');
        await User.updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              role: 'PLATFORM_ADMIN'
            },
            $unset: {
              tenantId: ""
            }
          }
        ).exec();
        console.log('✅ Rôle mis à jour vers PLATFORM_ADMIN et tenantId supprimé\n');
      }
      
      await mongoose.disconnect();
      console.log('✅ Script terminé.');
      return;
    }

    console.log('📝 Création de l\'utilisateur PLATFORM_ADMIN...\n');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Créer l'utilisateur PLATFORM_ADMIN (sans tenantId)
    const user = new User({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'PLATFORM_ADMIN',
      // Ne pas définir tenantId pour PLATFORM_ADMIN
      isActive: true,
    });

    await user.save();
    console.log(`✅ Utilisateur PLATFORM_ADMIN créé : ${adminEmail}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Tenant ID: Aucun (Administrateur de la plateforme)\n`);

    await mongoose.disconnect();
    console.log('✅ Script terminé avec succès !');
    console.log('\n📋 Identifiants de connexion :');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log(`\n🔐 Vous pouvez maintenant vous connecter avec ces identifiants.\n`);

  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
    if (error.code === 11000) {
      console.error('   Cette erreur indique qu\'un utilisateur ou tenant avec ces identifiants existe déjà.');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUser();
