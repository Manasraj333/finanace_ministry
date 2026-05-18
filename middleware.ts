import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'fallback-secret'
const encodedKey = new TextEncoder().encode(secretKey)

type SessionPayload = {
    userId: string
    email: string
    role: string
    expiresAt?: string
}

async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie) return null

    try {
        const { payload } = await jwtVerify(sessionCookie, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload as SessionPayload
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const session = await getSessionFromRequest(request)
    const pathname = request.nextUrl.pathname

    const protectedRoutes = ['/dashboard', '/admin', '/analyst']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin') && session) {
        if (!['admin', 'super_admin'].includes(session.role)) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    if (pathname.startsWith('/analyst') && session) {
        if (!['analyst', 'admin', 'super_admin'].includes(session.role)) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/analyst/:path*', '/dashboard/:path*'],
}
