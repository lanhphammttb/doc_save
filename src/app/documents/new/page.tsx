'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';

export default function NewDocument() {
  const router = useRouter();
  const [type, setType] = useState<'text' | 'file' | 'link'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let fileUrl = '';
      if (type === 'file' && file) {
        // Here you would typically upload the file to your storage service
        // For now, we'll just use a placeholder
        fileUrl = 'placeholder-url';
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type,
          content: type === 'link' ? link : content,
          fileUrl,
          fileType: file?.type,
          fileSize: file?.size,
          link: type === 'link' ? link : undefined,
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create document');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
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
          </div>
        </div>
      </nav>

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Create New Document</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    type === 'text'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setType('text')}
                >
                  Text
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    type === 'file'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setType('file')}
                >
                  File
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    type === 'link'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setType('link')}
                >
                  Link
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="input-field"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {type === 'text' && (
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Content
                </label>
                <textarea
                  id="content"
                  required
                  rows={6}
                  className="input-field"
                  placeholder="Enter document content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            )}

            {type === 'file' && (
              <div className="form-group">
                <label className="form-label">Upload File</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Drag and drop a file here, or click to select a file
                      </p>
                      <p className="text-xs text-gray-500">
                        Maximum file size: 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {type === 'link' && (
              <div className="form-group">
                <label htmlFor="link" className="form-label">
                  URL
                </label>
                <input
                  type="url"
                  id="link"
                  required
                  className="input-field"
                  placeholder="Enter URL (e.g., https://example.com)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Document'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
