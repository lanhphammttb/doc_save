'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Select, Upload, message } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;
const { TextArea } = Input;

interface DocumentForm {
  title: string;
  type: 'text' | 'file' | 'link';
  topic: string;
  category: string;
  content?: string;
  file?: File;
  link?: string;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [documentType, setDocumentType] = useState<'text' | 'file' | 'link'>('text');

  const handleSubmit = async (values: DocumentForm) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('type', values.type);
      formData.append('topic', values.topic);
      formData.append('category', values.category);

      if (values.type === 'text') {
        formData.append('content', values.content || '');
      } else if (values.type === 'file' && values.file) {
        formData.append('file', values.file);
      } else if (values.type === 'link') {
        formData.append('link', values.link || '');
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      message.success('Document created successfully');
      router.push('/documents');
    } catch (error) {
      console.error('Error creating document:', error);
      message.error('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value: 'text' | 'file' | 'link') => {
    setDocumentType(value);
    form.setFieldsValue({
      content: undefined,
      file: undefined,
      link: undefined,
    });
    setFileList([]);
  };

  return (
    <div>
      <Card title="Create New Document" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ type: 'text' }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter document title" />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select onChange={handleTypeChange}>
              <Option value="text">Text</Option>
              <Option value="file">File</Option>
              <Option value="link">Link</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Topic"
            name="topic"
            rules={[{ required: true, message: 'Please enter a topic' }]}
          >
            <Input placeholder="Enter document topic" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please enter a category' }]}
          >
            <Input placeholder="Enter document category" />
          </Form.Item>

          {documentType === 'text' && (
            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message: 'Please enter content' }]}
            >
              <TextArea
                placeholder="Enter document content"
                rows={6}
              />
            </Form.Item>
          )}

          {documentType === 'file' && (
            <Form.Item
              label="File"
              name="file"
              rules={[{ required: true, message: 'Please upload a file' }]}
            >
              <Upload
                beforeUpload={(file) => {
                  setFileList([file]);
                  form.setFieldsValue({ file });
                  return false;
                }}
                fileList={fileList}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
          )}

          {documentType === 'link' && (
            <Form.Item
              label="Link"
              name="link"
              rules={[
                { required: true, message: 'Please enter a link' },
                { type: 'url', message: 'Please enter a valid URL' },
              ]}
            >
              <Input
                placeholder="Enter URL"
                prefix={<LinkOutlined />}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Create Document
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}