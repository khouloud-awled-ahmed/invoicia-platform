const mongoose = require('mongoose');

async function findTenants() {
  const dbs = ['DB_INVOCIA', 'INVOCIA-TN', 'INVOICIA-TN'];
  
  for (const dbName of dbs) {
    await mongoose.connect(`mongodb://localhost:27017/${dbName}`);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`\n[${dbName}] collections:`, collections.map(c => c.name));
    await mongoose.disconnect();
  }
}

findTenants().catch(console.error);
