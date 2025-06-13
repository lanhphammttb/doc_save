import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // If trying to access a public path while logged in, redirect to dashboard
  if (isPublicPath && token) {
    try {
      // Verify token
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production')
      );
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // If token is invalid, remove it and continue to public path
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // If trying to access a protected path without token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access a protected path with token, verify it
  if (!isPublicPath && token) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production')
      );
      return NextResponse.next();
    } catch (error) {
      // If token is invalid, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
