/**
 * Seeds MongoDB with sample financial metrics, insights, and demo users.
 * Run: npm run seed
 */
import bcrypt from 'bcryptjs'
import { getDb } from '../lib/db/client'

async function seed() {
    const db = await getDb()

    const usersCount = await db.collection('users').countDocuments()
    if (usersCount === 0) {
        const password = await bcrypt.hash('password123', 10)
        await db.collection('users').insertMany([
            {
                email: 'citizen@gmail.com',
                password,
                full_name: 'Demo Citizen',
                role: 'public_user',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                email: 'analyst@ministry.gov',
                password,
                full_name: 'Demo Analyst',
                role: 'analyst',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                email: 'admin@ministry.gov',
                password,
                full_name: 'Demo Admin',
                role: 'admin',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ])
        console.log('Seeded demo users (password: password123)')
    }

    const metricsCount = await db.collection('financial_metrics').countDocuments()
    if (metricsCount === 0) {
        const metrics = []
        const now = Date.now()
        for (let i = 90; i >= 0; i--) {
            const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString()
            const month = new Date(date).getMonth() + 1
            const quarter = month <= 3 ? 4 : month <= 6 ? 1 : month <= 9 ? 2 : 3
            metrics.push({
                metric_name: 'Daily Tax Revenue',
                metric_category: 'revenue',
                value: 8500000000 + Math.random() * 2000000000,
                unit: 'INR',
                fiscal_year: 2025,
                fiscal_quarter: quarter,
                recorded_at: date,
                is_public: true,
                data_source: 'Central Board of Direct Taxes',
            })
            metrics.push({
                metric_name: 'Daily Government Expenditure',
                metric_category: 'expenditure',
                value: 7200000000 + Math.random() * 1800000000,
                unit: 'INR',
                fiscal_year: 2025,
                fiscal_quarter: quarter,
                recorded_at: date,
                is_public: true,
                data_source: 'Controller General of Accounts',
            })
        }
        metrics.push(
            { metric_name: 'GDP Growth Rate', metric_category: 'gdp', value: 7.2, unit: 'Percentage', fiscal_year: 2025, fiscal_quarter: 1, recorded_at: new Date(now - 270 * 86400000).toISOString(), is_public: true, data_source: 'Ministry of Statistics' },
            { metric_name: 'GDP Growth Rate', metric_category: 'gdp', value: 7.8, unit: 'Percentage', fiscal_year: 2025, fiscal_quarter: 3, recorded_at: new Date(now - 90 * 86400000).toISOString(), is_public: true, data_source: 'Ministry of Statistics' },
        )
        await db.collection('financial_metrics').insertMany(metrics)
        console.log(`Seeded ${metrics.length} financial metrics`)
    }

    const insightsCount = await db.collection('ai_insights').countDocuments()
    if (insightsCount === 0) {
        await db.collection('ai_insights').insertMany([
            {
                title: 'Revenue Growth Accelerating',
                insight: 'Tax revenue has increased 12% quarter-over-quarter, exceeding projections.',
                severity: 'low',
                metric_category: 'revenue',
                confidence: 85,
                is_reviewed: false,
                created_at: new Date().toISOString(),
            },
            {
                title: 'Expenditure Spike Detected',
                insight: 'Government expenditure increased 18% in the last 30 days, primarily in infrastructure.',
                severity: 'high',
                metric_category: 'expenditure',
                confidence: 92,
                is_reviewed: false,
                created_at: new Date().toISOString(),
            },
        ])
        console.log('Seeded AI insights')
    }

    console.log('MongoDB seed complete.')
    process.exit(0)
}

seed().catch((err) => {
    console.error(err)
    process.exit(1)
})
