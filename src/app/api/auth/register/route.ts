import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');

      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Error checking existing user:', dbError);
      return NextResponse.json(
        { message: 'Error checking user existence' },
        { status: 500 }
      );
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await hash(password, 12);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json(
        { message: 'Error processing password' },
        { status: 500 }
      );
    }

    // Create user
    const user = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let result;
    try {
      result = await db.collection('users').insertOne(user);
    } catch (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json(
        { message: 'Error creating user account' },
        { status: 500 }
      );
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        { userId: result.insertedId },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('JWT generation error:', jwtError);
      return NextResponse.json(
        { message: 'Error generating authentication token' },
        { status: 500 }
      );
    }

    // Create response with token
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: result.insertedId,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
