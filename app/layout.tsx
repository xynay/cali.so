"use client"; // 使该文件作为客户端组件处理

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect } from 'react';

import { ThemeProvider } from '~/app/(main)/ThemeProvider';
import { zhCN } from '~/lib/clerkLocalizations';
import { sansFont } from '~/lib/font';

// 导入 metadata 和 viewport

const loadCSS = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadCSS('./globals.css');
    loadCSS('./clerk.css');
    loadCSS('./prism.css');
  }, []);

  return (
    <ClerkProvider localization={zhCN}>
      <html
        lang="zh-CN"
        className={`${sansFont.variable} m-0 h-full p-0 font-sans antialiased`}
        suppressHydrationWarning
      >
        <head>
          {/* Removed the preload link for 1.woff2 */}
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