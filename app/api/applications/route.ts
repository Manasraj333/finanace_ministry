import { NextRequest, NextResponse } from 'next/server'
import { submitApplication } from '@/lib/db/applications'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        // Verify user is authenticated
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { data, error } = await submitApplication(body)

        if (error) {
            return NextResponse.json(
                { error: error.message || 'Failed to submit application' },
                { status: 400 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit application'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
