import { ApplicationReview } from "@/components/analyst/application-review"
import { getAllApplications } from "@/lib/db/applications"
import { getActiveSchemes } from "@/lib/db/schemes"
import { getSession } from "@/lib/session"

export const revalidate = 0

async function getApplicationData() {
    const applications = await getAllApplications()
    const activeSchemes = await getActiveSchemes()

    return {
        applications,
        reviewSchemes: activeSchemes.map(s => ({ id: s.id, title: s.title }))
    }
}

export default async function AnalystApplicationsPage() {
    const data = await getApplicationData()
    const session = await getSession()
    const userRole = session?.role || 'analyst'

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gov-navy-900">Application Management</h1>
                <p className="text-muted-foreground mt-1">Review and process citizen applications for government schemes</p>
            </div>

            <ApplicationReview
                applications={data.applications}
                schemes={data.reviewSchemes}
                userRole={userRole}
            />
        </div>
    )
}
