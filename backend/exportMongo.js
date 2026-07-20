const mongoose = require('mongoose');
const fs = require('fs');

async function exportCSV() {
  await mongoose.connect('mongodb://localhost:27017/INVOCIA-TN');
  const db = mongoose.connection.db;

  const tenants = await db.collection('tenants').find({}).toArray();

  const headers = 'name,email,status,plan,createdAt\n';
  const rows = tenants.map(t => {
    const date = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '';
    return `${t.name || ''},${t.email || t.adminEmail || ''},${t.status || ''},${t.subscriptionPlan || t.planType || ''},${date}`;
  }).join('\n');

  fs.writeFileSync('C:\\Users\\k\\Desktop\\invocia-platform\\tenants.csv', headers + rows);
  console.log('Done! Preview:');
  console.log(headers + rows);
  await mongoose.disconnect();
}

exportCSV().catch(console.error);
