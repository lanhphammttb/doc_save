import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

interface Document {
  _id: ObjectId;
  title: string;
  type: 'text' | 'file' | 'link';
  topic: string;
  category: string;
  content?: string;
  file?: Buffer;
  fileName?: string;
  fileType?: string;
  link?: string;
  userEmail: string;
  createdAt: string;
  updatedAt?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      // If params.id is not a valid ObjectId string, then the document cannot be found.
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document: Document | null = await db.collection<Document>('documents').findOne({
      _id: objectId,
      userEmail: session.user.email,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error in GET /api/documents/[id]:', error);
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document: Document | null = await db.collection<Document>('documents').findOne({
      _id: objectId,
      userEmail: session.user.email,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const topic = formData.get('topic') as string;
    const category = formData.get('category') as string;

    if (!title || !topic || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData: Partial<Document> = {
      title,
      topic,
      category,
      updatedAt: new Date().toISOString(),
    };

    if (document.type === 'text') {
      const content = formData.get('content') as string;
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required for text documents' },
          { status: 400 }
        );
      }
      updateData.content = content;
    } else if (document.type === 'file') {
      const file = formData.get('file') as File;
      if (file) {
        const buffer = await file.arrayBuffer();
        updateData.file = Buffer.from(buffer);
        updateData.fileName = file.name;
        updateData.fileType = file.type;
      }
    } else if (document.type === 'link') {
      const link = formData.get('link') as string;
      if (!link) {
        return NextResponse.json(
          { error: 'Link is required for link documents' },
          { status: 400 }
        );
      }
      updateData.link = link;
    }

    const result = await db.collection<Document>('documents').updateOne(
      {
        _id: objectId,
        userEmail: session.user.email,
      },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      throw new Error('Failed to update document');
    }

    return NextResponse.json({
      ...document,
      ...updateData,
    });
  } catch (error) {
    console.error('Error in PUT /api/documents/[id]:', error);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const result = await db.collection<Document>('documents').deleteOne({
      _id: objectId,
      userEmail: session.user.email,
    });

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error);
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
