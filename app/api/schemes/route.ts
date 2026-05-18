import { NextRequest, NextResponse } from 'next/server'
import { getAllSchemes, createScheme } from '@/lib/db/schemes'
import { getSession } from '@/lib/session'

export async function GET() {
    try {
        const schemes = await getAllSchemes()
        return NextResponse.json(schemes)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch schemes'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
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
        const { data, error } = await createScheme(body)

        if (error) {
            return NextResponse.json(
                { error: error.message || 'Failed to create scheme' },
                { status: 400 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create scheme'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
