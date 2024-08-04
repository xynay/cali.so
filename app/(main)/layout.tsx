import './blog/[slug]/blog.css';

import { Analytics } from '@vercel/analytics/react';
import { memo,Suspense } from 'react';

import { Footer } from '~/app/(main)/Footer';
import { Header } from '~/app/(main)/Header';
import { QueryProvider } from '~/app/QueryProvider';

const Background = () => (
  <>
    <div className="pointer-events-none fixed inset-0 select-none bg-[url('/grid-black.svg')] bg-top bg-repeat dark:bg-[url('/grid.svg')]" />
    <span className="pointer-events-none fixed top-0 block h-[800px] w-full select-none bg-[radial-gradient(103.72%_46.58%_at_50%_0%,rgba(5,5,5,0.045)_0%,rgba(0,0,0,0)_100%)] dark:bg-[radial-gradient(103.72%_46.58%_at_50%_0%,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0)_100%)]" />
    <div className="fixed inset-0 flex justify-center sm:px-8">
      <div className="flex w-full max-w-7xl lg:px-8">
        <div className="w-full bg-zinc-50/90 ring-1 ring-zinc-100 dark:bg-zinc-900/80 dark:ring-zinc-400/20" />
      </div>
    </div>
  </>
);

const BlogLayout = memo(function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Background />
      <QueryProvider>
        <div className="relative text-zinc-800 dark:text-zinc-200">
          <Header />
          <main>{children}</main>
          <Suspense fallback={<div>Loading...</div>}>
            <Footer />
          </Suspense>
        </div>
      </QueryProvider>
      <Analytics />
    </>
  );
});

export default BlogLayout;