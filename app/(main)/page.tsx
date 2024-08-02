import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

import { Headline } from '~/app/(main)/Headline';
import { PencilSwooshIcon } from '~/assets';
import { Container } from '~/components/ui/Container';
import { getSettings } from '~/sanity/queries';

interface Settings {
  heroPhotos?: string[];
  resume?: { 
    company: string; 
    title: string; 
    logo: string; 
    start: string; 
    end?: string; 
  }[];
}

// 动态导入 BlogPosts 和 Photos 组件
const BlogPosts = dynamic(() => import('~/app/(main)/blog/BlogPosts'));
//const Photos = dynamic(() => import('~/app/(main)/Photos'));

const fetchSettings = async (): Promise<Settings> => {
  try {
    const settings = await getSettings();
    return settings || {};
  } catch (error) {
    console.error('Failed to fetch settings', error);
    return {};
  }
};

const SettingsServerComponent: React.FC = async () => {
  const _settings = await fetchSettings();
  return <BlogHomePageContent settings={_settings} />;
};

const BlogHomePageContent: React.FC<{ settings: Settings }> = ({ settings }) => {
  // const { heroPhotos } = settings;

  return (
    <>
      <Container className="mt-10">
        <Headline />
      </Container>

      {/* {heroPhotos && (
        <Container>
          <Photos photos={heroPhotos} />
        </Container>
      )} */}

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
};

// Add a display name to the component
BlogHomePageContent.displayName = 'BlogHomePageContent';

const BlogHomePage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loader" />
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SettingsServerComponent />
    </Suspense>
  );
};

export default BlogHomePage;
