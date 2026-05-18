import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/db/audit'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        const result = await writeAuditLog({
            user_id: session.userId,
            user_email: session.email,
            user_role: session.role,
            action: body.action,
            resource_type: body.resource_type,
            resource_id: body.resource_id,
            details: body.details,
            ip_address: request.headers.get('x-forwarded-for') || null,
            user_agent: request.headers.get('user-agent'),
        })

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to write audit log' }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: result.id }, { status: 201 })
    } catch (error: unknown) {
        console.error('MongoDB Audit Log Error:', error)
        return NextResponse.json(
            { error: 'Failed to write audit log' },
            { status: 500 }
        )
    }
}
