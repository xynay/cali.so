import { env } from '~/env.mjs';
import { getLatestBlogPosts } from '~/sanity/queries';

import { BlogPostCard } from './BlogPostCard';

export async function BlogPosts({ limit = 5 }) {
  const posts = await getLatestBlogPosts({ limit, forDisplay: true }) || [];

  const views = posts.map(() =>
    env.VERCEL_ENV === 'development' ? Math.floor(Math.random() * 1000) : 0
  );

  return (
    <>
      {posts.map((post, idx) => (
        <BlogPostCard post={post} views={views[idx]} key={post._id} />
      ))}
    </>
  );
}
