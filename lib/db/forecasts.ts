import { getDb } from '@/lib/db/client'
import { mapMongoDocs } from '@/lib/db/utils'

export interface Forecast {
    id: string
    metric_name: string
    metric_category?: string
    forecast_date: string
    predicted_value: number
    lower_bound?: number
    upper_bound?: number
    confidence?: number
    model_used?: string
    created_at?: string
}

export async function getForecasts(): Promise<Forecast[]> {
    try {
        const db = await getDb()
        const docs = await db.collection('forecasts')
            .find()
            .sort({ forecast_date: 1 })
            .toArray()
        return mapMongoDocs<Forecast>(docs)
    } catch (error) {
        console.error('Error fetching forecasts:', error)
        return []
    }
}
