import { UserManagement } from "@/components/admin/user-management"
import { SchemeManagement } from "@/components/admin/scheme-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllSchemes } from "@/lib/db/schemes"
import { ApplicationReview } from "@/components/analyst/application-review"
import { getAllApplications } from "@/lib/db/applications"
import { getActiveSchemes } from "@/lib/db/schemes"
import { updateUserRole, toggleUserActive, createUser } from "@/app/admin/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { getAllUsers } from "@/lib/db/users"

export const revalidate = 0

async function getAdminData() {
    const users = await getAllUsers()
    const schemes = await getAllSchemes()
    const applications = await getAllApplications()
    const activeSchemes = await getActiveSchemes()

    return {
        users,
        schemes,
        applications,
        reviewSchemes: activeSchemes.map(s => ({ id: s.id, title: s.title }))
    }
}

export default async function AdminPage() {
    const data = await getAdminData()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gov-navy-900">Admin Console</h1>
                <p className="text-muted-foreground mt-1">System management and final approvals</p>
            </div>

            <Tabs defaultValue="approvals" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="approvals">Approvals & Review</TabsTrigger>
                    <TabsTrigger value="schemes">Schemes</TabsTrigger>
                    <TabsTrigger value="workshop">Staff Workshop</TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                </TabsList>

                <TabsContent value="approvals" className="space-y-4">
                    <div className="bg-card rounded-lg border p-1">
                        <ApplicationReview
                            applications={data.applications}
                            schemes={data.reviewSchemes}
                            userRole="admin"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="schemes" className="space-y-4">
                    <SchemeManagement schemes={data.schemes} />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <UserManagement
                        users={data.users}
                        onUpdateRole={updateUserRole}
                        onToggleActive={toggleUserActive}
                        onCreateUser={createUser}
                    />
                </TabsContent>

                <TabsContent value="workshop" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Internal Workshop</CardTitle>
                            <CardDescription>Internal HR and Financial Services for Ministry Staff</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
                            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground italic underline">Coming Soon: Leave Applications & Salary Checks</h3>
                            <p className="text-sm text-muted-foreground mt-2">Integrating internal ministry HR systems...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
