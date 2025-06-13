'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Space, Tag, Button, Alert, Modal, message, Spin } from 'antd';
import { FileTextOutlined, LinkOutlined, FileOutlined, ArrowLeftOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getDocument } from '@/lib/client-api';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface Document {
  _id: string;
  title: string;
  type: 'text' | 'file' | 'link';
  topic: string;
  category: string;
  content?: string;
  file?: string; // URL to file
  fileName?: string;
  fileType?: string;
  link?: string;
  userEmail: string;
  createdAt: string;
  updatedAt?: string;
}

export default function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const data = await getDocument(params.id);
        setDocument(data);
      } catch (err: any) {
        console.error('Error fetching document:', err);
        setError(err.message || 'An error occurred while fetching the document.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [params.id]);

  const handleDelete = () => {
    confirm({
      title: 'Do you want to delete this document?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          const res = await fetch(`/api/documents/${params.id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to delete document');
          }

          message.success('Document deleted successfully!');
          router.push('/documents');
        } catch (err: any) {
          console.error('Error deleting document:', err);
          message.error(err.message || 'Failed to delete document.');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="Loading document..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Link href="/documents">
              <Button type="primary">Back to Documents</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <Alert
          message="Document Not Found"
          description="The document you are looking for does not exist or you don't have permission to view it."
          type="error"
          showIcon
          action={
            <Link href="/documents">
              <Button type="primary">Back to Documents</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileTextOutlined />;
      case 'link':
        return <LinkOutlined />;
      case 'file':
        return <FileOutlined />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <Title level={2} className="flex items-center gap-2 mb-0">
            {getIcon(document.type)} {document.title}
          </Title>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/documents')}>
              Back to Documents
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete Document
            </Button>
          </Space>
        </div>

        <Card>
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex items-center gap-2">
              <Tag color="blue">{document.type}</Tag>
              <Tag color="green">{document.topic}</Tag>
              <Tag color="purple">{document.category}</Tag>
            </div>

            <div>
              <Text type="secondary">Created: {new Date(document.createdAt).toLocaleString()}</Text>
            </div>

            <div className="mt-4">
              {document.type === 'text' && (
                <div className="whitespace-pre-wrap">{document.content}</div>
              )}

              {document.type === 'link' && (
                <a
                  href={document.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {document.link}
                </a>
              )}

              {document.type === 'file' && (
                <div>
                  <p>File: {document.fileName}</p>
                  <p>Type: {document.fileType}</p>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    href={`/api/documents/${params.id}/file`}
                    target="_blank"
                  >
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
