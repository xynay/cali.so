"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect } from 'react';

import { ThemeProvider } from '~/app/(main)/ThemeProvider';
import { zhCN } from '~/lib/clerkLocalizations';
import { sansFont } from '~/lib/font';

// 动态加载 CSS 的函数
const loadCSS = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print'; // 设置为 print 以避免阻塞渲染
  link.onload = () => {
    link.media = 'all'; // 加载完成后设置为 all
  };
  document.head.appendChild(link);
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 在组件挂载时加载 CSS
    loadCSS('/globals.css');
    loadCSS('/clerk.css');
    loadCSS('/prism.css');
  }, []);

  return (
    <ClerkProvider localization={zhCN}>
      <html
        lang="zh-CN"
        className={`${sansFont.variable} m-0 h-full p-0 font-sans antialiased`}
        suppressHydrationWarning
      >
        <head>
          <link rel="preload" href="/globals.css" as="style" />
          <link rel="preload" href="/clerk.css" as="style" />
          <link rel="preload" href="/prism.css" as="style" />
        </head>
        <body className="flex h-full flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
