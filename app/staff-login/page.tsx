"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, UserCircle } from "lucide-react"

export default function StaffLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Authentication failed')
            } else {
                // Check role and redirect
                const role = data.role
                if (['admin', 'super_admin'].includes(role)) {
                    router.push("/admin")
                } else if (role === 'analyst') {
                    router.push("/analyst/applications")
                } else {
                    // Not a staff member
                    alert("Unauthorized access. Staff roles only.")
                    fetch('/api/auth/logout', { method: 'POST' })
                    router.push("/login")
                    return
                }

                setTimeout(() => {
                    router.refresh()
                    window.location.reload()
                }, 100)
            }
        } catch (error) {
            alert('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-slate-50">
            <Card className="w-[400px] border-gov-navy-900 border-t-4 shadow-lg">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-gov-navy-50 rounded-full flex items-center justify-center">
                            <Lock className="h-6 w-6 text-gov-navy-900" />
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl font-heading text-gov-navy-900">Internal Portal</CardTitle>
                    <CardDescription className="text-center">Restricted access for authorized staff only</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Official Email ID</Label>
                            <Input
                                type="email"
                                placeholder="name@gov.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Secure Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-gov-navy-900 hover:bg-gov-navy-800" disabled={loading}>
                            {loading ? "Authenticating..." : "Secure Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 bg-muted/20 border-t pt-6">
                    <p className="text-xs text-muted-foreground text-center">
                        Unauthorized access is prohibited and monitored.
                    </p>
                    <a href="/login" className="text-sm text-gov-blue hover:underline flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        Go to Citizen Login
                    </a>
                </CardFooter>
            </Card>
        </div>
    )
}
