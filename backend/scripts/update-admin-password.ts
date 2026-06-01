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

// Schéma User simplifié
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

async function updateAdminPassword() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB réussie\n');

    const User = mongoose.model('User', UserSchema);

    const adminEmail = 'admin@admin.fr';
    const newPassword = 'admin123';

    // Trouver l'utilisateur
    const user = await User.findOne({ email: adminEmail.toLowerCase() }).exec();
    
    if (!user) {
      console.log(`❌ L'utilisateur ${adminEmail} n'existe pas.`);
      console.log(`   Exécutez d'abord: npm run create-admin-user\n`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`📝 Mise à jour du mot de passe pour ${adminEmail}...\n`);

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    ).exec();

    console.log(`✅ Mot de passe mis à jour avec succès !\n`);
    console.log('📋 Nouveaux identifiants de connexion :');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${newPassword}`);
    console.log(`\n🔐 Vous pouvez maintenant vous connecter avec ces identifiants.\n`);

    await mongoose.disconnect();
    console.log('✅ Script terminé avec succès !');

  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateAdminPassword();
