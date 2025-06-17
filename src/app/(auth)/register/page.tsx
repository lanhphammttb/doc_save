'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, message, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages
        if (response.status === 400) {
          if (data.message.includes('already exists')) {
            setError('An account with this email already exists. Please use a different email or try logging in.');
          } else if (data.message.includes('Invalid email format')) {
            setError('Please enter a valid email address.');
          } else if (data.message.includes('Password must be at least')) {
            setError('Password must be at least 6 characters long.');
          } else if (data.message.includes('Name must be at least')) {
            setError('Name must be at least 2 characters long.');
          } else if (data.message.includes('Missing required fields')) {
            setError('Please fill in all required fields.');
          } else {
            setError(data.message || 'Registration failed. Please try again.');
          }
        } else if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
        return;
      }

      message.success('Registration successful! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="text-center">
            <Title level={2}>Create Account</Title>
            <p className="text-gray-500">Please fill in your details to register</p>
          </div>

          {error && (
            <Alert
              message="Registration Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
              name: '',
              email: '',
              password: '',
            }}
            size="large"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: 'Please input your name!' },
                { min: 2, message: 'Name must be at least 2 characters!' },
                { max: 50, message: 'Name cannot exceed 50 characters!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email address"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
                { max: 128, message: 'Password cannot exceed 128 characters!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                block
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form.Item>

            <div className="text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Button type="link" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
              </p>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
