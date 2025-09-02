'use client'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isAuthApi = pathname.startsWith('/api/auth')

  if (isAuthApi) {
    return NextResponse.next()
  }

  if (!sessionCookie) {
    if (isAuthPage) {
      return NextResponse.next()
    }
    if (pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true)
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  } catch (error) {
    if (pathname.startsWith('/api')) {
      const response = new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication failed.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
      response.cookies.delete('session')
      return response
    }

    const response = isAuthPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/login', request.url))

    response.cookies.delete('session')

    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
