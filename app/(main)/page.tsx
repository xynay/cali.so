// pages/index.tsx

import React from 'react';

import { GetStaticProps } from 'next';
import { BlogPosts } from '~/app/(main)/blog/BlogPosts';
import { Headline } from '~/app/(main)/Headline';
import { Photos } from '~/app/(main)/Photos';
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

interface BlogHomePageProps {
  settings: Settings;
}

const BlogHomePage: React.FC<BlogHomePageProps> = ({ settings }) => {
  const { heroPhotos } = settings;

  return (
    <>
      <Container className="mt-10">
        <Headline />
      </Container>

      {heroPhotos && (
        <Container>
          <Photos photos={heroPhotos} />
        </Container>
      )}

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

export const getStaticProps: GetStaticProps = async () => {
  try {
    const settings = await getSettings();
    return {
      props: {
        settings: settings || {},
      },
      revalidate: 60, // Revalidate at most once every minute
    };
  } catch (error) {
    console.error('Failed to fetch settings', error);
    return {
      props: {
        settings: {},
      },
    };
  }
};

export default BlogHomePage;