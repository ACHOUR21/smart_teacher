import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password']
const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('edu_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p)
  const isAuth = AUTH_PATHS.some((p) => pathname === p)
  const isDashboard = ['/teacher', '/student', '/parent', '/admin'].some((p) =>
    pathname.startsWith(p)
  )

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuth && token) {
    return NextResponse.redirect(new URL('/student', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
