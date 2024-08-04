"use client";

import dynamic from 'next/dynamic';
import React, { memo, Suspense, useEffect, useState } from 'react';

import Headline from '~/app/(main)/Headline';
import { PencilSwooshIcon } from '~/assets';
import { Container } from '~/components/ui/Container';
import { getSettings } from '~/sanity/queries';

// 动态引入 BlogPosts
const BlogPosts = dynamic(() => import('~/app/(main)/blog/BlogPosts'), {
  suspense: true,
});

// BlogHomePageContent 组件
const BlogHomePageContent: React.FC = memo(() => (
  <Container className="mt-10">
    <Headline />
    <Container className="mt-24 md:mt-28">
      <div className="mx-auto grid max-w-md grid-cols-1 gap-y-20 lg:max-w-none">
        <div className="flex flex-col gap-6 pt-4 w-full items-center">
          <h2 className="flex items-center justify-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <PencilSwooshIcon className="h-5 w-5 flex-none" />
            <span className="ml-2">近期文章</span>
          </h2>
          <div className="w-full mx-auto mb-8 max-w-md">
            <Suspense fallback={<BlogPostsSkeleton />}>
              <BlogPosts />
            </Suspense>
          </div>
        </div>
      </div>
    </Container>
  </Container>
));

BlogHomePageContent.displayName = 'BlogHomePageContent';

// BlogHomePage 组件
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

    void fetchData(); // 确保 Promise 被正确处理
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  return <BlogHomePageContent />;
};

// LoadingScreen 组件
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="loader" />
      <p>Loading...</p>
    </div>
  </div>
);

// ErrorScreen 组件
const ErrorScreen = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p>{error}</p>
    </div>
  </div>
);

// BlogPostsSkeleton 组件
const BlogPostsSkeleton = () => (
  <div className="w-full mx-auto mb-8 max-w-md animate-pulse">
    <div className="h-6 bg-gray-300 rounded mb-4"></div>
    <div className="h-6 bg-gray-300 rounded mb-4"></div>
    <div className="h-6 bg-gray-300 rounded mb-4"></div>
  </div>
);

export default BlogHomePage;