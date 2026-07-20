const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/invoicia';

async function checkCollections() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections found:');
  collections.forEach(c => console.log(' -', c.name));
  await mongoose.disconnect();
}

checkCollections().catch(console.error);
