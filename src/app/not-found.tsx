'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import 'antd/dist/reset.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button
            type="primary"
            onClick={() => router.push('/')}
          >
            Back Home
          </Button>
        }
      />
    </div>
  );
}
