import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/INVOCIA-TN';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true },
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
  mfaEnabled: { type: Boolean, default: false },
}, { timestamps: true });

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to INVOCIA-TN');

  const User = mongoose.model('User', UserSchema);

  // Check all users
  const allUsers = await User.find({}).lean();
  console.log(`📋 Total users in INVOCIA-TN: ${allUsers.length}`);
  allUsers.forEach(u => console.log(`  - ${(u as any).email} | role: ${(u as any).role}`));

  const hash = await bcrypt.hash('admin123', 10);

  const existing = await User.findOne({ email: 'admin@admin.fr' });
  if (existing) {
    await User.updateOne({ email: 'admin@admin.fr' }, { $set: { password: hash, isActive: true } });
    console.log('✅ Password updated for admin@admin.fr in INVOCIA-TN');
  } else {
    await User.create({
      name: 'Admin',
      email: 'admin@admin.fr',
      password: hash,
      role: 'PLATFORM_ADMIN',
      isActive: true,
      mfaEnabled: false,
    });
    console.log('✅ Admin user CREATED in INVOCIA-TN');
  }

  console.log('📋 Login: admin@admin.fr / admin123');
  await mongoose.disconnect();
}

run().catch(console.error);
