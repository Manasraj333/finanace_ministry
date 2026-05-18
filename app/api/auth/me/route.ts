import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ user: null, role: 'public_user' }, { status: 200 })
        }

        return NextResponse.json({
            user: {
                id: session.userId,
                email: session.email,
            },
            role: session.role
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ user: null, role: 'public_user' }, { status: 200 })
    }
}
