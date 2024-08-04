"use client";

import dynamic from 'next/dynamic';
import React, { memo, Suspense, useEffect, useState } from 'react';

import Headline from '~/app/(main)/Headline';
import { PencilSwooshIcon } from '~/assets';
import { Container } from '~/components/ui/Container';
import { getSettings } from '~/sanity/queries';

// 动态导入 BlogPosts 组件
const BlogPosts = dynamic(() => import('~/app/(main)/blog/BlogPosts'), {
  suspense: true,
});

const BlogHomePageContent: React.FC = memo(() => (
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
));

BlogHomePageContent.displayName = 'BlogHomePageContent';

const BlogHomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsData = await getSettings();
        console.log(settingsData);
      } catch (error) {
        console.error('Failed to fetch settings', error);
        setError('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };

    // 使用void操作符来忽略Promise的返回值
    void fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <BlogHomePageContent />
    </Suspense>
  );
};

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="loader" />
      <p>Loading...</p>
    </div>
  </div>
);

const ErrorScreen = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p>{error}</p>
    </div>
  </div>
);

export default BlogHomePage;