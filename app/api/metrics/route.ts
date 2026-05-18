import { NextRequest, NextResponse } from 'next/server'
import { getMetricNames, getMetricsByName } from '@/lib/db/metrics'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        const metricName = request.nextUrl.searchParams.get('metric_name')

        if (metricName) {
            const session = await getSession()
            const role = session?.role
            const isStaff = role && ['analyst', 'admin', 'super_admin'].includes(role)

            if (!isStaff) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            const metrics = await getMetricsByName(metricName)
            return NextResponse.json({ data: metrics })
        }

        const names = await getMetricNames()
        return NextResponse.json({ data: names })
    } catch (error) {
        console.error('Metrics API error:', error)
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }
}
