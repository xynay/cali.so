import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';

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
          <Script
            id="load-css"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var links = [
                    '/globals.css',
                    '/clerk.css',
                    '/prism.css'
                  ];
                  links.forEach(function(href) {
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    link.media = 'print'; // 初始设置为 print 以避免阻塞渲染
                    link.onload = function() {
                      link.media = 'all'; // 加载完成后设置为 all
                    };
                    document.head.appendChild(link);
                  });
                })();
              `,
            }}
          />
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
