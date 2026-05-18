import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const db = await getDb()
        const metricsCount = await db.collection('financial_metrics').countDocuments()
        const metrics = await db.collection('financial_metrics').find().toArray()
        
        return NextResponse.json({
            databaseName: db.databaseName,
            metricsCount,
            metrics,
            envUri: process.env.MONGODB_URI ? 'EXISTS' : 'MISSING'
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack })
    }
}
