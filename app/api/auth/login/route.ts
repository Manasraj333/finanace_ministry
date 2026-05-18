import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const { identifier, password } = await request.json()

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Identifier (Email, Phone, or Aadhaar) and password are required' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()
        const usersCollection = db.collection('users')

        // Find user by email, phone, or aadhaar
        const user = await usersCollection.findOne({
            $or: [
                { email: identifier },
                { phone_number: identifier },
                { aadhaar_number: identifier }
            ]
        })
        
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Create session cookie
        await createSession(user._id.toString(), user.email, user.role)

        return NextResponse.json({ success: true, message: 'Logged in successfully', role: user.role }, { status: 200 })
    } catch (error: unknown) {
        console.error('Login Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
