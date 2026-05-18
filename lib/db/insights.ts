import { getDb } from '@/lib/db/client'
import { mapMongoDocs } from '@/lib/db/utils'
import type { SeverityLevel } from '@/components/dashboard/insight-panel'

export interface AiInsight {
    id: string
    title: string
    insight: string
    severity: SeverityLevel
    metric_category?: string
    confidence: number
    recommendation?: string
    is_reviewed?: boolean
    created_at: string
}

export async function getRecentInsights(limit = 10): Promise<AiInsight[]> {
    try {
        const db = await getDb()
        const docs = await db.collection('ai_insights')
            .find()
            .sort({ created_at: -1 })
            .limit(limit)
            .toArray()
        return mapMongoDocs<AiInsight>(docs)
    } catch (error) {
        console.error('Error fetching insights:', error)
        return []
    }
}
