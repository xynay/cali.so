"use client";

import React, { useEffect, useState } from 'react';
import { getLatestBlogPosts } from '~/sanity/queries';
import { BlogPostCard } from './BlogPostCard';

const BlogPosts = React.memo(({ limit = 5 }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await getLatestBlogPosts({ limit, forDisplay: true }) || [];
      setPosts(fetchedPosts);
    };

    fetchPosts().catch(error => {
      console.error('Failed to fetch posts:', error);
    });
  }, [limit]);

  return (
    <>
      {posts.map((post) => (
        <BlogPostCard post={post} key={post._id} />
      ))}
    </>
  );
});

export default BlogPosts;