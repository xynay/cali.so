'use client'

import { QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 数据过期时间，5分钟
        cacheTime: 1000 * 60 * 10, // 缓存时间，10分钟
        refetchOnWindowFocus: false, // 禁用窗口聚焦时重新获取数据
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}