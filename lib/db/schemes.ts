import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Scheme, SchemeWithStats, CreateSchemeInput, UpdateSchemeInput } from '@/lib/types/schemes'
import { getSession } from '@/lib/session'

const mapMongoToScheme = (doc: any): Scheme => {
    return {
        ...doc,
        id: doc._id.toString(),
        _id: undefined
    } as Scheme
}

/**
 * Get all active schemes (public access)
 */
export async function getActiveSchemes(): Promise<Scheme[]> {
    try {
        const client = await clientPromise
        const db = client.db()
        const schemes = await db.collection('schemes')
            .find({ status: 'active' })
            .sort({ created_at: -1 })
            .toArray()

        return schemes.map(mapMongoToScheme)
    } catch (error) {
        console.error('Error fetching active schemes:', error)
        return []
    }
}

/**
 * Get all schemes (admin only - includes drafts and inactive)
 */
export async function getAllSchemes(): Promise<SchemeWithStats[]> {
    try {
        const client = await clientPromise
        const db = client.db()
        
        const schemesData = await db.collection('schemes')
            .find()
            .sort({ created_at: -1 })
            .toArray()

        const allStatuses = await db.collection('scheme_applications')
            .find({}, { projection: { scheme_id: 1, status: 1 } })
            .toArray()

        const schemes = schemesData.map(mapMongoToScheme)

        const schemesWithStats: SchemeWithStats[] = schemes.map(scheme => {
            const stats = allStatuses.filter(s => s.scheme_id === scheme.id)

            return {
                ...scheme,
                application_count: stats.length,
                pending_count: stats.filter(s => s.status === 'pending').length,
                under_review_count: stats.filter(s => s.status === 'under_review').length,
                forwarded_count: stats.filter(s => s.status === 'forwarded_to_admin').length,
                approved_count: stats.filter(s => s.status === 'approved').length
            }
        })

        return schemesWithStats
    } catch (error) {
        console.error('Error fetching all schemes:', error)
        return []
    }
}

/**
 * Get a single scheme by ID
 */
export async function getSchemeById(id: string): Promise<Scheme | null> {
    try {
        const client = await clientPromise
        const db = client.db()
        const doc = await db.collection('schemes').findOne({ _id: new ObjectId(id) })
        if (!doc) return null
        return mapMongoToScheme(doc)
    } catch (error) {
        console.error('Error fetching scheme:', error)
        return null
    }
}

/**
 * Create a new scheme (admin only)
 */
export async function createScheme(input: CreateSchemeInput): Promise<{ data: Scheme | null; error: { message: string; code?: string } | null }> {
    try {
        const session = await getSession()
        const client = await clientPromise
        const db = client.db()

        const newScheme = {
            ...input,
            created_by: session?.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const result = await db.collection('schemes').insertOne(newScheme)
        const created = await db.collection('schemes').findOne({ _id: result.insertedId })
        
        return { data: mapMongoToScheme(created), error: null }
    } catch (error: any) {
        console.error('Error creating scheme:', error)
        return { data: null, error: { message: error.message || 'Error creating scheme' } }
    }
}

/**
 * Update an existing scheme (admin only)
 */
export async function updateScheme(input: UpdateSchemeInput): Promise<{ data: Scheme | null; error: { message: string; code?: string } | null }> {
    try {
        const { id, ...updates } = input
        const client = await clientPromise
        const db = client.db()

        const result = await db.collection('schemes').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...updates, updated_at: new Date().toISOString() } },
            { returnDocument: 'after' }
        )

        if (!result) throw new Error("Scheme not found")

        return { data: mapMongoToScheme(result), error: null }
    } catch (error: any) {
        console.error('Error updating scheme:', error)
        return { data: null, error: { message: error.message || 'Error updating scheme' } }
    }
}

/**
 * Toggle scheme status (admin only)
 */
export async function toggleSchemeStatus(id: string, status: 'active' | 'inactive' | 'draft'): Promise<{ success: boolean; error: { message: string; code?: string } | null }> {
    try {
        const client = await clientPromise
        const db = client.db()

        await db.collection('schemes').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updated_at: new Date().toISOString() } }
        )

        return { success: true, error: null }
    } catch (error: any) {
        console.error('Error toggling scheme status:', error)
        return { success: false, error: { message: error.message || 'Error updating status' } }
    }
}

/**
 * Delete a scheme (super admin only)
 */
export async function deleteScheme(id: string): Promise<{ success: boolean; error: { message: string; code?: string } | null }> {
    try {
        const client = await clientPromise
        const db = client.db()

        await db.collection('schemes').deleteOne({ _id: new ObjectId(id) })
        return { success: true, error: null }
    } catch (error: any) {
        console.error('Error deleting scheme:', error)
        return { success: false, error: { message: error.message || 'Error deleting scheme' } }
    }
}
