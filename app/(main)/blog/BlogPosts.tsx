import { useMemo } from 'react';

import { env } from '~/env.mjs';
import { getLatestBlogPosts } from '~/sanity/queries';

import { BlogPostCard } from './BlogPostCard';

export async function BlogPosts({ limit = 5 }) {
  const fetchedPosts = await getLatestBlogPosts({ limit, forDisplay: true }) || [];

  const posts = useMemo(() => fetchedPosts, [fetchedPosts]);

  const views = useMemo(() => 
    posts.map(() =>
      env.VERCEL_ENV === 'development' ? Math.floor(Math.random() * 1000) : 0
    ),
    [posts]
  );

  return (
    <>
      {posts.map((post, idx) => (
        <BlogPostCard post={post} views={views[idx]} key={post._id} />
      ))}
    </>
  );
}