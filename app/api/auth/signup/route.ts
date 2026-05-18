import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const { email, password, full_name, role, aadhaar_number, phone_number } = await request.json()

        if (!email || !password || !aadhaar_number || !phone_number) {
            return NextResponse.json({ error: 'Email, password, Aadhaar number, and phone number are required' }, { status: 400 })
        }

        // Basic validation
        if (aadhaar_number.length !== 12 || !/^\d+$/.test(aadhaar_number)) {
            return NextResponse.json({ error: 'Aadhaar number must be a 12-digit number' }, { status: 400 })
        }
        if (phone_number.length < 10 || !/^\d+$/.test(phone_number)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()
        const usersCollection = db.collection('users')

        // Check if user exists by email, aadhaar or phone
        const existingUser = await usersCollection.findOne({
            $or: [
                { email },
                { aadhaar_number },
                { phone_number }
            ]
        })
        
        if (existingUser) {
            let conflictField = 'User'
            if (existingUser.email === email) conflictField = 'Email'
            else if (existingUser.aadhaar_number === aadhaar_number) conflictField = 'Aadhaar number'
            else if (existingUser.phone_number === phone_number) conflictField = 'Phone number'
            
            return NextResponse.json({ error: `${conflictField} already exists` }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert new user
        const newUser = {
            email,
            password: hashedPassword,
            full_name: full_name || '',
            aadhaar_number,
            phone_number,
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
