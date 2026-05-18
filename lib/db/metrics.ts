import { getDb } from '@/lib/db/client'
import { mapMongoDocs } from '@/lib/db/utils'

export interface FinancialMetric {
    id: string
    metric_name: string
    metric_category: string
    value: number
    unit?: string
    fiscal_year?: number
    fiscal_quarter?: number
    recorded_at: string
    is_public?: boolean
    data_source?: string
    metric_value?: number
    metric_type?: string
}

export async function getPublicMetrics(): Promise<FinancialMetric[]> {
    try {
        const db = await getDb()
        const docs = await db.collection('financial_metrics')
            .find({ is_public: true })
            .sort({ recorded_at: 1 })
            .toArray()
        return mapMongoDocs<FinancialMetric>(docs)
    } catch (error) {
        console.error('Error fetching public metrics:', error)
        return []
    }
}

export async function getMetricsSince(sinceIso: string): Promise<FinancialMetric[]> {
    try {
        const db = await getDb()
        const docs = await db.collection('financial_metrics')
            .find({ recorded_at: { $gte: sinceIso } })
            .sort({ recorded_at: 1 })
            .toArray()
        return mapMongoDocs<FinancialMetric>(docs)
    } catch (error) {
        console.error('Error fetching metrics:', error)
        return []
    }
}

export async function getMetricNames(): Promise<string[]> {
    try {
        const db = await getDb()
        const names = await db.collection('financial_metrics').distinct('metric_name')
        return names.filter(Boolean).sort()
    } catch (error) {
        console.error('Error fetching metric names:', error)
        return []
    }
}

export async function getMetricsByName(metricName: string): Promise<FinancialMetric[]> {
    try {
        const db = await getDb()
        const docs = await db.collection('financial_metrics')
            .find({ metric_name: metricName })
            .sort({ recorded_at: 1 })
            .toArray()
        return mapMongoDocs<FinancialMetric>(docs)
    } catch (error) {
        console.error('Error fetching metrics by name:', error)
        return []
    }
}
