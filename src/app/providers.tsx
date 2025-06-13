'use client';

import { SessionProvider } from 'next-auth/react';
import { ConfigProvider, theme } from 'antd';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
            fontFamily: 'inherit',
          },
          components: {
            Button: {
              borderRadius: 6,
            },
            Card: {
              borderRadius: 8,
            },
            Input: {
              borderRadius: 6,
            },
            Select: {
              borderRadius: 6,
            },
          },
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </SessionProvider>
  );
}
