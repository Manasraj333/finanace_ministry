"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"

// Simple mock login since full Auth UI wasn't the main task but is needed for flow
export default function LoginPage() {
    const [identifier, setIdentifier] = useState("")
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
                body: JSON.stringify({ identifier, password })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Login failed')
            } else {
                // Route based on role returned from our MongoDB API
                const role = data.role
                if (['admin', 'super_admin'].includes(role)) {
                    router.push("/admin")
                } else if (role === 'analyst') {
                    router.push("/analyst/applications")
                } else {
                    router.push("/citizen/schemes")
                }
                
                // Add a small delay then refresh to ensure context updates
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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Citizen Login</CardTitle>
                    <CardDescription>Access your benefits and track applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Email, Phone Number, or Aadhaar"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center space-y-2">
                        <div className="text-xs text-muted-foreground">
                            <p>Demo Citizen:</p>
                            <p>citizen@gmail.com / password123</p>
                            <p>Or try Phone / Aadhaar if registered.</p>
                        </div>
                        <div className="border-t pt-2">
                            <a href="/staff-login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                Are you a government official? Login here
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
