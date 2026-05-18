"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Signup failed')
            } else {
                alert("Account created successfully!")
                // Route to schemes page since they are automatically logged in via cookie
                router.push("/citizen/schemes")
                
                setTimeout(() => {
                    router.refresh()
                    window.location.reload()
                }, 100)
            }
        } catch (err) {
            alert('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-slate-50">
            <Card className="w-[400px] border-t-4 border-gov-blue shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gov-navy-900">Citizen Registration</CardTitle>
                    <CardDescription className="text-center">Create an account to access benefits</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-gov-blue hover:bg-gov-blue-dark" disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center bg-muted/20 border-t pt-6">
                    <a href="/login" className="text-sm text-gov-blue hover:underline flex items-center gap-2">
                        Already have an account? Login here
                    </a>
                </CardFooter>
            </Card>
        </div>
    )
}
