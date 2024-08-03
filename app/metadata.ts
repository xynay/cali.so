// app/metadata.ts

import type { Metadata, Viewport } from 'next';
import { url } from '~/lib';
import { seo } from '~/lib/seo';

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