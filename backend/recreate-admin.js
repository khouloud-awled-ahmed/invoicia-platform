const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/INVOCIA-TN');
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Find existing tenant
  const tenant = await db.collection('tenants').findOne({});
  console.log('Found tenant:', tenant?.name, tenant?._id);

  const hash = await bcrypt.hash('Admin123456', 10);

  const result = await db.collection('users').updateOne(
    { email: 'admin@techcorp.tn' },
    {
      $set: {
        email: 'admin@techcorp.tn',
        password: hash,
        name: 'Ahmed Ben Ali',
        role: 'TENANT_ADMIN',
        isActive: true,
        tenantId: tenant?._id?.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    { upsert: true }
  );

  console.log('Result:', result);
  console.log('✅ Account admin@techcorp.tn recreated with password Admin123456');
  await mongoose.disconnect();
}

main().catch(console.error);