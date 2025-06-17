'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Spin,
  message,
} from 'antd';
import {
  FileTextOutlined,
  FileOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface Document {
  _id: string;
  title: string;
  type: 'text' | 'file' | 'link';
  topic: string;
  category: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      message.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error('Failed to delete document');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'file':
        return <FileOutlined style={{ color: '#52c41a' }} />;
      case 'link':
        return <LinkOutlined style={{ color: '#722ed1' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'blue';
      case 'file':
        return 'green';
      case 'link':
        return 'purple';
      default:
        return 'default';
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesTopic = topicFilter === 'all' || doc.topic === topicFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesType && matchesTopic && matchesCategory;
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Document) => (
        <Space>
          {getTypeIcon(record.type)}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Space>
          <Button
            type="link"
            onClick={() => router.push(`/documents/${record._id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const topics = Array.from(new Set(documents.map((doc) => doc.topic)));
  const categories = Array.from(new Set(documents.map((doc) => doc.category)));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Title level={2}>Documents</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/documents/new')}
          className="btn-responsive"
          style={{ width: '100%', maxWidth: '200px' }}
        >
          New Document
        </Button>
      </div>

      <Card>
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="Search documents"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%' }}
          />
          <Space wrap style={{ width: '100%' }}>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%', minWidth: '120px' }}
              placeholder="Type"
            >
              <Option value="all">All Types</Option>
              <Option value="text">Text</Option>
              <Option value="file">File</Option>
              <Option value="link">Link</Option>
            </Select>
            <Select
              value={topicFilter}
              onChange={setTopicFilter}
              style={{ width: '100%', minWidth: '120px' }}
              placeholder="Topic"
            >
              <Option value="all">All Topics</Option>
              {topics.map((topic) => (
                <Option key={topic} value={topic}>
                  {topic}
                </Option>
              ))}
            </Select>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%', minWidth: '120px' }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="_id"
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            responsive: true,
          }}
        />
      </Card>
    </div>
  );
}
