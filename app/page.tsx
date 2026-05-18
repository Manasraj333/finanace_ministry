import { MetricCard } from "@/components/metric-card"
import { TrendChart } from "@/components/trend-chart"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { getPublicMetrics } from "@/lib/db/metrics"

export const revalidate = 0

export default async function PublicDashboard() {
    const publicData = await getPublicMetrics()
    const uniqueMetrics = Array.from(new Set(publicData.map(m => m.metric_name)))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartData = publicData.reduce((acc: any[], curr) => {
        const label = `FY${curr.fiscal_year} Q${curr.fiscal_quarter}`

        let existingPoint = acc.find(p => p.label === label)
        if (!existingPoint) {
            existingPoint = { label }
            acc.push(existingPoint)
        }

        existingPoint[curr.metric_name] = curr.value ?? curr.metric_value ?? 0
        return acc
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, []).sort((a: any, b: any) => a.label.localeCompare(b.label))

    const kpis = uniqueMetrics.map(name => {
        const history = publicData.filter(d => d.metric_name === name).sort((a, b) =>
            new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        )

        if (history.length === 0) return null

        const latest = history[0]
        const previous = history[1]

        let trend: "up" | "down" | "neutral" = "neutral"

        const val = latest.value ?? latest.metric_value ?? 0
        const prevVal = previous ? (previous.value ?? previous.metric_value ?? 0) : null

        if (prevVal !== null) {
            if (val > prevVal) trend = "up"
            else if (val < prevVal) trend = "down"
        }

        return {
            name: latest.metric_name,
            value: val,
            unit: (latest.metric_category || latest.metric_type) === 'gdp' || (latest.metric_category || latest.metric_type) === 'inflation' || (latest.metric_category || latest.metric_type) === 'deficit' ? 'Percentage' : 'INR',
            trend,
            date: new Date(latest.recorded_at).toLocaleDateString()
        }
    }).filter(Boolean)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Financial Dashboard
                </h1>
                <p className="text-xl text-muted-foreground">
                    Public transparency report and scheme management.
                </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(kpis as any[]).map((kpi) => (
                    <MetricCard
                        key={kpi.name}
                        title={kpi.name}
                        value={`${kpi.unit === 'INR' ? '₹' : ''}${(kpi.value || 0).toLocaleString()} ${kpi.unit !== 'INR' ? kpi.unit : ''}`}
                        description={`Last updated: ${kpi.date}`}
                        trend={kpi.trend}
                        trendValue={kpi.trend !== "neutral" ? "vs last quarter" : undefined}
                    />
                ))}
                {kpis.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10 border border-dashed rounded-lg">
                        No public metrics available currently.
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <TrendChart
                    title="Historical Performance Trends"
                    description="Fiscal Year Quarterly Performance (Public Data)"
                    data={chartData}
                    xAxisKey="label"
                    lines={uniqueMetrics.map((name, i) => ({
                        key: name,
                        color: `hsl(${210 + (i * 30)}, 70%, 50%)`
                    }))}
                />
            </div>

            <div className="bg-muted/50 p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">Government Data Transparency</h3>
                <p className="text-sm text-muted-foreground">
                    This dashboard displays official financial metrics approved for public release.
                    Data is sourced from the Ministry&apos;s MongoDB datastore.
                </p>
                <div className="mt-4 flex gap-4">
                    <Link href="/login">
                        <Button variant="outline">Staff Login</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
