const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017/INVOCIA-TN';
const TENANT_ID = '69ca41f139c12b72252a7e49';

const clients = [
  { name: 'Tech Solutions SARL', email: 'contact@techsolutions.tn', address: 'Tunis, Tunisie' },
  { name: 'Groupe Bâtiment TN', email: 'info@batimenttn.tn', address: 'Sfax, Tunisie' },
  { name: 'Alpha Consulting', email: 'admin@alphaconsulting.tn', address: 'Sousse, Tunisie' },
  { name: 'MediCare Clinic', email: 'contact@medicare.tn', address: 'Monastir, Tunisie' },
  { name: 'Green Energy Co', email: 'info@greenenergy.tn', address: 'Bizerte, Tunisie' },
];

const expenseCategories = [
  { category: 'Loyer', supplier: 'Agence Immobilière TN', amounts: [1200, 1200, 1200] },
  { category: 'Marketing', supplier: 'Digital Agency', amounts: [500, 800, 300] },
  { category: 'Transport', supplier: 'Transport Express', amounts: [150, 200, 180] },
  { category: 'Fournitures de bureau', supplier: 'Office Plus', amounts: [250, 180, 320] },
  { category: 'Informatique', supplier: 'Tech Store TN', amounts: [600, 450, 900] },
  { category: 'Formation', supplier: 'Centre Formation Pro', amounts: [800, 0, 1200] },
  { category: 'Téléphone', supplier: 'Tunisie Telecom', amounts: [120, 120, 120] },
  { category: 'Electricité', supplier: 'STEG', amounts: [200, 180, 220] },
];

async function seed() {
  const mongoClient = new MongoClient(MONGO_URI);
  
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB!');
    
    const db = mongoClient.db('INVOCIA-TN');
    const invoicesCol = db.collection('invoices');
    const expensesCol = db.collection('expenses');
    const clientsCol = db.collection('clients');

    // Clean old seed data
    await invoicesCol.deleteMany({ tenantId: TENANT_ID, notes: 'SEED_DATA' });
    await expensesCol.deleteMany({ tenantId: TENANT_ID, notes: 'SEED_DATA' });
    await clientsCol.deleteMany({ tenantId: TENANT_ID, notes: 'SEED_DATA' });
    console.log('Old seed data cleaned!');

    // Create clients
    const clientDocs = clients.map(c => ({
      _id: new ObjectId(),
      ...c,
      tenantId: TENANT_ID,
      notes: 'SEED_DATA',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await clientsCol.insertMany(clientDocs);
    console.log(`${clientDocs.length} clients created!`);

    // Create invoices for last 12 months
    const invoiceDocs = [];
    let invoiceNum = 1000;

    for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
      const invoicesPerMonth = Math.floor(Math.random() * 4) + 2; // 2-5 per month
      
      for (let i = 0; i < invoicesPerMonth; i++) {
        const client = clientDocs[Math.floor(Math.random() * clientDocs.length)];
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        date.setDate(Math.floor(Math.random() * 25) + 1);
        
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + 30);

        const amountHT = Math.floor(Math.random() * 8000) + 500;
        const amountTVA = Math.round(amountHT * 0.19);
        const amountTTC = amountHT + amountTVA;

        // Older invoices are more likely paid
        const rand = Math.random();
        let status = 'paid';
        if (monthsAgo < 2) {
          status = rand < 0.4 ? 'paid' : rand < 0.7 ? 'pending' : rand < 0.9 ? 'validated' : 'overdue';
        } else if (monthsAgo < 4) {
          status = rand < 0.7 ? 'paid' : rand < 0.9 ? 'pending' : 'overdue';
        }

        invoiceDocs.push({
          _id: new ObjectId(),
          number: `FA-SEED-${String(invoiceNum++).padStart(4, '0')}`,
          date,
          dueDate,
          clientId: client._id.toString(),
          client: client.name,
          clientAddress: client.address,
          clientEmail: client.email,
          tenantId: TENANT_ID,
          items: [{
            description: 'Prestation de service',
            quantity: 1,
            unitPrice: amountHT,
            tva: 19,
            total: amountTTC,
          }],
          amountHT,
          amountTVA,
          amountTTC,
          timbreFiscal: 1,
          withholdingAmount: 0,
          netAPayer: amountTTC + 1,
          currency: 'TND',
          status,
          notes: 'SEED_DATA',
          createdAt: date,
          updatedAt: date,
        });
      }
    }

    await invoicesCol.insertMany(invoiceDocs);
    console.log(`${invoiceDocs.length} invoices created!`);

    // Create expenses for last 12 months
    const expenseDocs = [];
    for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
      for (const expCat of expenseCategories) {
        const amount = expCat.amounts[monthsAgo % expCat.amounts.length];
        if (amount === 0) continue;

        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        date.setDate(Math.floor(Math.random() * 25) + 1);

        const amountHT = amount;
        const amountTVA = Math.round(amountHT * 0.19);
        const amountTTC = amountHT + amountTVA;

        expenseDocs.push({
          _id: new ObjectId(),
          date,
          supplier: expCat.supplier,
          category: expCat.category,
          amountHT,
          amountTVA,
          amountTTC,
          currency: 'TND',
          status: 'verified',
          tenantId: TENANT_ID,
          notes: 'SEED_DATA',
          createdAt: date,
          updatedAt: date,
        });
      }
    }

    await expensesCol.insertMany(expenseDocs);
    console.log(`${expenseDocs.length} expenses created!`);

    // Summary
    const totalRevenue = invoiceDocs.filter(i => i.status === 'paid').reduce((s, i) => s + i.amountTTC, 0);
    const totalExpenses = expenseDocs.reduce((s, e) => s + e.amountTTC, 0);
    console.log('\n========== SEED COMPLETE ==========');
    console.log(`Clients:   ${clientDocs.length}`);
    console.log(`Invoices:  ${invoiceDocs.length} (${invoiceDocs.filter(i=>i.status==='paid').length} paid)`);
    console.log(`Expenses:  ${expenseDocs.length}`);
    console.log(`Revenue:   ${totalRevenue.toLocaleString()} DT`);
    console.log(`Expenses:  ${totalExpenses.toLocaleString()} DT`);
    console.log(`Profit:    ${(totalRevenue - totalExpenses).toLocaleString()} DT`);
    console.log('====================================');
    console.log('Refresh your Cockpit de Gestion!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoClient.close();
  }
}

seed();
