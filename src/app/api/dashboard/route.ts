import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db, client } = await connectToDatabase();
    try {
      // Get total documents count
      const totalDocuments = await db.collection('documents')
        .countDocuments({ userEmail: session.user.email });

      // Get total links count
      const totalLinks = await db.collection('links')
        .countDocuments({ userEmail: session.user.email });

      // Get recent documents
      const recentDocuments = await db.collection('documents')
        .find({ userEmail: session.user.email })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      // Get recent links
      const recentLinks = await db.collection('links')
        .find({ userEmail: session.user.email })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      return NextResponse.json({
        totalDocuments,
        totalLinks,
        recentDocuments,
        recentLinks,
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
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
