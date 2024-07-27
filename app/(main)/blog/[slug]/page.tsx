import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { getBlogPost } from '~/sanity/queries'
import { url } from '~/lib'

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  const { title, description, mainImage } = post

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      type: 'article',
    },
    twitter: {
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      title,
      description,
      card: 'summary_large_image',
      site: '@thecalicastle',
      creator: '@thecalicastle',
    },
  } satisfies Metadata
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  // 直接从数据库或其他存储获取 views 数据
  let views: number = 30578 // 示例数据，替换为实际获取逻辑

  // 直接从数据库或其他存储获取 reactions 数据
  let reactions: number[] = []
  try {
    const res = await fetch(url(`/api/reactions?id=${post._id}`), {
      next: {
        tags: [`reactions:${post._id}`],
      },
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      reactions = data
    }
  } catch (error) {
    console.error(error)
  }

  // 直接从数据库或其他存储获取 relatedViews 数据
  let relatedViews: number[] = []
  if (typeof post.related !== 'undefined' && post.related.length > 0) {
    relatedViews = post.related.map(() => Math.floor(Math.random() * 1000)) // 示例数据，替换为实际获取逻辑
  }

  return (
    <BlogPostPage
      post={post}
      views={views}
      relatedViews={relatedViews}
      reactions={reactions.length > 0 ? reactions : undefined}
    />
  )
}

export const revalidate = 60