"use client"

import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { redis } from '~/lib/redis'
import { getLatestBlogPosts } from '~/sanity/queries'

import { BlogPostCard } from './BlogPostCard'
import { useEffect, useState } from 'react'

// 获取博客文章的函数
const fetchBlogPosts = async (limit: number) => {
  const posts = await getLatestBlogPosts({ limit, forDisplay: true }) || []
  const postIdKeys = posts.map(({ _id }) => kvKeys.postViews(_id))

  let views: number[] = []
  if (env.VERCEL_ENV === 'development') {
    views = posts.map(() => Math.floor(Math.random() * 1000))
  } else {
    if (postIdKeys.length > 0) {
      views = await redis.mget<number[]>(...postIdKeys)
    }
  }

  return { posts, views }
}

export function BlogPosts({ limit = 5 }) {
  const [posts, setPosts] = useState([])
  const [views, setViews] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const { posts, views } = await fetchBlogPosts(limit)
      setPosts(posts)
      setViews(views)
    }
    loadData()
  }, [limit])

  return (
    <>
      {posts.length === 0 ? (
        // 显示骨架屏占位符
        Array.from({ length: limit }).map((_, idx) => (
          <BlogPostCardSkeleton key={idx} />
        ))
      ) : (
        posts.map((post, idx) => (
          <BlogPostCard post={post} views={views[idx] ?? 0} key={post._id} />
        ))
      )}
    </>
  )
}

// 骨架屏组件
const BlogPostCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-title"></div>
    <div className="skeleton-content"></div>
  </div>
)