"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { UserRole } from '@/lib/auth/rbac'

export interface CustomUser {
    id: string
    email: string
}

interface AuthContextType {
    user: CustomUser | null
    session: any | null
    role: UserRole | null
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<CustomUser | null>(null)
    const [role, setRole] = useState<UserRole | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const initializeAuth = async () => {
            try {
                const res = await fetch('/api/auth/me')
                if (!res.ok) throw new Error('Failed to fetch session')
                
                const data = await res.json()
                if (!isMounted) return

                setUser(data.user)
                setRole(data.role || 'public_user')
                setIsLoading(false)
            } catch (error) {
                console.error('❌ Auth initialization error:', error)
                if (isMounted) {
                    setUser(null)
                    setRole('public_user')
                    setIsLoading(false)
                }
            }
        }

        initializeAuth()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, session: null, role, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
