import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/teacher', '/student', '/parent', '/admin'];
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];
const PUBLIC_PATHS = ['/', '/onboarding'];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // Redirect authenticated users away from auth pages
  if (isAuthPage(pathname) && token) {
    return NextResponse.redirect(new URL('/student', request.url));
  }

  // Guard protected routes
  if (isProtected(pathname) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (token && isProtected(pathname)) {
    try {
      // Decode JWT payload (no verification — that's the backend's job)
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(atob(payloadB64));
      const role: string = (payload.role ?? '').toLowerCase();

      const allowed: Record<string, string[]> = {
        teacher: ['/teacher'],
        student: ['/student'],
        parent: ['/parent'],
        admin: ['/admin', '/teacher', '/student', '/parent'],
      };

      const permitted = allowed[role] ?? [];
      const hasAccess = permitted.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
      );

      if (!hasAccess) {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
    } catch {
      // Malformed token → force re-login
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('accessToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\.png|manifest.json|api/).*)',
  ],
};
