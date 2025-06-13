import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { client, db } = await connectToDatabase();

    try {
      const link = await db.collection('links').findOne({
        _id: new ObjectId(params.id),
        userId: session.user.email,
      });

      if (!link) {
        return NextResponse.json(
          { message: 'Link not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ link });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, url } = await request.json();

    if (!title || !url) {
      return NextResponse.json(
        { message: 'Title and URL are required' },
        { status: 400 }
      );
    }

    const { client, db } = await connectToDatabase();

    try {
      const result = await db.collection('links').findOneAndUpdate(
        {
          _id: new ObjectId(params.id),
          userId: session.user.email,
        },
        {
          $set: {
            title,
            url,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result || !result.value) {
        return NextResponse.json(
          { message: 'Link not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ link: result.value });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { client, db } = await connectToDatabase();

    try {
      const result = await db.collection('links').findOneAndDelete({
        _id: new ObjectId(params.id),
        userId: session.user.email,
      });

      if (!result || !result.value) {
        return NextResponse.json(
          { message: 'Link not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Link deleted successfully' });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
