'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, message } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

interface LinkForm {
  title: string;
  url: string;
}

export default function NewLinkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LinkForm) => {
    try {
      setLoading(true);
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create link');
      }

      message.success('Link created successfully');
      router.push('/links');
    } catch (error) {
      console.error('Error creating link:', error);
      message.error('Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="Create New Link" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter link title" />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
            rules={[
              { required: true, message: 'Please enter a URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
          >
            <Input
              placeholder="Enter URL"
              prefix={<LinkOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Create Link
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
