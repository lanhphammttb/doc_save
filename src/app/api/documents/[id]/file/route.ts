import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

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

    const { db } = await connectToDatabase();
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(params.id),
      userEmail: session.user.email,
      type: 'file',
    });

    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }

    if (!document.file || !document.fileName || !document.fileType) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(document.file.buffer);
    const headers = new Headers();
    headers.set('Content-Type', document.fileType);
    headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);

    return new NextResponse(buffer, {
      headers,
    });
  } catch (error) {
    console.error('Error downloading file:', error);
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