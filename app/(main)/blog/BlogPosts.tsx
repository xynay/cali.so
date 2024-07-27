import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { redis } from '~/lib/redis'
import { getLatestBlogPosts } from '~/sanity/queries'

import { BlogPostCard } from './BlogPostCard'

export async function BlogPosts({ limit = 5 }) {
  // 获取博客文章
  const posts = await getLatestBlogPosts({ limit, forDisplay: true }) || []

  // 提前获取视图数据
  const postIdKeys = posts.map(({ _id }) => kvKeys.postViews(_id))

  // 使用缓存的视图数据或随机生成数据
  let views: number[] = []
  if (env.VERCEL_ENV === 'development') {
    views = posts.map(() => Math.floor(Math.random() * 1000))
  } else {
    // 批量获取视图数据
    if (postIdKeys.length > 0) {
      views = await redis.mget<number[]>(...postIdKeys)
    } else {
      views = []
    }
  }

  // 渲染组件
  return (
    <>
      {posts.length === 0 ? (
        <p>No blog posts available</p> // 如果没有博客文章，显示一条信息
      ) : (
        posts.map((post, idx) => (
          <BlogPostCard post={post} views={views[idx] ?? 0} key={post._id} />
        ))
      )}
    </>
  )
}