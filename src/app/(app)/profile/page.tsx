'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Spin,
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface User {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        message.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUser();
    }
  }, [status, router]);

  const handleUpdateProfile = async (values: User) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      message.success('Profile updated successfully');
      setUser(values);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };

  const handleUpdatePassword = async (values: PasswordForm) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      message.success('Password updated successfully');
      form.resetFields();
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Failed to update password');
    }
  };

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

  return (
    <div>
      <Title level={2}>Profile Settings</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Update Profile">
          <Form
            layout="vertical"
            initialValues={user || {}}
            onFinish={handleUpdateProfile}
            size="large"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" disabled />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="btn-responsive" style={{ width: '100%', maxWidth: '200px' }}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Change Password">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdatePassword}
            size="large"
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="btn-responsive" style={{ width: '100%', maxWidth: '200px' }}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
