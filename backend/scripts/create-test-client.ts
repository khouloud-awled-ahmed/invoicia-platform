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
  subscriptionStatus: { type: String, default: 'ACTIVE' },
  planType: { type: String, default: 'CUSTOM' },
  modules: { type: Array, default: ['SALES', 'PURCHASES'] },
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

async function createTestClient() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB réussie\n');

    const Tenant = mongoose.model('Tenant', TenantSchema);
    const User = mongoose.model('User', UserSchema);

    const clientEmail = 'client@test.com';
    const clientPassword = 'client123';
    const clientName = 'Client Test';
    const companyName = 'Entreprise Test';
    const siret = '12345678901234';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: clientEmail.toLowerCase() }).exec();
    if (existingUser) {
      console.log(`⚠️  L'utilisateur ${clientEmail} existe déjà.`);
      console.log(`   ID: ${existingUser._id}`);
      console.log(`   Rôle: ${existingUser.role}`);
      console.log(`   Tenant ID: ${existingUser.tenantId || 'Aucun'}\n`);
      
      await mongoose.disconnect();
      console.log('✅ Script terminé.');
      console.log('\n📋 Identifiants de connexion :');
      console.log(`   Email: ${clientEmail}`);
      console.log(`   Mot de passe: ${clientPassword}`);
      return;
    }

    console.log('📝 Création du compte client de test...\n');

    // Créer le Tenant d'abord
    let tenant = await Tenant.findOne({ siret }).exec();
    if (!tenant) {
      tenant = new Tenant({
        name: companyName,
        businessName: companyName,
        siret: siret,
        email: clientEmail.toLowerCase(),
        adminEmail: clientEmail.toLowerCase(),
        status: 'active',
        subscriptionPlan: 'essential',
        pack: 'essential',
        subscriptionStatus: 'ACTIVE',
        planType: 'CUSTOM',
        modules: ['SALES', 'PURCHASES', 'PROJECTS'],
        currentUsers: 0,
        maxUsers: 10,
        settings: {
          paymentMethods: [],
        },
      });
      await tenant.save();
      console.log(`✅ Tenant créé : ${companyName}`);
      console.log(`   ID: ${tenant._id}\n`);
    } else {
      console.log(`✅ Tenant existant trouvé : ${companyName}`);
      console.log(`   ID: ${tenant._id}\n`);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(clientPassword, 10);

    // Créer l'utilisateur TENANT_ADMIN
    const user = new User({
      name: clientName,
      email: clientEmail.toLowerCase(),
      password: hashedPassword,
      role: 'TENANT_ADMIN',
      tenantId: tenant._id.toString(),
      isActive: true,
    });

    await user.save();
    console.log(`✅ Utilisateur TENANT_ADMIN créé : ${clientEmail}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Tenant ID: ${user.tenantId}\n`);

    // Mettre à jour le compteur d'utilisateurs du tenant
    await Tenant.updateOne(
      { _id: tenant._id },
      { $inc: { currentUsers: 1 } }
    ).exec();

    await mongoose.disconnect();
    console.log('✅ Script terminé avec succès !');
    console.log('\n📋 Identifiants de connexion :');
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Mot de passe: ${clientPassword}`);
    console.log(`   Rôle: TENANT_ADMIN`);
    console.log(`   Entreprise: ${companyName}`);
    console.log(`\n🔐 Vous pouvez maintenant vous connecter avec ces identifiants.\n`);

  } catch (error: any) {
    console.error('❌ Erreur lors de la création du compte client:', error);
    if (error.code === 11000) {
      console.error('   Cette erreur indique qu\'un utilisateur ou tenant avec ces identifiants existe déjà.');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTestClient();
