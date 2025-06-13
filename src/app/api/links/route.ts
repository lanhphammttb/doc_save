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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db, client } = await connectToDatabase();
    try {
      const links = await db.collection('links')
        .find({ userEmail: session.user.email })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json(links);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error in GET /api/links:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, url, description, category } = await request.json();
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    const { db, client } = await connectToDatabase();
    try {
      const result = await db.collection('links').insertOne({
        _id: new ObjectId(),
        title,
        url,
        description,
        category,
        userEmail: session.user.email,
        createdAt: new Date().toISOString(),
      });

      if (!result.acknowledged) {
        throw new Error('Failed to create link');
      }

      return NextResponse.json({
        message: 'Link created successfully',
        link: {
          _id: result.insertedId,
          title,
          url,
          description,
          category,
          userEmail: session.user.email,
          createdAt: new Date().toISOString(),
        }
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error in POST /api/links:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
