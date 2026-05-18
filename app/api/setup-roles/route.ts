import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getSession } from '@/lib/session'

// This is a special dev tool helper to force-fix roles
export async function GET() {
    try {
        const session = await getSession()
        const client = await clientPromise
        const db = client.db()

        const updates = [
            { email: 'jessemonu999@gmail.com', role: 'admin' },
            { email: 'jessemonu333@gmail.com', role: 'analyst' }
        ]

        const results = []

        for (const update of updates) {
            // Update the role by email directly in the users collection
            const result = await db.collection('users').updateOne(
                { email: update.email },
                { $set: { role: update.role } }
            )

            if (result.modifiedCount > 0) {
                results.push(`Successfully updated ${update.email} to ${update.role}`)
            } else if (result.matchedCount > 0) {
                results.push(`User ${update.email} already has the role ${update.role}`)
            } else {
                results.push(`Failed to update ${update.email}: User not found`)
            }
        }

        return NextResponse.json({
            message: "Role update attempt complete.",
            results
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update roles" }, { status: 500 })
    }
}
