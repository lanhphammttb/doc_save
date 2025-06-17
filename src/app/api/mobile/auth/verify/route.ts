import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to get token from request
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Get token from request
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required'
        },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token'
        },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Connect to database to get fresh user data
    const { db } = await connectToDatabase();

    // Convert string userId to ObjectId
    let userId;
    try {
      userId = new ObjectId(decoded.userId);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user ID format'
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found'
        },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token: {
            userId: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            exp: decoded.exp,
            iat: decoded.iat,
          }
        }
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Token verification failed'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}
