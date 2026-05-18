import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST() {
    deleteSession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 })
}
