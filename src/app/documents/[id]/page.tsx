'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Document {
  _id: string;
  title: string;
  type: 'text' | 'file' | 'link';
  content: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDocument(data);
      } else {
        setError('Failed to fetch document');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete document');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Document not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">DocSave</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{document.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(document.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="btn-secondary text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            {document.type === 'text' && (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{document.content}</pre>
              </div>
            )}

            {document.type === 'file' && document.fileUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  File Type: {document.fileType}
                  {document.fileSize && ` (${(document.fileSize / 1024).toFixed(1)} KB)`}
                </p>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Download File
                </a>
              </div>
            )}

            {document.type === 'link' && document.link && (
              <div>
                <a
                  href={document.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-secondary"
                >
                  {document.link}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
