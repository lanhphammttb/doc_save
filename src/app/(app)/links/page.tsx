'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  Button,
  Input,
  List,
  Typography,
  Space,
  Tag,
  Spin,
  message,
  Empty,
  Select,
} from 'antd';
import {
  PlusOutlined,
  LinkOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Link {
  _id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  createdAt: string;
}

export default function LinksPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/links');
        if (!response.ok) {
          throw new Error('Failed to fetch links');
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        if (Array.isArray(data)) {
          setLinks(data);
        } else if (data.links && Array.isArray(data.links)) {
          setLinks(data.links);
        } else {
          console.error('Invalid data format:', data);
          setLinks([]);
        }
      } catch (error) {
        console.error('Error fetching links:', error);
        message.error('Failed to fetch links');
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchLinks();
    }
  }, [status, router]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      message.success('Link deleted successfully');
      setLinks(links.filter(link => link._id !== id));
    } catch (error) {
      console.error('Error deleting link:', error);
      message.error('Failed to delete link');
    }
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch = link.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         link.url.toLowerCase().includes(searchText.toLowerCase()) ||
                         (link.description && link.description.toLowerCase().includes(searchText.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || link.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(links.map((link) => link.category).filter(Boolean)))];

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  console.log('Current links state:', links); // Debug log
  console.log('Filtered links:', filteredLinks); // Debug log

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Links</Title>
          <Text type="secondary">Manage your saved links</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/links/new')}
          size="large"
        >
          New Link
        </Button>
      </div>

      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search links"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Filter by category"
          >
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </Option>
            ))}
          </Select>
        </Space>

        {filteredLinks.length > 0 ? (
          <List
            dataSource={filteredLinks}
            renderItem={(link) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/links/${link._id}/edit`)}
                  >
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(link._id)}
                  >
                    Delete
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<LinkOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                  title={
                    <Space>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {link.title}
                      </a>
                      {link.category && (
                        <Tag color="purple">{link.category}</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      {link.description && (
                        <Text type="secondary">{link.description}</Text>
                      )}
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Created: {new Date(link.createdAt).toLocaleDateString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText || categoryFilter !== 'all'
                ? "No links match your search criteria"
                : "No links found. Create your first link!"
            }
          />
        )}
      </Card>
    </div>
  );
}
