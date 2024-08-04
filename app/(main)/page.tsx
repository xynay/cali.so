import { type GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { memo,Suspense } from 'react';

import Headline from '~/app/(main)/Headline';
import { PencilSwooshIcon } from '~/assets';
import { Container } from '~/components/ui/Container';
import { getSettings } from '~/sanity/queries';

interface Settings {
  resume?: { 
    company: string; 
    title: string; 
    logo: string; 
    start: string; 
    end?: string; 
  }[];
}

// 动态导入 BlogPosts 组件
const BlogPosts = dynamic(() => import('~/app/(main)/blog/BlogPosts'), {
  suspense: true,
});

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = await getSettings();
  return {
    props: {
      settings: settings || {},
    },
  };
};

const BlogHomePageContent: React.FC = memo(() => {
  return (
    <>
      <Container className="mt-10">
        <Headline />
      </Container>

      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-md grid-cols-1 gap-y-20 lg:max-w-none">
          <div className="flex flex-col gap-6 pt-4 w-full items-center">
            <h2 className="flex items-center justify-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <PencilSwooshIcon className="h-5 w-5 flex-none" />
              <span className="ml-2">近期文章</span>
            </h2>
            <div className="w-full mx-auto mb-8 max-w-md">
              <BlogPosts />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
});

// Add a display name to the component
BlogHomePageContent.displayName = 'BlogHomePageContent';

// 解决 ESLint 错误，将参数命名为 `_settings`
const BlogHomePage: React.FC<{ settings: Settings }> = ({ _settings }) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loader" />
          <p>Loading...</p>
        </div>
      </div>
    }>
      <BlogHomePageContent />
    </Suspense>
  );
};

export default BlogHomePage;