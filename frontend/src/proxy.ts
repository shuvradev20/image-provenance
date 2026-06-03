import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const userToken = request.cookies.get('accessToken')?.value;
  const adminToken = request.cookies.get('adminAccessToken')?.value;

  if (path === '/') {
    if (userToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';

  if (isAdminRoute && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (path === '/admin/login' && adminToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};