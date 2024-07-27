import { env } from '~/env.mjs'
import { getBlogPost } from '~/sanity/queries'

import { BlogPostCard } from '../BlogPostCard'

type Params = { params: { slug: string } }

export default async function Page({ params }: Params) {
  const { slug } = params

  // 获取博客文章
  const post = await getBlogPost(slug)

  // 使用缓存的视图数据或随机生成数据
  const views = env.VERCEL_ENV === 'development'
    ? Array.from({ length: 1 }, () => Math.floor(Math.random() * 1000)) // 生成一个视图数
    : Array.from({ length: 1 }, () => Math.floor(Math.random() * 1000)) // 替代真实数据

  // 渲染组件
  return (
    <div>
      {post ? (
        <BlogPostCard post={post} views={views[0]} key={post._id} />
      ) : (
        <p>Post not found</p> // 如果没有找到博客文章，显示一条信息
      )}
    </div>
  )
}