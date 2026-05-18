import { getDb } from './lib/db/client'

async function testConnection() {
    try {
        const db = await getDb()
        const count = await db.collection('users').countDocuments()
        console.log(`MongoDB connection successful. Users collection has ${count} document(s).`)
        process.exit(0)
    } catch (err) {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    }
}

testConnection()
