import { NextRequest, NextResponse } from 'next/server'
import { toggleSchemeStatus } from '@/lib/db/schemes'
import { getSession } from '@/lib/session'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()

        // Verify user is admin
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!['admin', 'super_admin'].includes(session.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { success, error } = await toggleSchemeStatus(params.id, body.status)

        if (error) {
            return NextResponse.json(
                { error: error.message || 'Failed to update status' },
                { status: 400 }
            )
        }

        return NextResponse.json({ success })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
