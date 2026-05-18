import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const { email, password, full_name, role } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()
        const usersCollection = db.collection('users')

        // Check if user exists
        const existingUser = await usersCollection.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert new user
        const newUser = {
            email,
            password: hashedPassword,
            full_name: full_name || '',
            role: role || 'public_user',
            is_active: true,
            updated_at: new Date().toISOString(),
            created_at: new Date()
        }

        const result = await usersCollection.insertOne(newUser)

        // Create session cookie
        await createSession(result.insertedId.toString(), email, newUser.role)

        return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 })
    } catch (error: unknown) {
        console.error('Signup Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
