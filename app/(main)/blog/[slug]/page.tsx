import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage';
import { kvKeys } from '~/config/kv';
import { env } from '~/env.mjs';
import { url } from '~/lib';
import { redis } from '~/lib/redis';
import { getBlogPost } from '~/sanity/queries';

export const generateMetadata = async ({ params }: { params: { slug: string } }) => {
  const post = await getBlogPost(params.slug);
  if (!post) {
    return notFound();
  }

  const { title, description, mainImage } = post;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: mainImage.asset.url }],
      type: 'article',
    },
    twitter: {
      images: [{ url: mainImage.asset.url }],
      title,
      description,
      card: 'summary_large_image',
      site: '@thecalicastle',
      creator: '@thecalicastle',
    },
  } satisfies Metadata;
};

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) {
    return notFound();
  }

  const views = env.VERCEL_ENV === 'production' 
    ? await redis.incr(kvKeys.postViews(post._id)) 
    : 30578;

  let reactions: number[] = [];
  if (env.VERCEL_ENV === 'production') {
    try {
      const res = await fetch(url(`/api/reactions?id=${post._id}`), {
        next: { tags: [`reactions:${post._id}`] },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        reactions = data;
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    reactions = Array.from({ length: 4 }, () => Math.floor(Math.random() * 50000));
  }

  const relatedViews: number[] = post.related?.length 
    ? env.VERCEL_ENV === 'development'
      ? post.related.map(() => Math.floor(Math.random() * 1000))
      : await redis.mget<number[]>(...post.related.map(({ _id }) => kvKeys.postViews(_id)))
    : [];

  return (
    <BlogPostPage
      post={post}
      views={views}
      relatedViews={relatedViews}
      reactions={reactions.length ? reactions : undefined}
    />
  );
}

export const revalidate = 60;