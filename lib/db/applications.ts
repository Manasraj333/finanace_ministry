import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/session'
import type {
    SchemeApplication,
    ApplicationWithDetails,
    SubmitApplicationInput,
    ReviewApplicationInput,
    ApplicationFilters
} from '@/lib/types/schemes'

const mapMongoToApp = (doc: any): any => {
    const app = {
        ...doc,
        id: doc._id.toString(),
        _id: undefined
    }
    if (app.scheme) {
        app.scheme = {
            ...app.scheme,
            id: app.scheme._id?.toString() || app.scheme.id,
            _id: undefined
        }
    }
    return app
}

/**
 * Submit a new application (citizen only)
 */
export async function submitApplication(input: SubmitApplicationInput): Promise<{ data: SchemeApplication | null; error: { message: string; code?: string } | null }> {
    try {
        const session = await getSession()
        if (!session) {
            return { data: null, error: { message: 'Not authenticated' } }
        }

        const client = await clientPromise
        const db = client.db()

        const newApp = {
            scheme_id: input.scheme_id, // stored as string
            citizen_id: session.userId,
            application_data: input.application_data,
            status: 'pending',
            submitted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reviewed_by: null,
            review_notes: null,
            reviewed_at: null
        }

        const result = await db.collection('scheme_applications').insertOne(newApp)
        const created = await db.collection('scheme_applications').findOne({ _id: result.insertedId })

        return { data: mapMongoToApp(created), error: null }
    } catch (error: any) {
        console.error('Error submitting application:', error)
        return { data: null, error: { message: error.message || 'Error submitting application' } }
    }
}

/**
 * Get applications for current user (citizen view)
 */
export async function getMyApplications(): Promise<ApplicationWithDetails[]> {
    try {
        const session = await getSession()
        if (!session) return []

        const client = await clientPromise
        const db = client.db()

        // Fetch applications
        const apps = await db.collection('scheme_applications')
            .find({ citizen_id: session.userId })
            .sort({ submitted_at: -1 })
            .toArray()

        // Fetch related schemes manually for simplicity instead of complex lookup
        const schemeIds = Array.from(new Set(apps.map(a => a.scheme_id)))
        const schemes = await db.collection('schemes')
            .find({ _id: { $in: schemeIds.map(id => new ObjectId(id)) } })
            .toArray()

        const schemeMap = new Map(schemes.map(s => [s._id.toString(), s]))

        return apps.map(app => {
            const mappedApp = mapMongoToApp(app)
            mappedApp.scheme = mapMongoToApp(schemeMap.get(app.scheme_id) || {})
            return mappedApp
        })
    } catch (error) {
        console.error('Error fetching my applications:', error)
        return []
    }
}

/**
 * Get all applications (analyst/admin view)
 */
export async function getAllApplications(filters?: ApplicationFilters): Promise<ApplicationWithDetails[]> {
    try {
        const client = await clientPromise
        const db = client.db()

        let query: any = {}

        if (filters?.scheme_id) {
            query.scheme_id = filters.scheme_id
        }

        if (filters?.status) {
            query.status = filters.status
        } else {
            query.status = { $in: ['pending', 'under_review', 'approved', 'rejected'] }
        }

        if (filters?.from_date || filters?.to_date) {
            query.submitted_at = {}
            if (filters.from_date) query.submitted_at.$gte = filters.from_date
            if (filters.to_date) query.submitted_at.$lte = filters.to_date
        }

        const apps = await db.collection('scheme_applications')
            .find(query)
            .sort({ submitted_at: -1 })
            .toArray()

        const schemeIds = Array.from(new Set(apps.map(a => a.scheme_id)))
        const schemes = await db.collection('schemes')
            .find({ _id: { $in: schemeIds.map(id => new ObjectId(id)) } })
            .toArray()

        const schemeMap = new Map(schemes.map(s => [s._id.toString(), s]))

        return apps.map(app => {
            const mappedApp = mapMongoToApp(app)
            mappedApp.scheme = mapMongoToApp(schemeMap.get(app.scheme_id) || {})
            return mappedApp
        })
    } catch (error) {
        console.error('Error fetching all applications:', error)
        return []
    }
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(id: string): Promise<ApplicationWithDetails | null> {
    try {
        const client = await clientPromise
        const db = client.db()

        const app = await db.collection('scheme_applications').findOne({ _id: new ObjectId(id) })
        if (!app) return null

        const scheme = await db.collection('schemes').findOne({ _id: new ObjectId(app.scheme_id) })
        
        const mappedApp = mapMongoToApp(app)
        if (scheme) {
            mappedApp.scheme = mapMongoToApp(scheme)
        }
        
        return mappedApp
    } catch (error) {
        console.error('Error fetching application:', error)
        return null
    }
}

/**
 * Review an application (analyst/admin only)
 */
export async function reviewApplication(input: ReviewApplicationInput): Promise<{ success: boolean; error: { message: string; code?: string } | null }> {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: { message: 'Not authenticated' } }
        }

        const client = await clientPromise
        const db = client.db()

        await db.collection('scheme_applications').updateOne(
            { _id: new ObjectId(input.application_id) },
            { 
                $set: {
                    status: input.status,
                    review_notes: input.review_notes,
                    reviewed_by: session.userId,
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } 
            }
        )

        return { success: true, error: null }
    } catch (error: any) {
        console.error('Error reviewing application:', error)
        return { success: false, error: { message: error.message || 'Error updating application' } }
    }
}

/**
 * Get application statistics (admin dashboard)
 */
export async function getApplicationStats(): Promise<{
    total: number
    pending: number
    under_review: number
    approved: number
    rejected: number
}> {
    try {
        const client = await clientPromise
        const db = client.db()

        const statuses = await db.collection('scheme_applications')
            .find({}, { projection: { status: 1 } })
            .toArray()

        return {
            total: statuses.length,
            pending: statuses.filter(a => a.status === 'pending').length,
            under_review: statuses.filter(a => a.status === 'under_review').length,
            approved: statuses.filter(a => a.status === 'approved').length,
            rejected: statuses.filter(a => a.status === 'rejected').length
        }
    } catch (error) {
        console.error('Error fetching application stats:', error)
        return { total: 0, pending: 0, under_review: 0, approved: 0, rejected: 0 }
    }
}

/**
 * Check if user has already applied for a scheme
 */
export async function hasAppliedForScheme(schemeId: string): Promise<boolean> {
    try {
        const session = await getSession()
        if (!session) return false

        const client = await clientPromise
        const db = client.db()

        const app = await db.collection('scheme_applications').findOne({
            scheme_id: schemeId,
            citizen_id: session.userId
        })

        return !!app
    } catch (error) {
        return false
    }
}
