import { NextRequest, NextResponse } from 'next/server'
import { insertTrendResult } from '@/lib/db/trends'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'analyst') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const result = await insertTrendResult(body)

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to save trend result' }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: result.id }, { status: 201 })
    } catch (error) {
        console.error('Trends API error:', error)
        return NextResponse.json({ error: 'Failed to save trend result' }, { status: 500 })
    }
}
