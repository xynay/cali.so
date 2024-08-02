"use client";

import React, { Suspense, useEffect, useState } from 'react';

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

const fetchSettings = async (): Promise<Settings> => {
  try {
    const settings = await getSettings();
    return settings || {};
  } catch (error) {
    console.error('Failed to fetch settings', error);
    return {};
  }
};

const BlogHomePageContent: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const fetchedSettings = await fetchSettings();
      setSettings(fetchedSettings);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const { heroPhotos } = settings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loader" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
      <BlogHomePageContent />
    </Suspense>
  );
};

export default BlogHomePage;

export const revalidate = 60;