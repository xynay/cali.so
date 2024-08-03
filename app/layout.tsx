"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '~/app/(main)/ThemeProvider';
import { zhCN } from '~/lib/clerkLocalizations';
import { sansFont } from '~/lib/font';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <link rel="stylesheet" href="/globals.css" />
          <link rel="stylesheet" href="/clerk.css" />
          <link rel="stylesheet" href="/prism.css" />
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
