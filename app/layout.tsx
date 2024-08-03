"use client"; // 使该文件作为客户端组件处理

import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';

import { ThemeProvider } from '~/app/(main)/ThemeProvider';
import { url } from '~/lib';
import { zhCN } from '~/lib/clerkLocalizations';
import { sansFont } from '~/lib/font';
import { seo } from '~/lib/seo';

// Metadata Configuration
export const metadata: Metadata = {
  metadataBase: seo.url,
  title: {
    template: '%s | 辛壬癸的命理笔记',
    default: seo.title,
  },
  description: seo.description,
  keywords: '生活记录,命理研究,杂谈,个人博客,辛壬癸,日常笔记,命运解析,生活智慧,命理学,日常生活',
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: {
      default: seo.title,
      template: '%s | Cali Castle',
    },
    description: seo.description,
    siteName: '辛壬癸的命理笔记',
    locale: 'zh_CN',
    type: 'website',
    url: 'https://xinrengui.eu.org',
  },
  twitter: {
    site: '@thecalicastle',
    creator: '@thecalicastle',
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
  alternates: {
    canonical: url('/'),
    types: {
      'application/rss+xml': [{ url: 'rss', title: 'RSS 订阅' }],
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000212' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
}

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
