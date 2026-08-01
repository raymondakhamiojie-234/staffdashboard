import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define the routes that need protection
const protectedRoutes = ['/admin', '/staff'];
const authRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // Role-based protection
    if (pathname.startsWith('/admin') && !payload.isAdmin) {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }

    if (pathname.startsWith('/staff') && payload.isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Onboarding Gate for Staff
    if (!payload.isAdmin && pathname.startsWith('/staff/dashboard')) {
      const { profileStatus, contractStatus, policyStatus } = payload as any;
      if (profileStatus !== 'completed' || contractStatus !== 'signed' || policyStatus !== 'acknowledged') {
        // Allow access to the onboarding specific routes if they are implemented, otherwise redirect to an onboarding master page
        if (!pathname.startsWith('/staff/onboarding')) {
          return NextResponse.redirect(new URL('/staff/onboarding', request.url));
        }
      }
    }
  }

  if (isAuthRoute) {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        if (payload.isAdmin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/staff/dashboard', request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
