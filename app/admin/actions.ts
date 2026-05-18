'use server'

import clientPromise from "@/lib/mongodb"
import { revalidatePath } from "next/cache"
import { UserRole } from "@/lib/auth/rbac"
import bcryptjs from "bcryptjs"
import { getSession } from "@/lib/session"
import { ObjectId } from "mongodb"

export async function createUser(data: { email: string; fullName: string; role: UserRole; password?: string }) {
    try {
        const session = await getSession()
        if (!session || !['admin', 'super_admin'].includes(session.role)) {
            throw new Error("Unauthorized")
        }

        const client = await clientPromise
        const db = client.db()

        const existingUser = await db.collection('users').findOne({ email: data.email })
        if (existingUser) {
            throw new Error("User already exists")
        }

        const hashedPassword = await bcryptjs.hash(data.password || 'TemporaryPassword123!', 10)

        const result = await db.collection('users').insertOne({
            email: data.email,
            password: hashedPassword,
            full_name: data.fullName,
            role: data.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })

        revalidatePath('/admin')
        return { success: true, userId: result.insertedId.toString() }

    } catch (error: unknown) {
        console.error("User creation failed:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to create user"
        throw new Error(errorMessage)
    }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    try {
        const session = await getSession()
        if (!session || !['admin', 'super_admin'].includes(session.role)) {
            throw new Error("Unauthorized")
        }

        const client = await clientPromise
        const db = client.db()

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { role: newRole, updated_at: new Date().toISOString() } }
        )

        revalidatePath('/admin')
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
    try {
        const session = await getSession()
        if (!session || !['admin', 'super_admin'].includes(session.role)) {
            throw new Error("Unauthorized")
        }

        const client = await clientPromise
        const db = client.db()

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { is_active: isActive, updated_at: new Date().toISOString() } }
        )

        revalidatePath('/admin')
    } catch (error: any) {
        throw new Error(error.message)
    }
}
