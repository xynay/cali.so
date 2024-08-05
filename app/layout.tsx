import './globals.css';
import './clerk.css';

import { ClerkProvider } from '@clerk/nextjs';
import { count, isNotNull } from 'drizzle-orm';
import type { Metadata, Viewport } from 'next';

import Footer from '~/app/(main)/Footer'; // 修正导入
import { ThemeProvider } from '~/app/(main)/ThemeProvider';
import { db } from '~/db';
import { subscribers } from '~/db/schema';
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
      template: '%s | 辛壬癸的命理笔记',
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000212' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
};

export async function getServerSideProps() {
  const subs = await db
    .select({
      subCount: count(),
    })
    .from(subscribers)
    .where(isNotNull(subscribers.subscribedAt));

  return {
    props: {
      subCount: subs[0]?.subCount ?? '0',
    },
  };
}

const Page = ({ subCount }) => {
  return (
    <div>
      <Footer subCount={subCount} />
    </div>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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