import React, { Suspense } from 'react';

import { BlogPosts } from '~/app/(main)/blog/BlogPosts';
import { Headline } from '~/app/(main)/Headline';
import { Photos } from '~/app/(main)/Photos';
import { Resume } from '~/app/(main)/Resume';
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

const BlogHomePageContent: React.FC = React.memo(async () => {
  const settings = await fetchSettings();
  const { heroPhotos, resume } = settings;

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
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-6 pt-6">
            <h2 className="flex items-center justify-start text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <PencilSwooshIcon className="h-5 w-5 flex-none" />
              <span className="ml-2">近期文章</span>
            </h2>
            <div>
              <BlogPosts />
            </div>
          </div>
          <aside className="space-y-10 lg:sticky lg:top-8 lg:h-fit lg:pl-16 xl:pl-20">
            {resume && <Resume resume={resume} />}
          </aside>
        </div>
      </Container>
    </>
  );
});

// Add a display name to the component
BlogHomePageContent.displayName = 'BlogHomePageContent';

const BlogHomePage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogHomePageContent />
    </Suspense>
  );
};

export default BlogHomePage;

export const revalidate = 60;