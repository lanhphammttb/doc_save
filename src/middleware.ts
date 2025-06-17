import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verify } from 'jsonwebtoken';

// CORS configuration for mobile API
const corsConfig = {
  allowedOrigins: [
    'http://localhost:3000', // Next.js web app
    'http://localhost:8080', // Flutter web
    'http://localhost:3001', // Alternative port
    'http://127.0.0.1:3000', // Local IP
    'http://127.0.0.1:8080', // Flutter local IP
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Helper function to verify JWT token
async function verifyJWTToken(token: string) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to get JWT token from request
function getJWTTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for mobile API routes only
  if (pathname.startsWith('/api/mobile/')) {
    const origin = request.headers.get('origin');
    const isAllowedOrigin = origin && corsConfig.allowedOrigins.includes(origin);

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
          'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
          'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
        },
      });
    }

    // Add CORS headers to mobile API responses
    const response = NextResponse.next();
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    }
    return response;
  }

  // Handle NextAuth authentication for web routes
  const token = await getToken({ req: request });
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/mobile/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
