import { NextRequest, NextResponse } from 'next/server'
import { updateScheme, deleteScheme } from '@/lib/db/schemes'
import { getSession } from '@/lib/session'

export async function PUT(
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
        const { data, error } = await updateScheme({ id: params.id, ...body })

        if (error) {
            return NextResponse.json(
                { error: error.message || 'Failed to update scheme' },
                { status: 400 }
            )
        }

        return NextResponse.json(data)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update scheme'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}

export async function DELETE(
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
            return NextResponse.json({ error: 'Forbidden - Admins only' }, { status: 403 })
        }

        const { success, error } = await deleteScheme(params.id)

        if (error) {
            return NextResponse.json(
                { error: error.message || 'Failed to delete scheme' },
                { status: 400 }
            )
        }

        return NextResponse.json({ success })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete scheme'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
