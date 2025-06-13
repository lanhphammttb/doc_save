'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  Typography,
  Space,
  Button,
  Spin,
  message,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import {
  FileTextOutlined,
  LinkOutlined,
  FileOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

interface DashboardStats {
  totalDocuments: number;
  totalLinks: number;
  recentDocuments: any[];
  recentLinks: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        message.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const getTypeIcon = (type: string, fontSize: string = '36px') => {
    switch (type) {
      case 'text':
        return <FileTextOutlined style={{ color: '#1890ff', fontSize: fontSize }} />;
      case 'file':
        return <FileOutlined style={{ color: '#52c41a', fontSize: fontSize }} />;
      case 'link':
        return <LinkOutlined style={{ color: '#722ed1', fontSize: fontSize }} />;
      default:
        return <FileTextOutlined style={{ fontSize: fontSize }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return '#1890ff';
      case 'file':
        return '#52c41a';
      case 'link':
        return '#722ed1';
      default:
        return '#1890ff';
    }
  };

  const chartData = [
    {
      name: 'Documents',
      value: stats?.totalDocuments || 0,
      color: '#1890ff'
    },
    {
      name: 'Links',
      value: stats?.totalLinks || 0,
      color: '#722ed1'
    },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Welcome back, {session?.user?.name || 'User'}!</Title>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/documents/new')}
            size="large"
          >
            New Document
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => router.push('/links/new')}
            size="large"
          >
            New Link
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            bordered={false}
            style={{ borderRadius: '12px', boxShadow: '0 12px 36px rgba(0,0,0,0.15)', padding: '20px', background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                {getTypeIcon('text', '48px')}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: '18px', display: 'block' }}>Documents</Text>
                <Statistic
                  value={stats?.totalDocuments || 0}
                  valueStyle={{ color: '#1890ff', fontSize: '72px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            bordered={false}
            style={{ borderRadius: '12px', boxShadow: '0 12px 36px rgba(0,0,0,0.15)', padding: '20px', background: 'linear-gradient(135deg, #f9f0ff, #d3adf7)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                {getTypeIcon('link', '48px')}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: '18px', display: 'block' }}>Links</Text>
                <Statistic
                  value={stats?.totalLinks || 0}
                  valueStyle={{ color: '#722ed1', fontSize: '72px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            bordered={false}
            style={{ borderRadius: '12px', boxShadow: '0 12px 36px rgba(0,0,0,0.15)', height: '100%' }}
          >
            <Title level={4} style={{ marginBottom: 24 }}>Distribution</Title>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span>Recent Documents</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => router.push('/documents')}>
                View All
              </Button>
            }
            bordered={false}
            style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            {stats?.recentDocuments?.length ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {stats.recentDocuments.map((doc) => (
                  <Card
                    key={doc._id}
                    size="small"
                    hoverable
                    onClick={() => router.push(`/documents/${doc._id}`)}
                    bordered={false}
                    style={{
                      borderRadius: '8px',
                      borderLeft: `4px solid ${getTypeColor(doc.type)}`,
                      marginBottom: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Space align="start">
                      <div style={{ marginRight: '12px' }}>{getTypeIcon(doc.type, '24px')}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{doc.title}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent documents"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <LinkOutlined style={{ color: '#722ed1' }} />
                <span>Recent Links</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => router.push('/links')}>
                View All
              </Button>
            }
            bordered={false}
            style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            {stats?.recentLinks?.length ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {stats.recentLinks.map((link) => (
                  <Card
                    key={link._id}
                    size="small"
                    hoverable
                    onClick={() => router.push(`/links/${link._id}`)}
                    bordered={false}
                    style={{
                      borderRadius: '8px',
                      borderLeft: '4px solid #722ed1',
                      marginBottom: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Space align="start">
                      <div style={{ marginRight: '12px' }}>{getTypeIcon('link', '24px')}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{link.title}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(link.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent links"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
