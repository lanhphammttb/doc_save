'use client';

import { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f5'
    }}>
      <Result
        status="error"
        title="Something went wrong!"
        subTitle={error.message || 'An unexpected error occurred'}
        extra={[
          <Button
            type="primary"
            key="retry"
            onClick={() => reset()}
          >
            Try Again
          </Button>,
          <Button
            key="home"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        ]}
      />
    </div>
  );
}
