const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://admin:manas@cluster0.r8xknhf.mongodb.net/ministry_db?appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Citizen
  await db.collection('users').updateOne(
    { email: 'citizen@ministry.gov' },
    { $set: { password: hashedPassword, full_name: 'Jane Citizen', role: 'public_user', is_active: true } },
    { upsert: true }
  );

  // Analyst
  await db.collection('users').updateOne(
    { email: 'analyst@ministry.gov' },
    { $set: { password: hashedPassword, full_name: 'John Analyst', role: 'analyst', is_active: true } },
    { upsert: true }
  );

  console.log('Fixed users created!');
  await client.close();
}
run().catch(console.error);
