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
}

export default function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        setError('Failed to fetch documents');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'file':
        return '📎';
      case 'link':
        return '🔗';
      default:
        return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm">
        <div className="container-custom">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary">
                DocSave
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/documents/new"
                className="btn-primary"
              >
                New Document
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-custom py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
            <Link
              href="/documents/new"
              className="btn-primary"
            >
              New Document
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 mb-4">No documents yet</p>
              <Link
                href="/documents/new"
                className="btn-primary"
              >
                Create your first document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Link
                  key={doc._id}
                  href={`/documents/${doc._id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <span className="text-2xl" role="img" aria-label={doc.type}>
                        {getDocumentIcon(doc.type)}
                      </span>
                    </div>
                    <div className="mt-4">
                      {doc.type === 'text' && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {doc.content}
                        </p>
                      )}
                      {doc.type === 'file' && (
                        <p className="text-sm text-gray-600">
                          {doc.fileType} • {(doc.fileSize! / 1024).toFixed(1)} KB
                        </p>
                      )}
                      {doc.type === 'link' && (
                        <p className="text-sm text-gray-600 truncate">
                          {doc.link}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
