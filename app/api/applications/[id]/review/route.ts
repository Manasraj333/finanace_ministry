import { NextRequest, NextResponse } from 'next/server'
import { reviewApplication } from '@/lib/db/applications'
import { getSession } from '@/lib/session'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const role = session.role

        if (!['analyst', 'admin', 'super_admin'].includes(role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const newStatus = body.status

        if (role === 'analyst') {
            if (newStatus === 'approved') {
                return NextResponse.json(
                    { error: 'Analysts cannot grant final approval. Please select "Forward to Admin".' },
                    { status: 403 }
                )
            }
            if (!['under_review', 'rejected', 'forwarded_to_admin'].includes(newStatus)) {
                return NextResponse.json(
                    { error: 'Invalid status transition for Analyst. Can only review, reject, or forward.' },
                    { status: 400 }
                )
            }
        }

        const { success, error } = await reviewApplication({
            application_id: params.id,
            status: newStatus,
            review_notes: body.review_notes
        })

        if (error) {
            return NextResponse.json(
                { error: error.message || 'Failed to review application' },
                { status: 400 }
            )
        }

        return NextResponse.json({ success })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to review application'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
