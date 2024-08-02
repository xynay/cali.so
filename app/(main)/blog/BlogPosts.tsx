import { getLatestBlogPosts } from '~/sanity/queries';

import { BlogPostCard } from './BlogPostCard';

export async function BlogPosts({ limit = 5 }) {
  const posts = await getLatestBlogPosts({ limit, forDisplay: true }) || [];

  return (
    <>
      {posts.map((post) => (
        <BlogPostCard post={post} key={post._id} />
      ))}
    </>
  );
}