import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import Document from '@/models/Document';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
    );
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    await connectDB();

    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id title type content createdAt');

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { message: 'Error fetching documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
    );
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const { title, type, content, fileUrl, fileType, fileSize, link } = await req.json();

    await connectDB();

    const document = await Document.create({
      title,
      type,
      content,
      fileUrl,
      fileType,
      fileSize,
      link,
      userId,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { message: 'Error creating document' },
      { status: 500 }
    );
  }
}
