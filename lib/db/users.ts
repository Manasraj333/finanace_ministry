import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/client'
import { mapMongoDocs } from '@/lib/db/utils'
import type { UserProfile } from '@/components/admin/user-management'
import type { UserRole } from '@/lib/auth/rbac'

export async function getAllUsers(): Promise<UserProfile[]> {
    try {
        const db = await getDb()
        const users = await db.collection('users')
            .find()
            .sort({ created_at: -1 })
            .toArray()

        return mapMongoDocs<UserProfile>(users).map((u) => ({
            ...u,
            full_name: (u.full_name as string | null) ?? null,
            department: (u.department as string | null) ?? null,
        }))
    } catch (error) {
        console.error('Error fetching users:', error)
        return []
    }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
    try {
        const db = await getDb()
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
        return (user?.role as UserRole) ?? null
    } catch {
        return null
    }
}
