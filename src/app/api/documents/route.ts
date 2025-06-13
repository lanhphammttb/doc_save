import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = await db
      .collection('documents')
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'text' | 'file' | 'link';
    const topic = formData.get('topic') as string;
    const category = formData.get('category') as string;

    if (!title || !type || !topic || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const document = {
      _id: new ObjectId(),
      title,
      type,
      topic,
      category,
      userEmail: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (type === 'text') {
      const content = formData.get('content') as string;
      if (!content) {
        return NextResponse.json(
          { message: 'Content is required for text documents' },
          { status: 400 }
        );
      }
      Object.assign(document, { content });
    } else if (type === 'file') {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { message: 'File is required for file documents' },
          { status: 400 }
        );
      }
      const buffer = await file.arrayBuffer();
      const fileName = file.name;
      const fileType = file.type;
      Object.assign(document, {
        file: buffer,
        fileName,
        fileType,
      });
    } else if (type === 'link') {
      const link = formData.get('link') as string;
      if (!link) {
        return NextResponse.json(
          { message: 'Link is required for link documents' },
          { status: 400 }
        );
      }
      Object.assign(document, { link });
    }

    const result = await db.collection('documents').insertOne(document);

    if (!result.acknowledged) {
      throw new Error('Failed to create document');
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
