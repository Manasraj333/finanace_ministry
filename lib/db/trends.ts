import { getDb } from '@/lib/db/client'

export interface TrendResultInput {
    metric_name: string
    trend_direction: string
    slope?: number
    confidence?: number
    explanation?: string
    data_points_analyzed?: number
    metric_category?: string
    period_start?: string
    period_end?: string
}

export async function insertTrendResult(input: TrendResultInput): Promise<{ success: boolean; id?: string }> {
    try {
        const db = await getDb()
        const result = await db.collection('trend_results').insertOne({
            ...input,
            created_at: new Date().toISOString(),
        })
        return { success: true, id: result.insertedId.toString() }
    } catch (error) {
        console.error('Error inserting trend result:', error)
        return { success: false }
    }
}
