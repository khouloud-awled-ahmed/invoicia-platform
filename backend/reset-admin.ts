import mongoose from 'mongoose';

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/INVOCIA-TN');
  
  const result = await (mongoose.connection.db as any)
    .collection('tenants')
    .updateMany(
      {},
      { $set: { modules: ['SALES', 'PURCHASES', 'PROJECTS', 'HR', 'ACCOUNTING'] } }
    );
  
  console.log('Tenants updated:', result.modifiedCount);
  await mongoose.disconnect();
  process.exit(0);
}
fix();