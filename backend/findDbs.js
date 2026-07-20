const mongoose = require('mongoose');

async function findDatabases() {
  await mongoose.connect('mongodb://localhost:27017');
  const db = mongoose.connection.db;
  const admin = db.admin();
  const dbs = await admin.listDatabases();
  console.log('Databases found:');
  dbs.databases.forEach(d => console.log(' -', d.name));
  await mongoose.disconnect();
}

findDatabases().catch(console.error);
